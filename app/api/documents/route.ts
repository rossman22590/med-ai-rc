// app/api/documents/route.ts
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, documents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Create a custom auth function that doesn't use headers directly
    const session = getAuth(request);
    const userId = session.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, userId)
    });
    
    if (!userResults.length) {
      return NextResponse.json({ documents: [] });
    }
    
    const internalUserId = userResults[0].id;
    
    const userDocs = await db.query.documents.findMany({
      where: eq(documents.userId, internalUserId)
    });
    
    return NextResponse.json({ documents: userDocs });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}



// // app/api/documents/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { auth as clerkAuth } from "@clerk/nextjs/server";
// import { db } from '@/lib/db';
// import { documents } from '@/lib/db/schema';
// import { eq, desc } from 'drizzle-orm';
// // import { nanoid } from 'nanoid';

// export async function GET() {
//   try {
//     // Check authentication directly
//     const authResult = await clerkAuth();
//     const userId = authResult.userId;
    
//     if (!userId) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }
    
//     // Get the user's documents from the database
//     const docs = await db.query.documents.findMany({
//       where: eq(documents.userId, userId),
//       orderBy: [desc(documents.createdAt)]
//     });
    
//     // Return the documents
//     return NextResponse.json({ documents: docs });
//   } catch (error) {
//     console.error('Error fetching documents:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch documents: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Check authentication directly
//     const authResult = await clerkAuth();
//     const userId = authResult.userId;
    
//     if (!userId) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }
    
//     // Parse the request body
//     const { name, type, url } = await request.json();
    
//     if (!name || !type || !url) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }
    
//     // Save to database with generated ID
//     const [document] = await db.insert(documents)
//       .values({
//         userId,
//         name,
//         type,
//         url,
//         contentText: null,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       })
//       .returning();
    
//     return NextResponse.json({ document });
//   } catch (error) {
//     console.error('Error creating document:', error);
//     return NextResponse.json(
//       { error: 'Failed to create document: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// // app/api/documents/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { auth as clerkAuth } from "@clerk/nextjs/server";
// import { db } from '@/lib/db';
// import { documents } from '@/lib/db/schema';
// import { eq, desc } from 'drizzle-orm';
// import { nanoid } from 'nanoid';

// export async function GET(request: NextRequest) {
//   try {
//     // Check authentication directly
//     const authResult = await clerkAuth();
//     const userId = authResult.userId;
    
//     if (!userId) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }
    
//     // Get the user's documents from the database
//     const docs = await db.query.documents.findMany({
//       where: eq(documents.userId, userId),
//       orderBy: [desc(documents.createdAt)]
//     });
    
//     // Return the documents
//     return NextResponse.json({ documents: docs });
//   } catch (error) {
//     console.error('Error fetching documents:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch documents: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Check authentication directly
//     const authResult = await clerkAuth();
//     const userId = authResult.userId;
    
//     if (!userId) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }
    
//     // Parse the request body
//     const { name, type, url } = await request.json();
    
//     if (!name || !type || !url) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }
    
//     // Generate ID if not provided
//     const id = nanoid();
    
//     // Save to database
//     const [document] = await db.insert(documents)
//       .values({
//         id,
//         userId,
//         name,
//         type,
//         url,
//         contentText: null,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       })
//       .returning();
    
//     return NextResponse.json({ document });
//   } catch (error) {
//     console.error('Error creating document:', error);
//     return NextResponse.json(
//       { error: 'Failed to create document: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
