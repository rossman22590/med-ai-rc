// app/api/family/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, familyMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// DELETE /api/family/[id] - Delete a family member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    
    // Get the internal UUID
    const internalUserId = userResults[0].id;
    
    // Delete the family member, ensuring it belongs to the user
    await db.delete(familyMembers)
      .where(
        and(
          eq(familyMembers.id, params.id),
          eq(familyMembers.userId, internalUserId)
        )
      );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting family member:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete family member: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
