// app/api/reports/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { reports, reportDocuments, documents, users } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { generateMedicalReport } from '@/lib/utils/medical-ai';

type ReasoningLevel = 'standard' | 'deep' | 'comprehensive';

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
    const body = await request.json();
    const title = body.title;
    const documentIds = body.documentIds;
    const familyMemberId = body.familyMemberId;
    const notes = body.notes;
    
    // Ensure reasoningLevel is a valid value
    let reasoningLevel: ReasoningLevel = 'deep'; // Default
    if (
      body.reasoningLevel === 'standard' || 
      body.reasoningLevel === 'deep' || 
      body.reasoningLevel === 'comprehensive'
    ) {
      reasoningLevel = body.reasoningLevel;
    }
    
    // Validate input
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    if (!documentIds || !documentIds.length) {
      return NextResponse.json(
        { error: 'At least one document must be selected' },
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
      // In a real implementation, you'd get user details from Clerk
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
    
    // Get the selected documents
    const selectedDocs = await db.query.documents.findMany({
      where: inArray(documents.id, documentIds)
    });
    
    if (selectedDocs.length === 0) {
      return NextResponse.json(
        { error: 'No valid documents found' },
        { status: 400 }
      );
    }
    
    // Convert reasoning level to token budget
    const tokenBudgets: Record<ReasoningLevel, number> = {
      standard: 4000,
      deep: 8000,
      comprehensive: 12000
    };
    
    // Call your actual AI service to generate the report content
    const reportContent = await generateMedicalReport(
      selectedDocs,
      notes || '',
      tokenBudgets[reasoningLevel]
    );
    
    if (!reportContent) {
      return NextResponse.json(
        { error: 'Failed to generate report content' },
        { status: 500 }
      );
    }
    
    // Create a summary
    const summary = reportContent.slice(0, 200) + 
      (reportContent.length > 200 ? '...' : '');
    
    // Create a share token
    const shareToken = nanoid(10);
    
    // Save report to database
    const [report] = await db.insert(reports)
      .values({
        userId: internalUserId,
        familyMemberId: familyMemberId || null,
        title,
        content: reportContent,
        summary,
        status: 'complete',
        shareToken,
      })
      .returning();
    
    // Create associations between report and documents
    for (const docId of documentIds) {
      await db.insert(reportDocuments)
        .values({
          reportId: report.id,
          documentId: docId,
        });
    }
    
    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      shareToken
    });
  } catch (error) {
    console.error('Report generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate report: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
