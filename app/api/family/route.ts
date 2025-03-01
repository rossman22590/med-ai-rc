// app/api/family/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, familyMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/family - Get all family members
export async function GET(request: NextRequest) {
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
    
    // If user not found, return empty array
    if (!userResults.length) {
      return NextResponse.json({ members: [] });
    }
    
    // Get the internal UUID
    const internalUserId = userResults[0].id;
    
    // Get the family members using the internal UUID
    const members = await db.query.familyMembers.findMany({
      where: eq(familyMembers.userId, internalUserId)
    });
    
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching family members:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch family members: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/family - Add a new family member
export async function POST(request: NextRequest) {
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
    
    // Get request body
    const { name, relation } = await request.json();
    
    // Validate input
    if (!name || !relation) {
      return NextResponse.json(
        { error: 'Name and relation are required' },
        { status: 400 }
      );
    }
    
    // First, find the internal UUID for this user
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId)
    });
    
    // If user not found, create them
    let internalUserId: string;
    
    if (!userResults.length) {
      // Get user details from Clerk
      // In a real implementation, you'd get this from the Clerk API
      const [newUser] = await db.insert(users)
        .values({
          clerkId,
          email: 'user@example.com', // You'd get this from Clerk
          name: 'User', // You'd get this from Clerk
        })
        .returning();
        
      internalUserId = newUser.id;
    } else {
      internalUserId = userResults[0].id;
    }
    
    // Add the family member
    const [member] = await db.insert(familyMembers)
      .values({
        userId: internalUserId,
        name,
        relation,
      })
      .returning();
    
    return NextResponse.json({ member });
  } catch (error) {
    console.error('Error adding family member:', error);
    
    return NextResponse.json(
      { error: 'Failed to add family member: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
