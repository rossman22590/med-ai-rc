// app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from "@clerk/nextjs/server";
import { db } from '@/lib/db';
import { reports, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

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
      return NextResponse.json({ reports: [] });
    }
    
    // Get the internal UUID
    const internalUserId = userResults[0].id;
    
    // Get the reports using the internal UUID
    const userReports = await db.query.reports.findMany({
      where: eq(reports.userId, internalUserId),
      orderBy: [desc(reports.createdAt)]
    });
    
    return NextResponse.json({ reports: userReports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch reports: ' + (error as Error).message },
      { status: 500 }
    );
  }
}



// // app/api/reports/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { auth as clerkAuth } from "@clerk/nextjs/server";
// import { db } from '@/lib/db';
// import { reports } from '@/lib/db/schema';
// import { eq, desc } from 'drizzle-orm';

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
    
//     // Get the reports
//     const userReports = await db.query.reports.findMany({
//       where: eq(reports.userId, userId),
//       orderBy: [desc(reports.createdAt)]
//     });
    
//     return NextResponse.json({ reports: userReports });
//   } catch (error) {
//     console.error('Error fetching reports:', error);
    
//     return NextResponse.json(
//       { error: 'Failed to fetch reports: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
