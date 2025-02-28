// lib/actions/documents.ts
'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Fetches all user documents (or some limit) using the internal UUID
 */
export async function getUserDocuments(limit?: number) {
  try {
    const session = await auth(); // Call with no request if you're in a server action
    if (!session?.user?.id) return [];

    // Clerk ID
    const clerkId = session.user.id;

    // Convert Clerk ID -> internal UUID
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId),
    });
    if (!userResults.length) return [];

    const userId = userResults[0].id;

    // Query documents
    const userDocs = await db.query.documents.findMany({
      where: eq(documents.userId, userId),
      orderBy: [desc(documents.createdAt)],
      limit: limit,
    });
    return userDocs;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

/**
 * Delete a document owned by the user, referencing internal UUID.
 */
export async function deleteDocument(documentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Clerk ID -> internal UUID
    const clerkId = session.user.id;
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId),
    });
    if (!userResults.length) throw new Error('User record not found');
    const internalUserId = userResults[0].id;

    // Check ownership
    const [doc] = await db.query.documents.findMany({
      where: eq(documents.id, documentId),
    });
    if (!doc) throw new Error('Document not found');
    if (doc.userId !== internalUserId) {
      throw new Error('Not your document');
    }

    // Delete
    await db.delete(documents).where(eq(documents.id, documentId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// // lib/actions/documents.ts
// 'use server';

// import { auth } from '@/lib/auth';
// import { db } from '@/lib/db';
// import { documents, users } from '@/lib/db/schema';
// import { eq, desc } from 'drizzle-orm';

// // This function MUST exist and be exported
// export async function getUserDocuments() {
//   try {
//     const session = await auth();
    
//     if (!session?.user?.id) {
//       return [];
//     }
    
//     // Get Clerk ID
//     const clerkId = session.user.id;
    
//     // First, find the internal UUID for this user
//     const userResults = await db.query.users.findMany({
//       where: eq(users.clerkId, clerkId)
//     });
    
//     // If user not found, return empty array
//     if (!userResults.length) {
//       console.log(`User not found in database: ${clerkId}`);
//       return [];
//     }
    
//     // Get the internal UUID
//     const internalUserId = userResults[0].id;
    
//     // Use internal UUID for the query
//     const userDocuments = await db.query.documents.findMany({
//       where: eq(documents.userId, internalUserId),
//       orderBy: [desc(documents.createdAt)]
//     });
    
//     return userDocuments || [];
//   } catch (error) {
//     console.error('Error fetching documents:', error);
//     return [];
//   }
// }

// // lib/actions/documents.ts
// 'use server';

// import { auth } from '@/lib/auth';
// import { db } from '@/lib/db';
// import { documents } from '@/lib/db/schema';
// import { eq, desc } from 'drizzle-orm';

// // Get user documents
// export async function getUserDocuments(limit?: number) {
//   try {
//     // Properly await the auth function
//     const session = await auth();
    
//     if (!session?.user) {
//       return [];
//     }
    
//     const docs = await db.query.documents.findMany({
//       where: eq(documents.userId, session.user.id),
//       orderBy: [desc(documents.createdAt)],
//       limit: limit
//     });
    
//     return docs || [];
//   } catch (error) {
//     console.error('Error fetching documents:', error);
//     return [];
//   }
// }

// // Get document by ID
// export async function getDocumentById(id: string) {
//   try {
//     // Properly await the auth function
//     const session = await auth();
    
//     if (!session?.user) {
//       return null;
//     }
    
//     const docs = await db.query.documents.findMany({
//       where: eq(documents.id, id)
//     });
    
//     // Only return the document if it belongs to the current user
//     const doc = docs[0];
//     if (doc && doc.userId === session.user.id) {
//       return doc;
//     }
    
//     return null;
//   } catch (error) {
//     console.error('Error fetching document:', error);
//     return null;
//   }
// }

// // Delete a document
// export async function deleteDocument(id: string) {
//   try {
//     // Properly await the auth function
//     const session = await auth();
    
//     if (!session?.user) {
//       throw new Error('Unauthorized');
//     }
    
//     await db.delete(documents)
//       .where(eq(documents.id, id));
    
//     return { success: true };
//   } catch (error) {
//     console.error('Document delete error:', error);
//     throw new Error('Failed to delete document');
//   }
// }
