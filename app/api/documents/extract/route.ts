// app/api/documents/extract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { documents, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get the document ID from the query parameter
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Use getAuth with the request object
    const session = getAuth(request);
    const clerkId = session.userId;
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // First, find the internal UUID for this user
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId)
    });
    
    // If user not found, return error
    if (!userResults.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const internalUserId = userResults[0].id;
    
    // Get the document, ensuring it belongs to the user
    const doc = await db.query.documents.findFirst({
      where: (docs) => 
        eq(docs.id, id) && 
        eq(docs.userId, internalUserId)
    });
    
    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found or not authorized to access' },
        { status: 404 }
      );
    }
    
    // Return the document content
    return NextResponse.json({
      success: true,
      content: doc.contentText || '',
      document: {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        url: doc.url,
        createdAt: doc.createdAt
      }
    });
  } catch (error) {
    console.error('Error extracting document content:', error);
    
    return NextResponse.json(
      { error: 'Failed to extract document content: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// // app/api/documents/extract/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { getAuth } from '@clerk/nextjs/server';
// import { db } from '@/lib/db';
// import { documents, users } from '@/lib/db/schema';
// import { eq } from 'drizzle-orm';

// export async function GET(request: NextRequest) {
//   try {
//     // Get the document ID from the query parameter
//     const id = request.nextUrl.searchParams.get('id');
    
//     if (!id) {
//       return NextResponse.json(
//         { error: 'Document ID is required' },
//         { status: 400 }
//       );
//     }
    
//     // Use getAuth with the request object
//     const session = getAuth(request);
//     const clerkId = session.userId;
    
//     if (!clerkId) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }
    
//     // First, find the internal UUID for this user
//     const userResults = await db.query.users.findMany({
//       where: eq(users.clerkId, clerkId)
//     });
    
//     // If user not found, return error
//     if (!userResults.length) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       );
//     }
    
//     const internalUserId = userResults[0].id;
    
//     // Get the document, ensuring it belongs to the user
//     const doc = await db.query.documents.findFirst({
//       where: (docs) => 
//         eq(docs.id, id) && 
//         eq(docs.userId, internalUserId)
//     });
    
//     if (!doc) {
//       return NextResponse.json(
//         { error: 'Document not found or not authorized to access' },
//         { status: 404 }
//       );
//     }
    
//     // Return the document content
//     return NextResponse.json({
//       success: true,
//       content: doc.contentText || '',
//       document: {
//         id: doc.id,
//         name: doc.name,
//         type: doc.type,
//         url: doc.url,
//         createdAt: doc.createdAt
//       }
//     });
//   } catch (error) {
//     console.error('Error extracting document content:', error);
    
//     return NextResponse.json(
//       { error: 'Failed to extract document content: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
