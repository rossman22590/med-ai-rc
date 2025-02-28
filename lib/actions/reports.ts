// lib/actions/reports.ts
'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents, reports, reportDocuments, users } from '@/lib/db/schema';
import { eq, inArray, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { generateMedicalReport } from '@/lib/utils/medical-ai';

type ReasoningLevel = 'standard' | 'deep' | 'comprehensive';

/**
 * Get N most recent reports for the authenticated user
 */
export async function getRecentReports(limit?: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const clerkId = session.user.id;
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId),
    });
    if (!userResults.length) return [];

    const internalUserId = userResults[0].id;
    const userReports = await db.query.reports.findMany({
      where: eq(reports.userId, internalUserId),
      orderBy: [desc(reports.createdAt)],
      limit: limit,
    });
    return userReports || [];
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

/**
 * Get a single report by ID if the user owns it
 */
export async function getReportById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const clerkId = session.user.id;
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId),
    });
    if (!userResults.length) return null;

    const internalUserId = userResults[0].id;
    const report = await db.query.reports.findFirst({
      where: eq(reports.id, id),
    });

    // Only return if belongs to user
    if (report && report.userId === internalUserId) {
      return report;
    }
    return null;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
}

/**
 * Generate a new report from documents, familyMember, etc.
 */
export async function generateReport({
  title,
  documentIds,
  familyMemberId,
  notes,
  reasoningLevel = 'deep'
}: {
  title: string;
  documentIds: string[];
  familyMemberId?: string;
  notes?: string;
  reasoningLevel?: ReasoningLevel;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const clerkId = session.user.id;
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId),
    });

    let internalUserId: string;
    if (!userResults.length) {
      // Create user if not in DB yet
      const [newUser] = await db.insert(users).values({
        clerkId,
        email: session.user.email || 'unknown@example.com',
        name: session.user.name || 'User',
      }).returning();
      internalUserId = newUser.id;
    } else {
      internalUserId = userResults[0].id;
    }

    // Fetch the docs
    const selectedDocs = await db.query.documents.findMany({
      where: inArray(documents.id, documentIds),
    });
    if (!selectedDocs.length) {
      return { success: false, error: 'No valid documents found' };
    }

    const tokenBudgets: Record<ReasoningLevel, number> = {
      standard: 4000,
      deep: 8000,
      comprehensive: 12000,
    };

    console.log('Generating report with docs:', selectedDocs.map(d => d.id));

    // Use your AI function to generate the content
    const reportContent = await generateMedicalReport(
      selectedDocs,
      notes || '',
      tokenBudgets[reasoningLevel]
    );
    if (!reportContent) {
      return { success: false, error: 'Failed to generate report content' };
    }

    // Trim a summary
    const summary = reportContent.slice(0, 200) + 
      (reportContent.length > 200 ? '...' : '');
    const shareToken = nanoid(10);

    // Insert the report
    const [reportRecord] = await db.insert(reports)
      .values({
        userId: internalUserId,
        familyMemberId: familyMemberId || null,
        title,
        content: reportContent,
        summary,
        status: 'complete',
        shareToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Link docs to the report
    for (const docId of documentIds) {
      await db.insert(reportDocuments).values({
        reportId: reportRecord.id,
        documentId: docId,
      });
    }

    return { success: true, reportId: reportRecord.id, shareToken };
  } catch (error) {
    console.error('Report generation error:', error);
    return { success: false, error: 'Failed to generate report: ' + (error as Error).message };
  }
}

/**
 * Get all reports for the user
 */
export async function getUserReports() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const clerkId = session.user.id;
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId),
    });
    if (!userResults.length) return [];

    const internalUserId = userResults[0].id;
    return await db.query.reports.findMany({
      where: eq(reports.userId, internalUserId),
      orderBy: [desc(reports.createdAt)],
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

// // lib/actions/reports.ts
// 'use server';

// import { auth } from '@/lib/auth';
// import { db } from '@/lib/db';
// import { documents, reports, reportDocuments, users } from '@/lib/db/schema';
// import { eq, inArray, desc } from 'drizzle-orm';
// import { nanoid } from 'nanoid';
// import { generateMedicalReport } from '@/lib/utils/medical-ai';

// type ReasoningLevel = 'standard' | 'deep' | 'comprehensive';

// export async function getRecentReports(limit?: number) {
//   try {
//     // Properly await the auth function
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
//     const userReports = await db.query.reports.findMany({
//       where: eq(reports.userId, internalUserId),
//       orderBy: [desc(reports.createdAt)],
//       limit: limit
//     });
    
//     return userReports || [];
//   } catch (error) {
//     console.error('Error fetching reports:', error);
//     return [];
//   }
// }

// export async function getReportById(id: string) {
//   try {
//     // Properly await the auth function
//     const session = await auth();
    
//     if (!session?.user?.id) {
//       return null;
//     }
    
//     // Get Clerk ID
//     const clerkId = session.user.id;
    
//     // First, find the internal UUID for this user
//     const userResults = await db.query.users.findMany({
//       where: eq(users.clerkId, clerkId)
//     });
    
//     // If user not found, return null
//     if (!userResults.length) {
//       console.log(`User not found in database: ${clerkId}`);
//       return null;
//     }
    
//     // Get the internal UUID
//     const internalUserId = userResults[0].id;
    
//     const report = await db.query.reports.findFirst({
//       where: eq(reports.id, id)
//     });
    
//     // Only return the report if it belongs to the current user
//     if (report && report.userId === internalUserId) {
//       return report;
//     }
    
//     return null;
//   } catch (error) {
//     console.error('Error fetching report:', error);
//     return null;
//   }
// }

// export async function generateReport({
//   title,
//   documentIds,
//   familyMemberId,
//   notes,
//   reasoningLevel = 'deep'
// }: {
//   title: string;
//   documentIds: string[];
//   familyMemberId?: string;
//   notes?: string;
//   reasoningLevel?: ReasoningLevel;
// }) {
//   try {
//     // Properly await the auth function
//     const session = await auth();
    
//     if (!session?.user?.id) {
//       return { success: false, error: 'Unauthorized' };
//     }
    
//     // Get Clerk ID
//     const clerkId = session.user.id;
    
//     // First, find the internal UUID for this user
//     const userResults = await db.query.users.findMany({
//       where: eq(users.clerkId, clerkId)
//     });
    
//     // If user not found, create a new user record
//     let internalUserId: string;
    
//     if (!userResults.length) {
//       const [newUser] = await db.insert(users)
//         .values({
//           clerkId,
//           email: session.user.email || 'unknown@example.com',
//           name: session.user.name || 'User',
//         })
//         .returning();
        
//       internalUserId = newUser.id;
//     } else {
//       internalUserId = userResults[0].id;
//     }
    
//     // Get the selected documents
//     const selectedDocs = await db.query.documents.findMany({
//       where: inArray(documents.id, documentIds)
//     });
    
//     if (selectedDocs.length === 0) {
//       return { success: false, error: 'No valid documents found' };
//     }
    
//     // Convert reasoning level to token budget
//     const tokenBudgets: Record<ReasoningLevel, number> = {
//       standard: 4000,
//       deep: 8000,
//       comprehensive: 12000
//     };
    
//     // Log the documents being used
//     console.log('Generating report with documents:', selectedDocs.map(doc => ({
//       id: doc.id,
//       name: doc.name,
//       contentLength: doc.contentText?.length || 0
//     })));
    
//     // Generate the report content using AI
//     const reportContent = await generateMedicalReport(
//       selectedDocs, 
//       notes || '',
//       tokenBudgets[reasoningLevel]
//     );
    
//     if (!reportContent) {
//       return { success: false, error: 'Failed to generate report content' };
//     }
    
//     // Create a summary (first 200 chars)
//     const summary = reportContent.slice(0, 200) + 
//       (reportContent.length > 200 ? '...' : '');
    
//     // Create a share token
//     const shareToken = nanoid(10);
    
//     // Save report to database using internal UUID
//     const [report] = await db.insert(reports)
//       .values({
//         userId: internalUserId, // Use internal UUID not Clerk ID
//         familyMemberId: familyMemberId || null,
//         title,
//         content: reportContent,
//         summary,
//         status: 'complete',
//         shareToken,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       })
//       .returning();
    
//     // Create associations between report and documents
//     for (const docId of documentIds) {
//       await db.insert(reportDocuments)
//         .values({
//           reportId: report.id,
//           documentId: docId,
//         });
//     }
    
//     return { 
//       success: true, 
//       reportId: report.id,
//       shareToken
//     };
//   } catch (error) {
//     console.error('Report generation error:', error);
//     return { success: false, error: 'Failed to generate report: ' + (error as Error).message };
//   }
// }

// export async function getUserReports() {
//   try {
//     // Properly await the auth function
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
    
//     // Now use the correct UUID to query reports
//     const userReports = await db.query.reports.findMany({
//       where: eq(reports.userId, internalUserId),
//       orderBy: [desc(reports.createdAt)]
//     });
    
//     return userReports;
//   } catch (error) {
//     console.error('Error fetching reports:', error);
//     return [];
//   }
// }

// // Add any other report-related functions you need here



// lib/actions/reports.ts
// 'use server';

// import { auth } from '@/lib/auth';
// import { db } from '@/lib/db';
// import { documents, reports, reportDocuments } from '@/lib/db/schema';
// import { eq, inArray, desc } from 'drizzle-orm';
// import { nanoid } from 'nanoid';
// import { generateMedicalReport } from '@/lib/utils/medical-ai';

// type ReasoningLevel = 'standard' | 'deep' | 'comprehensive';

// export async function getRecentReports(limit?: number) {
//   const session = await auth();
  
//   if (!session?.user?.id) {
//     return [];
//   }
  
//   try {
//     const userReports = await db.query.reports.findMany({
//       where: eq(reports.userId, session.user.id),
//       orderBy: [desc(reports.createdAt)],
//       limit: limit
//     });
    
//     return userReports || [];
//   } catch (error) {
//     console.error('Error fetching reports:', error);
//     return [];
//   }
// }

// export async function getReportById(id: string) {
//   const session = await auth();
  
//   if (!session?.user?.id) {
//     return null;
//   }
  
//   try {
//     const report = await db.query.reports.findFirst({
//       where: eq(reports.id, id)
//     });
    
//     // Only return the report if it belongs to the current user
//     if (report && report.userId === session.user.id) {
//       return report;
//     }
    
//     return null;
//   } catch (error) {
//     console.error('Error fetching report:', error);
//     return null;
//   }
// }

// export async function generateReport({
//   title,
//   documentIds,
//   familyMemberId,
//   notes,
//   reasoningLevel = 'deep'
// }: {
//   title: string;
//   documentIds: string[];
//   familyMemberId?: string;
//   notes?: string;
//   reasoningLevel?: ReasoningLevel;
// }) {
//   const session = await auth();
  
//   if (!session?.user?.id) {
//     return { success: false, error: 'Unauthorized' };
//   }
  
//   try {
//     // Get the selected documents
//     const selectedDocs = await db.query.documents.findMany({
//       where: inArray(documents.id, documentIds)
//     });
    
//     if (selectedDocs.length === 0) {
//       return { success: false, error: 'No valid documents found' };
//     }
    
//     // Convert reasoning level to token budget
//     const tokenBudgets: Record<ReasoningLevel, number> = {
//       standard: 4000,
//       deep: 8000,
//       comprehensive: 12000
//     };
    
//     // Generate the report content using AI
//     const reportContent = await generateMedicalReport(
//       selectedDocs, 
//       notes || '',
//       tokenBudgets[reasoningLevel]
//     );
    
//     if (!reportContent) {
//       return { success: false, error: 'Failed to generate report content' };
//     }
    
//     // Create a summary (first 200 chars)
//     const summary = reportContent.slice(0, 200) + 
//       (reportContent.length > 200 ? '...' : '');
    
//     // Create a share token
//     const shareToken = nanoid(10);
    
//     // Save report to database
//     const [report] = await db.insert(reports)
//       .values({
//         userId: session.user.id,
//         familyMemberId: familyMemberId || null,
//         title,
//         content: reportContent,
//         summary,
//         status: 'complete',
//         shareToken,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       })
//       .returning();
    
//     // Create associations between report and documents
//     for (const docId of documentIds) {
//       await db.insert(reportDocuments)
//         .values({
//           reportId: report.id,
//           documentId: docId,
//         });
//     }
    
//     return { 
//       success: true, 
//       reportId: report.id,
//       shareToken
//     };
//   } catch (error) {
//     console.error('Report generation error:', error);
//     return { success: false, error: 'Failed to generate report' };
//   }
// }
