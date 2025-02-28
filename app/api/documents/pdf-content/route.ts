// app/api/documents/pdf-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { extractTextFromPdf } from '@/lib/utils/pdf-parser';

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { documentId, forceExtract } = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Get the document
    const docs = await db.query.documents.findMany({
      where: eq(documents.id, documentId)
    });
    
    if (!docs.length) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    const document = docs[0];
    
    // Check if the document belongs to the user
    if (document.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // If content is already extracted and we're not forcing a re-extract, return it
    if (document.contentText && !forceExtract) {
      return NextResponse.json({ 
        content: document.contentText,
        source: 'cache'
      });
    }
    
    if (document.type !== 'pdf') {
      return NextResponse.json(
        { error: 'Not a PDF document' },
        { status: 400 }
      );
    }
    
    // Extract the PDF content
    const content = await extractTextFromPdf(document.url);
    
    // Save the extracted content to the database
    await db.update(documents)
      .set({ contentText: content })
      .where(eq(documents.id, documentId));
    
    return NextResponse.json({ 
      content,
      source: 'extracted'
    });
  } catch (error) {
    console.error('Error extracting PDF content:', error);
    
    return NextResponse.json(
      { error: 'Failed to extract PDF content: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
