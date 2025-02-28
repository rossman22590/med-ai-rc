// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Create a separate handler function with the implementation
async function getDocumentHandler(id: string) {
  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const docs = await db.query.documents.findMany({
      where: eq(documents.id, id)
    });
    
    if (!docs.length) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    const document = docs[0];
    
    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch document: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Export a simplified route handler that just passes the ID
export function GET(
  _request: NextRequest,
  context: any // Using any here, but isolated to just this line
) {
  return getDocumentHandler(context.params.id);
}


// // app/api/documents/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { documents } from '@/lib/db/schema';
// import { eq } from 'drizzle-orm';

// export async function GET(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     // Get the document ID from context
//     const documentId = context.params.id;
    
//     if (!documentId) {
//       return NextResponse.json(
//         { error: 'Document ID is required' },
//         { status: 400 }
//       );
//     }
    
//     // Get the document
//     const docs = await db.query.documents.findMany({
//       where: eq(documents.id, documentId)
//     });
    
//     if (!docs.length) {
//       return NextResponse.json(
//         { error: 'Document not found' },
//         { status: 404 }
//       );
//     }
    
//     const document = docs[0];
    
//     // Return the document
//     return NextResponse.json({ document });
//   } catch (error) {
//     console.error('Error fetching document:', error);
    
//     return NextResponse.json(
//       { error: 'Failed to fetch document: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
