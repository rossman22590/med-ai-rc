// lib/utils/image-parser.ts
import { myProvider } from "@/lib/models";
import { generateText } from 'ai';

export async function extractTextFromImage(imageUrl: string): Promise<string> {
  console.log(`Starting AI image analysis for URL: ${imageUrl.substring(0, 80)}...`);

  try {
    // For AI analysis, we need to provide the image as a base64 string or URL
    let imageContent: string = imageUrl;
    
    // Build the prompt for the AI
    const prompt = `
    Please analyze this medical image in detail. 
    
    I need a comprehensive description of:
    
    1. The type of medical image (X-ray, MRI, CT scan, lab report, etc.)
    2. The body part or system shown (if applicable)
    3. All visible findings, abnormalities, or notable features
    4. Any text or numbers visible in the image (including lab values, dates, patient info with names redacted)
    5. Any measurement values or reference ranges shown
    
    Be specific, detailed, and factual about what you can see. If you're uncertain about anything, acknowledge that uncertainty.
    Format your response in clear paragraphs with appropriate headings.
    `;

    // Use the AI provider to generate a response
    console.log('Sending image to Claude 3.7 Sonnet for analysis...');
    
    // Using languageModel (not imageModel) with multimodal input capabilities
    const { text } = await generateText({
      model: myProvider.languageModel("claude-3.7-sonnet"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: imageContent }
          ]
        }
      ],
      maxTokens: 2000,
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens: 8000 },
        },
      },
    });
    
    console.log(`AI analysis complete. Generated ${text.length} characters of description`);
    
    if (!text || text.trim().length === 0) {
      return "The AI was unable to analyze this image properly.";
    }
    
    return text;
  } catch (error) {
    console.error('Error analyzing image with AI:', error);
    return `Error analyzing image: ${(error as Error).message}`;
  }
}
