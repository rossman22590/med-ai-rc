// lib/user-utils.ts
'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

// This function ensures the user exists in the database and returns their internal ID
export async function ensureUserInDatabase() {
  try {
    // Use auth() instead of currentUser()
    const { userId: clerkId } = auth();
    
    if (!clerkId) {
      return null;
    }
    
    // Look up the internal user ID (UUID) from the users table using Clerk ID
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId)
    });
    
    // If the user doesn't exist in our database yet, return null
    // (The user should be created elsewhere, e.g., when they sign up)
    if (!userResults.length) {
      return null;
    }
    
    // Return the existing user's ID
    return userResults[0].id;
  } catch (error) {
    console.error('Error ensuring user in database:', error);
    return null;
  }
}

// // lib/user-utils.ts
// 'use server';

// import { db } from '@/lib/db';
// import { users } from '@/lib/db/schema';
// import { eq } from 'drizzle-orm';
// import { currentUser } from '@clerk/nextjs';

// // This function ensures the user exists in the database and returns their internal ID
// export async function ensureUserInDatabase() {
//   try {
//     // Get the authenticated user directly from Clerk
//     const user = await currentUser();
    
//     if (!user) {
//       return null;
//     }
    
//     // Look up the internal user ID (UUID) from the users table using Clerk ID
//     const userResults = await db.query.users.findMany({
//       where: eq(users.clerkId, user.id)
//     });
    
//     // If the user doesn't exist in our database yet, create them
//     if (!userResults.length) {
//       // Get the user's email
//       const email = user.emailAddresses[0]?.emailAddress || 'unknown@example.com';
      
//       // Get the user's name
//       const userName = user.firstName + (user.lastName ? ` ${user.lastName}` : '') || 'User';
      
//       // Create the user
//       const [newUser] = await db.insert(users)
//         .values({
//           clerkId: user.id,
//           email: email,
//           name: userName,
//         })
//         .returning();
        
//       return newUser.id;
//     }
    
//     // Return the existing user's ID
//     return userResults[0].id;
//   } catch (error) {
//     console.error('Error ensuring user in database:', error);
//     return null;
//   }
// }
