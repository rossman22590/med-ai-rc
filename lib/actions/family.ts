// lib/actions/family.ts
'use server';

import { db } from '@/lib/db';
import { familyMembers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function getFamilyMembers() {
  try {
    // Use currentUser() directly
    const user = await currentUser();
    
    if (!user) {
      return [];
    }
    
    // Look up the internal user ID from the users table using Clerk ID
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, user.id)
    });
    
    // If the user doesn't exist in our database yet, return empty array
    if (!userResults.length) {
      return [];
    }
    
    const internalUserId = userResults[0].id;
    
    // Query family members using the user's ID
    const members = await db.query.familyMembers.findMany({
      where: eq(familyMembers.userId, internalUserId)
    });
    
    return members;
  } catch (error) {
    console.error('Error fetching family members:', error);
    return [];
  }
}

export async function addFamilyMember(name: string, relation: string) {
  try {
    // Use currentUser() directly
    const user = await currentUser();
    
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    // Look up the internal user ID from the users table using Clerk ID
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, user.id)
    });
    
    // If the user doesn't exist in our database yet, create a new record
    let internalUserId: string;
    
    if (!userResults.length) {
      // Get the user's email
      const email = user.emailAddresses[0]?.emailAddress || 'unknown@example.com';
      
      // Get the user's name
      const userName = user.firstName + (user.lastName ? ` ${user.lastName}` : '') || 'User';
      
      const [newUser] = await db.insert(users)
        .values({
          clerkId: user.id,
          email: email,
          name: userName,
        })
        .returning();
        
      internalUserId = newUser.id;
    } else {
      internalUserId = userResults[0].id;
    }
    
    // Add the family member with the correct UUID
    const [member] = await db.insert(familyMembers)
      .values({
        userId: internalUserId,
        name,
        relation,
      })
      .returning();
    
    return member;
  } catch (error) {
    console.error('Error adding family member:', error);
    throw error;
  }
}

export async function deleteFamilyMember(id: string) {
  try {
    // Use currentUser() directly
    const user = await currentUser();
    
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    // Look up the internal user ID from the users table using Clerk ID
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, user.id)
    });
    
    if (!userResults.length) {
      throw new Error('User not found');
    }
    
    const internalUserId = userResults[0].id;
    
    // Verify ownership before deleting
    const memberToDelete = await db.query.familyMembers.findFirst({
      where: (members) => 
        eq(members.id, id) && 
        eq(members.userId, internalUserId)
    });
    
    if (!memberToDelete) {
      throw new Error('Family member not found or not authorized to delete');
    }
    
    // Delete the family member
    await db.delete(familyMembers)
      .where(eq(familyMembers.id, id));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting family member:', error);
    throw error;
  }
}


// // lib/actions/family.ts
// 'use server';

// import { auth } from '@/lib/auth';
// import { db } from '@/lib/db';
// import { familyMembers } from '@/lib/db/schema';
// import { eq } from 'drizzle-orm';

// export async function getFamilyMembers() {
//   const session = await auth();
  
//   if (!session?.user?.id) {
//     return [];
//   }
  
//   try {
//     const members = await db.query.familyMembers.findMany({
//       where: eq(familyMembers.userId, session.user.id)
//     });
    
//     return members || [];
//   } catch (error) {
//     console.error('Error fetching family members:', error);
//     return [];
//   }
// }

// export async function addFamilyMember(name: string, relation: string) {
//   const session = await auth();
  
//   if (!session?.user?.id) {
//     throw new Error('Unauthorized');
//   }
  
//   try {
//     const [member] = await db.insert(familyMembers)
//       .values({
//         userId: session.user.id,
//         name,
//         relation,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       })
//       .returning();
    
//     return member;
//   } catch (error) {
//     console.error('Error adding family member:', error);
//     throw new Error('Failed to add family member');
//   }
// }

// // Add the missing deleteFamilyMember function
// export async function deleteFamilyMember(id: string) {
//   const session = await auth();
  
//   if (!session?.user?.id) {
//     throw new Error('Unauthorized');
//   }
  
//   try {
//     await db.delete(familyMembers)
//       .where(eq(familyMembers.id, id));
    
//     return { success: true };
//   } catch (error) {
//     console.error('Error deleting family member:', error);
//     throw new Error('Failed to delete family member');
//   }
// }
