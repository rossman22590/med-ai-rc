// lib/safe-auth.ts
import { currentUser } from '@clerk/nextjs';

// This function safely gets the current user without headers issues
export async function getUser() {
  try {
    return await currentUser();
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}


// // lib/safe-auth.ts
// import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server';
// import { headers } from 'next/headers';

// export async function safeAuth() {
//   try {
//     // More robust way to handle headers
//     const headersList = await headers();
    
//     // Instead of iterating through entries, just access any specific header you need
//     // For example:
//     const host = headersList.get('host');
//     const userAgent = headersList.get('user-agent');
    
//     // Or if you really need to materialize all headers, do it this way:
//     // const allHeaders = Object.fromEntries(headersList);
    
//     return await clerkAuth();
//   } catch (error) {
//     console.error('Error in safeAuth:', error);
//     throw error;
//   }
// }

// export async function safeCurrentUser() {
//   try {
//     // Same approach as above - minimal header access
//     const headersList = await headers();
    
//     // Just get a specific header you need, or omit if you don't need headers
//     const referer = headersList.get('referer');
    
//     return await currentUser();
//   } catch (error) {
//     console.error('Error in safeCurrentUser:', error);
//     throw error;
//   }
// }
