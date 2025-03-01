// lib/auth.ts
import { getUser } from './safe-auth';

export async function auth() {
  try {
    const clerkUser = await getUser();
    
    if (!clerkUser) {
      return { user: null };
    }
    
    return {
      user: {
        id: clerkUser.id,
        name: clerkUser.firstName + (clerkUser.lastName ? ` ${clerkUser.lastName}` : ''),
        email: clerkUser.emailAddresses[0]?.emailAddress,
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { user: null };
  }
}




// // lib/auth.ts
// import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
// import { db } from "./db";
// import { users } from "./db/schema";
// import { eq } from "drizzle-orm";

// export async function auth() {
//   try {
//     // Get the Clerk auth - properly await it
//     const authResult = await clerkAuth();
//     const userId = authResult.userId;
    
//     if (!userId) {
//       return { user: null };
//     }
    
//     // Get the user from Clerk - properly await it
//     const clerkUser = await currentUser();
    
//     if (!clerkUser) {
//       return { user: null };
//     }
    
//     // Check if user exists in our database
//     const dbUsers = await db.query.users.findMany({
//       where: eq(users.clerkId, userId)
//     });
    
//     let user = dbUsers[0];
    
//     // If user doesn't exist in our database, create them
//     if (!user) {
//       const [newUser] = await db.insert(users)
//         .values({
//           clerkId: userId,
//           email: clerkUser.emailAddresses[0].emailAddress,
//           name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         })
//         .returning();
      
//       user = newUser;
//     }
    
//     return { user };
//   } catch (error) {
//     console.error("Auth error:", error);
//     return { user: null };
//   }
// }
