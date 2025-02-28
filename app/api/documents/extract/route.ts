// app/api/documents/extract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { extractDocumentContent } from '@/lib/utils/pdf-parser';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get document ID from query params
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('id');
    
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
    
    // Extract content from the document
    console.log('Extracting content from document:', document.name);
    const content = await extractDocumentContent(document);
    console.log('Extraction complete, content length:', content.length);
    
    // Save the extracted content to the database
    await db.update(documents)
      .set({ contentText: content })
      .where(eq(documents.id, documentId));
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error extracting document content:', error);
    
    return NextResponse.json(
      { error: 'Failed to extract document content: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
