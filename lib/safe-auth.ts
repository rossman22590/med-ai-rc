// lib/safe-auth.ts
import { auth as clerkAuth, currentUser as clerkCurrentUser } from '@clerk/nextjs';

// Safe version of auth() that properly handles headers
export async function safeAuth() {
  try {
    return await clerkAuth();
  } catch (error) {
    console.error('Error in safeAuth:', error);
    throw error;
  }
}

// Safe version of currentUser() that properly handles headers
export async function safeCurrentUser() {
  try {
    return await clerkCurrentUser();
  } catch (error) {
    console.error('Error in safeCurrentUser:', error);
    throw error;
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
