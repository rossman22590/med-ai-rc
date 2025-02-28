// lib/utils/pdf-parser.ts
import '@ungap/with-resolvers'; // Polyfill for Promise.withResolvers

// Define a more flexible document type that matches what comes from the database
type DbDocument = {
  id: string;
  userId: string;
  name: string;
  type: string; // This is more flexible than 'pdf' | 'image'
  url: string;
  contentText?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function extractTextFromPdf(url: string): Promise<string> {
  try {
    console.log('Starting PDF extraction for URL:', url.substring(0, 50) + '...');
    
    // Import PDF.js dynamically
    const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
    // Import the worker
    await import('pdfjs-dist/build/pdf.worker.min.mjs');
    
    // Get PDF data - handle data URLs
    let pdfData: Uint8Array;
    
    if (url.startsWith('data:application/pdf;base64,')) {
      // Extract base64 content from data URL
      const base64Content = url.replace('data:application/pdf;base64,', '');
      pdfData = new Uint8Array(Buffer.from(base64Content, 'base64'));
      console.log('PDF size:', pdfData.length, 'bytes');
    } else {
      // Handle regular URLs
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      pdfData = new Uint8Array(arrayBuffer);
      console.log('PDF size:', pdfData.length, 'bytes');
    }
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
    console.log('PDF loaded with', pdf.numPages, 'pages');
    
    let extractedText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log('Processing page', i);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text from page using a simpler approach
      let pageText = '';
      
      // Process each item in the text content
      for (const item of textContent.items) {
        // Check if the item has a 'str' property (TextItem)
        if ('str' in item) {
          pageText += item.str + ' ';
        }
      }
        
      extractedText += pageText.trim() + '\n\n';
    }
    
    console.log('Extracted text length:', extractedText.length);
    console.log('First 100 characters:', extractedText.substring(0, 100));
    
    // If no text was extracted, return an error message
    if (!extractedText.trim()) {
      console.error('No text extracted from PDF');
      return 'No text could be extracted from this PDF. It may be a scanned document or contain only images.';
    }
    
    return extractedText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return `Error extracting text from PDF: ${(error as Error).message || 'Unknown error'}`;
  }
}

// Update the function to accept the more flexible type
export async function extractDocumentContent(document: DbDocument): Promise<string> {
  try {
    if (document.contentText) {
      return document.contentText;
    }
    
    if (document.type === 'pdf') {
      return await extractTextFromPdf(document.url);
    } else if (document.type.includes('image')) {
      // For images, we'd use OCR but for now return a placeholder
      return 'Image content extraction not implemented yet.';
    } else {
      return `Unsupported document type: ${document.type}`;
    }
  } catch (error) {
    console.error('Error extracting document content:', error);
    return `Error extracting document content: ${(error as Error).message || 'Unknown error'}`;
  }
}


// // lib/utils/pdf-parser.ts
// import '@ungap/with-resolvers'; // Polyfill for Promise.withResolvers

// // Define a more flexible document type that matches what comes from the database
// type DbDocument = {
//   id: string;
//   userId: string;
//   name: string;
//   type: string; // This is more flexible than 'pdf' | 'image'
//   url: string;
//   contentText?: string | null;
//   createdAt: Date;
//   updatedAt: Date;
// };

// export async function extractTextFromPdf(url: string): Promise<string> {
//   try {
//     console.log('Starting PDF extraction for URL:', url.substring(0, 50) + '...');
    
//     // Import PDF.js dynamically with TypeScript ignore
//     // @ts-ignore - Import PDF.js
//     const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
//     // Import the worker with TypeScript ignore
//     // @ts-ignore - Import PDF.js worker
//     await import('pdfjs-dist/build/pdf.worker.min.mjs');
    
//     // Get PDF data - handle data URLs
//     let pdfData: Uint8Array;
    
//     if (url.startsWith('data:application/pdf;base64,')) {
//       // Extract base64 content from data URL
//       const base64Content = url.replace('data:application/pdf;base64,', '');
//       pdfData = new Uint8Array(Buffer.from(base64Content, 'base64'));
//       console.log('PDF size:', pdfData.length, 'bytes');
//     } else {
//       // Handle regular URLs
//       const response = await fetch(url);
//       const arrayBuffer = await response.arrayBuffer();
//       pdfData = new Uint8Array(arrayBuffer);
//       console.log('PDF size:', pdfData.length, 'bytes');
//     }
    
//     // Load the PDF document
//     const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
//     console.log('PDF loaded with', pdf.numPages, 'pages');
    
//     let extractedText = '';
    
//     // Extract text from each page
//     for (let i = 1; i <= pdf.numPages; i++) {
//       console.log('Processing page', i);
//       const page = await pdf.getPage(i);
//       const textContent = await page.getTextContent();
      
//       // Extract text from page
//       const pageText = textContent.items
//         .map((item: any) => item.str)
//         .join(' ');
        
//       extractedText += pageText + '\n\n';
//     }
    
//     console.log('Extracted text length:', extractedText.length);
//     console.log('First 100 characters:', extractedText.substring(0, 100));
    
//     // If no text was extracted, return an error message
//     if (!extractedText.trim()) {
//       console.error('No text extracted from PDF');
//       return 'No text could be extracted from this PDF. It may be a scanned document or contain only images.';
//     }
    
//     return extractedText.trim();
//   } catch (error) {
//     console.error('Error extracting text from PDF:', error);
//     return `Error extracting text from PDF: ${(error as Error).message || 'Unknown error'}`;
//   }
// }

// // Update the function to accept the more flexible type
// export async function extractDocumentContent(document: DbDocument): Promise<string> {
//   try {
//     if (document.contentText) {
//       return document.contentText;
//     }
    
//     if (document.type === 'pdf') {
//       return await extractTextFromPdf(document.url);
//     } else if (document.type.includes('image')) {
//       // For images, we'd use OCR but for now return a placeholder
//       return 'Image content extraction not implemented yet.';
//     } else {
//       return `Unsupported document type: ${document.type}`;
//     }
//   } catch (error) {
//     console.error('Error extracting document content:', error);
//     return `Error extracting document content: ${(error as Error).message || 'Unknown error'}`;
//   }
// }

// // lib/utils/pdf-parser.ts
// import '@ungap/with-resolvers'; // Polyfill for Promise.withResolvers
// import { Document } from '@/lib/types';

// export async function extractTextFromPdf(url: string): Promise<string> {
//   try {
//     console.log('Starting PDF extraction for URL:', url.substring(0, 50) + '...');
    
//     // Import PDF.js dynamically with TypeScript ignore
//     // @ts-ignore - Import PDF.js
//     const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
//     // Import the worker with TypeScript ignore
//     // @ts-ignore - Import PDF.js worker
//     await import('pdfjs-dist/build/pdf.worker.min.mjs');
    
//     // Get PDF data - handle data URLs
//     let pdfData: Uint8Array;
    
//     if (url.startsWith('data:application/pdf;base64,')) {
//       // Extract base64 content from data URL
//       const base64Content = url.replace('data:application/pdf;base64,', '');
//       pdfData = new Uint8Array(Buffer.from(base64Content, 'base64'));
//       console.log('PDF size:', pdfData.length, 'bytes');
//     } else {
//       // Handle regular URLs
//       const response = await fetch(url);
//       const arrayBuffer = await response.arrayBuffer();
//       pdfData = new Uint8Array(arrayBuffer);
//       console.log('PDF size:', pdfData.length, 'bytes');
//     }
    
//     // Load the PDF document
//     const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
//     console.log('PDF loaded with', pdf.numPages, 'pages');
    
//     let extractedText = '';
    
//     // Extract text from each page
//     for (let i = 1; i <= pdf.numPages; i++) {
//       console.log('Processing page', i);
//       const page = await pdf.getPage(i);
//       const textContent = await page.getTextContent();
      
//       // Extract text from page
//       const pageText = textContent.items
//         .map((item: any) => item.str)
//         .join(' ');
        
//       extractedText += pageText + '\n\n';
//     }
    
//     console.log('Extracted text length:', extractedText.length);
//     console.log('First 100 characters:', extractedText.substring(0, 100));
    
//     // If no text was extracted, return an error message
//     if (!extractedText.trim()) {
//       console.error('No text extracted from PDF');
//       return 'No text could be extracted from this PDF. It may be a scanned document or contain only images.';
//     }
    
//     return extractedText.trim();
//   } catch (error) {
//     console.error('Error extracting text from PDF:', error);
//     return `Error extracting text from PDF: ${(error as Error).message || 'Unknown error'}`;
//   }
// }

// // Helper function to extract content from any document
// export async function extractDocumentContent(document: Document): Promise<string> {
//   try {
//     if (document.contentText) {
//       return document.contentText;
//     }
    
//     if (document.type === 'pdf') {
//       return await extractTextFromPdf(document.url);
//     } else if (document.type === 'image') {
//       // For images, we'd use OCR but for now return a placeholder
//       return 'Image content extraction not implemented yet.';
//     } else {
//       return 'Unsupported document type.';
//     }
//   } catch (error) {
//     console.error('Error extracting document content:', error);
//     return `Error extracting document content: ${(error as Error).message || 'Unknown error'}`;
//   }
// }
