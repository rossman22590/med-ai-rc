
// app/api/chat/route.ts
import { myProvider } from "@/lib/models";
import { Message, smoothStream, streamText } from "ai";
import { NextRequest } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Check authentication directly
    const authResult = await clerkAuth();
    const userId = authResult.userId;
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      messages,
      selectedModelId,
      isReasoningEnabled,
      documentId,
      documentName,
      documentContent,
    }: {
      messages: Array<Message>;
      selectedModelId?: string;
      isReasoningEnabled?: boolean;
      documentId?: string;
      documentName?: string;
      documentContent?: string;
    } = await request.json();

    // Log what we're receiving
    console.log('Chat API received:', {
      documentId,
      documentName,
      contentLength: documentContent?.length || 0,
      messageCount: messages.length,
      firstUserMessage: messages.find(m => m.role === 'user')?.content?.substring(0, 50) + '...',
    });

    // Create a system message that includes document content if available
    let systemMessage = "You are a friendly assistant. Do not use emojis in your responses.";
    
    if (documentContent && documentContent.length > 0) {
      // Log the first part of the content to verify it's not mock data
      console.log('Document content preview:', documentContent.substring(0, 200) + '...');
      
      systemMessage = `You are a friendly medical document assistant that helps users understand their medical documents.
      
The following is the content of a medical document${documentName ? ` (${documentName})` : ''}:

"""
${documentContent}
"""

When answering questions about this document:
1. Provide clear, simple explanations of medical terms
2. Highlight important findings and what they mean
3. Do not make up information that isn't in the document
4. If you're uncertain about something, be honest about it
5. Do not use emojis in your responses
6. Always refer to the specific information in the document
7. If asked about test results, mention the specific values and normal ranges from the document`;
    }

    // Log the system message being used
    console.log('Using system message:', systemMessage.substring(0, 200) + '...');

    const stream = streamText({
      system: systemMessage,
      providerOptions: {
        anthropic: {
          thinking: {
            type: isReasoningEnabled ? "enabled" : "disabled",
            budgetTokens: 12000,
          },
        },
      },
      model: myProvider.languageModel(selectedModelId || "claude-3.7-sonnet"),
      experimental_transform: [
        smoothStream({
          chunking: "word",
        }),
      ],
      messages,
    });

    return stream.toDataStreamResponse({
      sendReasoning: true,
      getErrorMessage: () => {
        return `An error occurred, please try again!`;
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Chat API error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// // app/api/chat/route.ts
// import { myProvider } from "@/lib/models";
// import { Message, smoothStream, streamText } from "ai";
// import { NextRequest } from "next/server";
// import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
// import { db } from "@/lib/db";
// import { users } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";

// export async function POST(request: NextRequest) {
//   try {
//     // Check authentication directly without using the auth helper
//     const authResult = await clerkAuth();
//     const userId = authResult.userId;
    
//     if (!userId) {
//       return Response.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const {
//       messages,
//       selectedModelId,
//       isReasoningEnabled,
//       documentId,
//       documentName,
//       documentContent,
//     }: {
//       messages: Array<Message>;
//       selectedModelId?: string;
//       isReasoningEnabled?: boolean;
//       documentId?: string;
//       documentName?: string;
//       documentContent?: string;
//     } = await request.json();

//     // Log what we're receiving
//     console.log('Chat API received:', {
//       documentId,
//       documentName,
//       contentLength: documentContent?.length || 0,
//       messageCount: messages.length,
//       firstUserMessage: messages.find(m => m.role === 'user')?.content.substring(0, 50) + '...',
//     });

//     // Create a system message that includes document content if available
//     let systemMessage = "You are a friendly assistant. Do not use emojis in your responses.";
    
//     if (documentContent && documentContent.length > 0) {
//       // Log the first part of the content to verify it's not mock data
//       console.log('Document content preview:', documentContent.substring(0, 200) + '...');
      
//       systemMessage = `You are a friendly medical document assistant that helps users understand their medical documents.
      
// The following is the content of a medical document${documentName ? ` (${documentName})` : ''}:

// """
// ${documentContent}
// """

// When answering questions about this document:
// 1. Provide clear, simple explanations of medical terms
// 2. Highlight important findings and what they mean
// 3. Do not make up information that isn't in the document
// 4. If you're uncertain about something, be honest about it
// 5. Do not use emojis in your responses
// 6. Always refer to the specific information in the document
// 7. If asked about test results, mention the specific values and normal ranges from the document`;
//     }

//     // Log the system message being used
//     console.log('Using system message:', systemMessage.substring(0, 200) + '...');

//     const stream = streamText({
//       system: systemMessage,
//       providerOptions: {
//         anthropic: {
//           thinking: {
//             type: isReasoningEnabled ? "enabled" : "disabled",
//             budgetTokens: 12000,
//           },
//         },
//       },
//       model: myProvider.languageModel(selectedModelId || "claude-3.7-sonnet"),
//       experimental_transform: [
//         smoothStream({
//           chunking: "word",
//         }),
//       ],
//       messages,
//     });

//     return stream.toDataStreamResponse({
//       sendReasoning: true,
//       getErrorMessage: () => {
//         return `An error occurred, please try again!`;
//       },
//     });
//   } catch (error) {
//     console.error('Chat API error:', error);
//     return Response.json(
//       { error: 'Chat API error: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
