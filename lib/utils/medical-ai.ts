// lib/utils/medical-ai.ts
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { extractTextFromPdf } from './pdf-parser';
import { extractTextFromImage } from './image-parser';

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  contentText?: string | null;
};

export async function generateMedicalReport(
  documents: Document[],
  additionalNotes: string = '',
  reasoningTokens: number = 8000
): Promise<string> {
  try {
    // First, extract text from each document if not already available
    const processedDocs = await Promise.all(
      documents.map(async (doc) => {
        // If we already have text content, use it
        if (doc.contentText) {
          return { ...doc };
        }
        
        let textContent = '';
        
        // Extract text based on document type
        if (doc.type === 'pdf') {
          textContent = await extractTextFromPdf(doc.url);
        } else if (doc.type.includes('image')) {
          textContent = await extractTextFromImage(doc.url);
        }
        
        return {
          ...doc,
          contentText: textContent || 'No text could be extracted from this document.'
        };
      })
    );
    
    // Combine all document texts with labels
    const combinedContent = processedDocs.map(doc => 
      `--- DOCUMENT: ${doc.name} ---\n${doc.contentText}\n\n`
    ).join('\n');
    
    // Add additional context notes if provided
    const contextInfo = additionalNotes 
      ? `\n--- ADDITIONAL CONTEXT ---\n${additionalNotes}\n\n` 
      : '';
    
    // Create the enhanced prompt for the AI with multi-level summaries and tables
    const prompt = `
    I need you to analyze the following medical documents and create a comprehensive, yet easy-to-understand report for family members. The report should have multiple levels of detail to accommodate different needs.
    
    ${combinedContent}
    ${contextInfo}
    
    Please organize your response using markdown formatting as follows:

    # Medical Report Analysis for [Patient Name if available]
    
    ## AT-A-GLANCE SUMMARY
    Provide a very brief (2-3 sentences) plain-language overview of the most critical information that someone would need to know immediately. This should be extremely concise and straightforward.
    
    ## COMPREHENSIVE ANALYSIS
     Provide a detailed (1-2 paragraphs) plain-language overview of the most critical information that someone would need to know immediately. This should be extremely concise and straightforward.
    
    ### KEY FINDINGS
    Provide a detailed, exhaustive breakdown of all significant medical findings, organized by category (like "Blood Work", "Imaging", etc.). Use bullet points for clarity. Include all relevant details while still using accessible language.
    
    ### WHAT THIS MEANS
    Explain thoroughly what these results indicate about the person's health condition. Include both immediate implications and potential long-term considerations. Provide context about how serious or routine these findings might be.
    
    ### NEXT STEPS
    Suggest a comprehensive list of follow-up actions or questions for healthcare providers. Include:
    - Immediate actions needed (if any)
    - Follow-up appointments to consider
    - Specific questions to ask doctors
    - Lifestyle considerations, if relevant
    
    ## DATA SUMMARIES
    
    ### TEST RESULTS TABLE
    Create a markdown table summarizing all numerical test results found in the documents. Include:
    - Test name
    - Result value
    - Normal range
    - Simple interpretation (e.g., "Normal", "High", "Low")
    
    Example:
    | Test | Result | Normal Range | Status |
    |------|--------|--------------|--------|
    | Hemoglobin | 12.5 g/dL | 12.0-15.5 g/dL | Normal |
    
    ### MEDICATION INFORMATION
    If medications are mentioned, create a table summarizing:
    - Medication name
    - Dosage
    - Purpose
    - Key considerations
    
    ## MEDICAL TERMINOLOGY
    Create a glossary table explaining all medical terms used in the documents in simple language.
    
    | Term | Simple Explanation |
    |------|-------------------|
    | [Medical term] | [Plain language explanation] |
    
    Use conversational, friendly language throughout. When you must use medical terms, introduce them gently and explain them clearly. Format the report for maximum readability with clear section headings and visual organization.
    `;
    
    // Generate the report using Claude's reasoning capabilities
    const { text } = await generateText({
      model: anthropic('claude-3-7-sonnet-latest'),
      prompt,
      maxTokens: 4000,
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens: reasoningTokens },
        },
      },
    });
    
    return text;
  } catch (error) {
    console.error('Error generating medical report:', error);
    
    // Instead of throwing, return a fallback response
    return `
    # Medical Report Analysis

    ## AT-A-GLANCE SUMMARY
    I was unable to fully analyze the medical documents due to technical issues.
    
    ## COMPREHENSIVE ANALYSIS
    
    ### KEY FINDINGS
    The system encountered an error while processing your documents.
    
    ### WHAT THIS MEANS
    This is likely a temporary issue with our AI processing system.
    
    ### NEXT STEPS
    Please try again later or contact support if the issue persists.
    
    ## TECHNICAL DETAILS
    Error: ${(error as Error).message || 'Unknown error'}
    `;
  }
}

// // lib/utils/medical-ai.ts
// import { anthropic } from '@ai-sdk/anthropic';
// import { generateText } from 'ai';
// import { extractTextFromPdf } from './pdf-parser';
// import { extractTextFromImage } from './image-parser';

// type Document = {
//   id: string;
//   name: string;
//   type: string;
//   url: string;
//   contentText?: string | null;
// };

// export async function generateMedicalReport(
//   documents: Document[],
//   additionalNotes: string = '',
//   reasoningTokens: number = 8000
// ): Promise<string> {
//   try {
//     // First, extract text from each document if not already available
//     const processedDocs = await Promise.all(
//       documents.map(async (doc) => {
//         // If we already have text content, use it
//         if (doc.contentText) {
//           return { ...doc };
//         }
        
//         let textContent = '';
        
//         // Extract text based on document type
//         if (doc.type === 'pdf') {
//           textContent = await extractTextFromPdf(doc.url);
//         } else if (doc.type.includes('image')) {
//           textContent = await extractTextFromImage(doc.url);
//         }
        
//         return {
//           ...doc,
//           contentText: textContent || 'No text could be extracted from this document.'
//         };
//       })
//     );
    
//     // Combine all document texts with labels
//     const combinedContent = processedDocs.map(doc => 
//       `--- DOCUMENT: ${doc.name} ---\n${doc.contentText}\n\n`
//     ).join('\n');
    
//     // Add additional context notes if provided
//     const contextInfo = additionalNotes 
//       ? `\n--- ADDITIONAL CONTEXT ---\n${additionalNotes}\n\n` 
//       : '';
    
//     // Create the prompt for the AI
//     const prompt = `
//     I need you to analyze the following medical documents and create a simplified, easy-to-understand report for family members.
    
//     ${combinedContent}
//     ${contextInfo}
    
//     Please organize your response as follows:
    
//     1. FULL SUMMARY: An in depth , plain-language summary of the key information (2-3 sentences).
    
//     2. KEY FINDINGS: List the most important medical findings in simple terms that a non-medical person can understand.
    
//     3. WHAT THIS MEANS: Explain what these results mean for the person's health in everyday language.
    
//     4. NEXT STEPS: Suggest reasonable follow-up actions or questions for the doctor (if applicable).
    
//     5. MEDICAL TERMS EXPLAINED: Include a short glossary explaining any medical terms in simple language.
    
//     Use conversational, friendly language. Avoid medical jargon where possible, and when you must use medical terms, explain them clearly. Format the report in a way that's easy to read.
//     `;
    
//     // Generate the report using Claude's reasoning capabilities
//     // Update the model name to use the correct identifier
//     const { text } = await generateText({
//       model: anthropic('claude-3-7-sonnet-latest'), // Updated model name
//       prompt,
//       maxTokens: 4000,
//       providerOptions: {
//         anthropic: {
//           thinking: { type: 'enabled', budgetTokens: reasoningTokens },
//         },
//       },
//     });
    
//     return text;
//   } catch (error) {
//     console.error('Error generating medical report:', error);
    
//     // Instead of throwing, return a fallback response
//     return `
//     # Medical Report Analysis

//     ## SUMMARY
//     I was unable to fully analyze the medical documents due to technical issues. 
    
//     ## KEY FINDINGS
//     The system encountered an error while processing your documents.
    
//     ## WHAT THIS MEANS
//     This is likely a temporary issue with our AI processing system.
    
//     ## NEXT STEPS
//     Please try again later or contact support if the issue persists.
    
//     ## TECHNICAL DETAILS
//     Error: ${(error as Error).message || 'Unknown error'}
//     `;
//   }
// }
