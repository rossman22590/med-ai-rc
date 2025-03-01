// components/document/document-chat.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  contentText?: string | null;
};

export default function DocumentChat({ document }: { document: Document }) {
  const [message, setMessage] = useState('');
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, id: string}>>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate a unique ID for messages
  const generateId = () => Math.random().toString(36).substring(2, 11);
  
  const fetchDocumentContent = async (forceExtract = false) => {
    setIsLoadingContent(true);
    try {
      // For PDFs, use our specialized endpoint
      if (document.type === 'pdf') {
        const response = await fetch('/api/documents/pdf-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: document.id,
            forceExtract
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setDocumentContent(data.content);
          toast.success(`PDF content ${data.source === 'cache' ? 'loaded from cache' : 'extracted successfully'}`);
        } else {
          const error = await response.json();
          toast.error('Failed to extract PDF content: ' + error.error);
        }
      } else {
        // For other document types, use the general endpoint
        const response = await fetch(`/api/documents/extract?id=${document.id}`);
        if (response.ok) {
          const data = await response.json();
          setDocumentContent(data.content);
          toast.success('Document content extracted successfully');
        } else {
          const error = await response.json();
          toast.error('Failed to extract document content: ' + error.error);
        }
      }
    } catch (error) {
      console.error('Error extracting document content:', error);
      toast.error('Error extracting document content: ' + (error as Error).message);
    } finally {
      setIsLoadingContent(false);
    }
  };
  
  // Fetch document content when component mounts
  useEffect(() => {
    fetchDocumentContent();
  }, [document]);
  
  // Initial message to explain what the user can do
  useEffect(() => {
    if (chatMessages.length === 0 && documentContent) {
      setChatMessages([{
        role: 'assistant',
        content: `I've analyzed "${document.name}". What would you like to know about this document?`,
        id: generateId()
      }]);
    }
  }, [document, chatMessages.length, documentContent]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Function to process the AI response text
  const processResponseText = (text: string) => {
    // Replace escaped newlines with actual newlines
    let processed = text.replace(/\\n/g, '\n');
    
    // Replace "/n" with newlines (if that's what's happening)
    processed = processed.replace(/\/n/g, '\n');
    
    return processed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoadingResponse || !documentContent) return;
    
    // Add user message to chat
    const userMessageObj = {
      role: 'user' as const,
      content: message.trim(),
      id: generateId()
    };
    
    setChatMessages(prev => [...prev, userMessageObj]);
    setMessage('');
    setIsLoadingResponse(true);
    
    try {
      // Create a new assistant message placeholder
      const assistantId = generateId();
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        id: assistantId
      }]);
      
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMessageObj].map(m => ({
            role: m.role,
            content: m.content
          })),
          documentId: document.id,
          documentType: document.type,
          documentUrl: document.url,
          documentName: document.name,
          documentContent: documentContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');
      
      let fullContent = '';
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        
        // Parse the chunk
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          // Check if it's a data line
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            
            // Check if it's the end of the stream
            if (data === '[DONE]') continue;
            
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(data);
              
              // Extract the content
              if (parsed.choices && parsed.choices[0]?.delta?.content) {
                fullContent += parsed.choices[0].delta.content;
              } else if (typeof parsed === 'string') {
                fullContent += parsed;
              } else if (parsed.content) {
                fullContent += parsed.content;
              }
            } catch (e) {
              // If it's not JSON, just add the data
              if (data.startsWith('0:"') && data.endsWith('"')) {
                // Handle the specific format in your logs
                fullContent += data.slice(3, -1);
              } else {
                fullContent += data;
              }
            }
          } else if (line.startsWith('0:"') && line.endsWith('"')) {
            // Handle the specific format in your logs
            fullContent += line.slice(3, -1);
          }
        }
        
        // Process the content before updating the UI
        const processedContent = processResponseText(fullContent);
        
        // Update the assistant message
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === assistantId 
              ? { ...msg, content: processedContent } 
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get a response');
      
      // Update the assistant message with an error
      setChatMessages(prev => 
        prev.map(msg => 
          msg.role === 'assistant' && msg.content === '' 
            ? { ...msg, content: 'Sorry, I encountered an error while processing your request. Please try again.' } 
            : msg
        )
      );
    } finally {
      setIsLoadingResponse(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Document Content</h3>
        <button
          onClick={() => fetchDocumentContent(true)}
          disabled={isLoadingContent}
          className="text-xs flex items-center text-blue-500 hover:text-blue-700"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingContent ? 'animate-spin' : ''}`} />
          Refresh Content
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-md mb-4">
        {isLoadingContent ? (
          <div className="text-center text-zinc-500 py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Analyzing document content...</p>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            <p>Ask a question about this document</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-zinc-100 dark:bg-zinc-800 ml-auto' 
                  : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            >
              {msg.role === 'user' ? (
                // User messages don't need markdown rendering
                <p className="whitespace-pre-wrap">
                  {msg.content || (isLoadingResponse ? 'Thinking...' : '')}
                </p>
              ) : (
                // Assistant messages use markdown rendering
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {msg.content ? (
                    <ReactMarkdown className="whitespace-pre-wrap">
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    isLoadingResponse && 'Thinking...'
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question about this document..."
          className="flex-1 p-2 border rounded-md bg-transparent"
          disabled={isLoadingResponse || isLoadingContent}
        />
        <button
          type="submit"
          disabled={isLoadingResponse || isLoadingContent || !message.trim()}
          className="p-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
        >
          {isLoadingResponse ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
      
      {documentContent && process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded border max-h-32 overflow-y-auto">
          <strong>Debug - Document Content:</strong>
          <pre className="whitespace-pre-wrap">{documentContent.slice(0, 500)}...</pre>
        </div>
      )}
    </div>
  );
}



// // components/document/document-chat.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useChat } from '@ai-sdk/react';
// import { Send, Loader2, RefreshCw } from 'lucide-react';
// import { toast } from 'sonner';

// type Document = {
//   id: string;
//   name: string;
//   type: string;
//   url: string;
//   contentText?: string | null;
// };

// export default function DocumentChat({ document }: { document: Document }) {
//   const [message, setMessage] = useState('');
//   const [documentContent, setDocumentContent] = useState<string | null>(null);
//   const [isLoadingContent, setIsLoadingContent] = useState(false);
  
//   const fetchDocumentContent = async () => {
//     setIsLoadingContent(true);
//     try {
//       const response = await fetch(`/api/documents/extract?id=${document.id}`);
      
//       if (response.ok) {
//         const data = await response.json();
//         setDocumentContent(data.content);
//         toast.success('Document content extracted');
//       } else {
//         const error = await response.json();
//         toast.error('Failed to extract content: ' + error.error);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error('Error extracting content');
//     } finally {
//       setIsLoadingContent(false);
//     }
//   };
  
//   // Fetch document content on mount
//   useEffect(() => {
//     fetchDocumentContent();
//   }, [document.id]);
  
//   const { messages, append, isLoading } = useChat({
//     id: document.id,
//     body: {
//       documentId: document.id,
//       documentName: document.name,
//       documentContent: documentContent || '',
//     },
//   });

//   // Send initial message when content is loaded
//   useEffect(() => {
//     if (documentContent && messages.length === 0) {
//       append({
//         role: 'assistant',
//         content: `I've analyzed "${document.name}". What would you like to know about this document?`,
//       });
//     }
//   }, [documentContent, messages.length, document.name, append]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!message.trim()) return;
    
//     append({
//       role: 'user',
//       content: message,
//     });
    
//     setMessage('');
//   };

//   return (
//     <div className="flex flex-col h-[400px]">
//       <div className="flex justify-between items-center mb-2">
//         <h3 className="text-sm font-medium">Document Chat</h3>
//         <button
//           onClick={fetchDocumentContent}
//           disabled={isLoadingContent}
//           className="text-xs flex items-center text-blue-500 hover:text-blue-700"
//         >
//           <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingContent ? 'animate-spin' : ''}`} />
//           Refresh Content
//         </button>
//       </div>
      
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-md mb-4">
//         {isLoadingContent ? (
//           <div className="text-center text-zinc-500 py-8">
//             <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
//             <p>Loading document content...</p>
//           </div>
//         ) : messages.length === 0 ? (
//           <div className="text-center text-zinc-500 py-8">
//             <p>Ask a question about this document</p>
//           </div>
//         ) : (
//           messages.map((msg) => (
//             <div 
//               key={msg.id} 
//               className={`p-3 rounded-lg max-w-[80%] ${
//                 msg.role === 'user' 
//                   ? 'bg-zinc-100 dark:bg-zinc-800 ml-auto' 
//                   : 'bg-zinc-200 dark:bg-zinc-700'
//               }`}
//             >
//               <p>{msg.content}</p>
//             </div>
//           ))
//         )}
//       </div>
      
//       <form onSubmit={handleSubmit} className="flex items-center space-x-2">
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Ask a question about this document..."
//           className="flex-1 p-2 border rounded-md bg-transparent"
//           disabled={isLoading || isLoadingContent || !documentContent}
//         />
//         <button
//           type="submit"
//           disabled={isLoading || isLoadingContent || !message.trim() || !documentContent}
//           className="p-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
//         >
//           {isLoading ? (
//             <Loader2 className="h-5 w-5 animate-spin" />
//           ) : (
//             <Send className="h-5 w-5" />
//           )}
//         </button>
//       </form>
      
//       {/* Debug section to show extracted content */}
//       {documentContent && process.env.NODE_ENV === 'development' && (
//         <div className="mt-4 p-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded border max-h-32 overflow-y-auto">
//           <strong>Document Content Preview:</strong>
//           <pre className="whitespace-pre-wrap">{documentContent.slice(0, 300)}...</pre>
//         </div>
//       )}
//     </div>
//   );
// }
