// app/api/reports/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract ID from the path (bypass "params")
    const pathname = request.nextUrl.pathname; 
    // pathname = "/api/reports/a5dd3a07-29fb-42b8-82ed-4fb423de24fb"
    const match = pathname.match(/^\/api\/reports\/([^\/]+)/);
    const id = match?.[1];

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Now do the DB query with the extracted "id"
    const dbReports = await db.query.reports.findMany({
      where: eq(reports.id, id),
    });

    if (dbReports.length === 0) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ report: dbReports[0] });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report: ' + (error as Error).message },
      { status: 500 }
    );
  }
}


// // app/api/reports/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { auth as clerkAuth } from "@clerk/nextjs/server";
// import { db } from '@/lib/db';
// import { reports } from '@/lib/db/schema';
// import { eq } from 'drizzle-orm';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
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
    
//     // Get the report ID from params
//     const reportId = params.id;
    
//     if (!reportId) {
//       return NextResponse.json(
//         { error: 'Report ID is required' },
//         { status: 400 }
//       );
//     }
    
//     // Get the report
//     const dbReports = await db.query.reports.findMany({
//       where: eq(reports.id, reportId)
//     });
    
//     if (!dbReports.length) {
//       return NextResponse.json(
//         { error: 'Report not found' },
//         { status: 404 }
//       );
//     }
    
//     const report = dbReports[0];
    
//     // Check if the report belongs to the user
//     if (report.userId !== userId) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 403 }
//       );
//     }
    
//     return NextResponse.json({ report });
//   } catch (error) {
//     console.error('Error fetching report:', error);
    
//     return NextResponse.json(
//       { error: 'Failed to fetch report: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
