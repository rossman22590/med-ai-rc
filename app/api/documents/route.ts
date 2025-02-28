// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { db } from '@/lib/db';
import { documents, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Check authentication directly
    const authResult = await clerkAuth();
    const clerkId = authResult.userId;
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // First, look up the user by their Clerk ID to get the UUID
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId),
    });
    
    if (!userResults.length) {
      // Create the user if they don't exist in our database yet
      const [newUser] = await db.insert(users)
        .values({
          clerkId,
          email: authResult.sessionClaims?.email as string || 'unknown@example.com',
          name: authResult.sessionClaims?.name as string || 'User',
        })
        .returning();
        
      // Now get documents using the new UUID
      const docs = await db.query.documents.findMany({
        where: eq(documents.userId, newUser.id),
        orderBy: [desc(documents.createdAt)]
      });
      
      return NextResponse.json({ documents: docs });
    }
    
    // Get the internal user ID (UUID)
    const userId = userResults[0].id;
    
    // Get the user's documents from the database using the UUID
    const docs = await db.query.documents.findMany({
      where: eq(documents.userId, userId),
      orderBy: [desc(documents.createdAt)]
    });
    
    // Return the documents
    return NextResponse.json({ documents: docs });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication directly
    const authResult = await clerkAuth();
    const clerkId = authResult.userId;
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // First, look up the user by their Clerk ID to get the UUID
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId),
    });
    
    let userId: string;
    
    if (!userResults.length) {
      // Create the user if they don't exist
      const [newUser] = await db.insert(users)
        .values({
          clerkId,
          email: authResult.sessionClaims?.email as string || 'unknown@example.com',
          name: authResult.sessionClaims?.name as string || 'User',
        })
        .returning();
        
      userId = newUser.id;
    } else {
      // Get the internal user ID (UUID)
      userId = userResults[0].id;
    }
    
    // Parse the request body
    const { name, type, url } = await request.json();
    
    if (!name || !type || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Save to database with the UUID
    const [document] = await db.insert(documents)
      .values({
        userId,
        name,
        type,
        url,
        contentText: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document: ' + (error as Error).message },
      { status: 500 }
    );
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
