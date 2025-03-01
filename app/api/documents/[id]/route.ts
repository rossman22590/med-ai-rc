// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { documents, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper function to get a document by ID
async function getDocumentHandler(request: NextRequest, documentId: string) {
  try {
    console.log(`API: Fetching document with ID: ${documentId}`);
    
    // Use getAuth with the request object
    const session = getAuth(request);
    const clerkId = session.userId;
    
    if (!clerkId) {
      console.log('API: Unauthorized - no clerk ID');
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
      console.log(`API: User not found for clerk ID: ${clerkId}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const internalUserId = userResults[0].id;
    console.log(`API: Found internal user ID: ${internalUserId}`);
    
    // Use a direct query with explicit equality checks
    const docResults = await db.select().from(documents).where(
      and(
        eq(documents.id, documentId),
        eq(documents.userId, internalUserId)
      )
    );
    
    if (!docResults.length) {
      console.log(`API: Document not found or not authorized: ${documentId}`);
      return NextResponse.json(
        { error: 'Document not found or not authorized to access' },
        { status: 404 }
      );
    }
    
    const doc = docResults[0];
    console.log(`API: Successfully fetched document: ${doc.name} (${doc.id})`);
    
    // Double-check ID match
    if (doc.id !== documentId) {
      console.error(`API: ID mismatch - Requested ${documentId} but found ${doc.id}`);
      return NextResponse.json(
        { error: 'Document ID mismatch' },
        { status: 500 }
      );
    }
    
    // Return the document
    return NextResponse.json({
      success: true,
      document: doc
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch document: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// GET handler for /api/documents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`API route called with ID: ${params.id}`);
  // Pass the request object and params.id to the handler
  return getDocumentHandler(request, params.id);
}

// DELETE handler for /api/documents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`API: Deleting document with ID: ${params.id}`);
    
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
    
    // Delete the document, ensuring it belongs to the user
    const result = await db.delete(documents)
      .where(
        and(
          eq(documents.id, params.id),
          eq(documents.userId, internalUserId)
        )
      )
      .returning();
    
    if (!result.length) {
      return NextResponse.json(
        { error: 'Document not found or not authorized to delete' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete document: ' + (error as Error).message },
      { status: 500 }
    );
  }
}



// // app/api/documents/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { documents } from '@/lib/db/schema';
// import { eq } from 'drizzle-orm';

// export async function GET(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     // Get the document ID from context
//     const documentId = context.params.id;
    
//     if (!documentId) {
//       return NextResponse.json(
//         { error: 'Document ID is required' },
//         { status: 400 }
//       );
//     }
    
//     // Get the document
//     const docs = await db.query.documents.findMany({
//       where: eq(documents.id, documentId)
//     });
    
//     if (!docs.length) {
//       return NextResponse.json(
//         { error: 'Document not found' },
//         { status: 404 }
//       );
//     }
    
//     const document = docs[0];
    
//     // Return the document
//     return NextResponse.json({ document });
//   } catch (error) {
//     console.error('Error fetching document:', error);
    
//     return NextResponse.json(
//       { error: 'Failed to fetch document: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
