// components/document/document-chat.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  contentText?: string | null;
};

export default function DocumentChat({ document }: { document: Document }) {
  const [message, setMessage] = useState('');
  const [documentContent, setDocumentContent] = useState<string | null>(document.contentText || null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Define fetchDocumentContent as a useCallback to avoid dependency issues
  const fetchDocumentContent = useCallback(async () => {
    setIsLoadingContent(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/documents/extract?id=${document.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setDocumentContent(data.content);
        console.log('Document content loaded:', data.content.substring(0, 100) + '...');
        toast.success('Document content extracted successfully');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to extract document content';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Error fetching document content';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingContent(false);
    }
  }, [document.id]);
  
  // Fetch document content on mount if not already available
  useEffect(() => {
    if (!documentContent) {
      fetchDocumentContent();
    }
  }, [documentContent, fetchDocumentContent]);
  
  // Initialize chat with the document content
  const { messages, append, isLoading } = useChat({
    id: document.id,
    body: {
      documentId: document.id,
      documentName: document.name,
      documentContent: documentContent || '',
    },
  });

  // Send initial message when content is loaded
  useEffect(() => {
    if (documentContent && messages.length === 0) {
      append({
        role: 'assistant',
        content: `I've analyzed "${document.name}". What would you like to know about this document?`,
      });
    }
  }, [documentContent, messages.length, document.name, append]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Log what's being sent to verify
    console.log('Sending message with document content:', {
      message,
      documentContentLength: documentContent?.length || 0,
      documentContentPreview: documentContent?.substring(0, 100) + '...' || 'No content'
    });
    
    append({
      role: 'user',
      content: message,
    }, {
      body: {
        documentId: document.id,
        documentName: document.name,
        documentContent: documentContent || '',
      }
    });
    
    setMessage('');
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Document Chat</h3>
        <button
          onClick={fetchDocumentContent}
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
            <p>Loading document content...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p>Error: {error}</p>
            <button 
              onClick={fetchDocumentContent}
              className="mt-2 text-sm text-blue-500 hover:text-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            <p>Ask a question about this document</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-zinc-100 dark:bg-zinc-800 ml-auto' 
                  : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            >
              <p>{msg.content}</p>
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question about this document..."
          className="flex-1 p-2 border rounded-md bg-transparent"
          disabled={isLoading || isLoadingContent || !documentContent}
        />
        <button
          type="submit"
          disabled={isLoading || isLoadingContent || !message.trim() || !documentContent}
          className="p-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
      
      {/* Debug section to show extracted content */}
      {documentContent && process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded border max-h-32 overflow-y-auto">
          <strong>Document Content Preview:</strong>
          <pre className="whitespace-pre-wrap">{documentContent.slice(0, 300)}...</pre>
        </div>
      )}
    </div>
  );
}

// // components/document/document-chat.tsx
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useChat } from '@ai-sdk/react';
// import { Send, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
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
//   const [documentContent, setDocumentContent] = useState<string | null>(document.contentText || null);
//   const [isLoadingContent, setIsLoadingContent] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const chatInitialized = useRef(false);
  
//   const fetchDocumentContent = async () => {
//     setIsLoadingContent(true);
//     setError(null);
    
//     try {
//       const response = await fetch(`/api/documents/extract?id=${document.id}`);
      
//       if (response.ok) {
//         const data = await response.json();
//         setDocumentContent(data.content);
//         console.log('Document content loaded:', data.content.substring(0, 100) + '...');
//         toast.success('Document content extracted successfully');
//       } else {
//         const errorData = await response.json();
//         const errorMessage = errorData.error || 'Failed to extract document content';
//         setError(errorMessage);
//         toast.error(errorMessage);
//       }
//     } catch (error) {
//       const errorMessage = (error as Error).message || 'Error fetching document content';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsLoadingContent(false);
//     }
//   };
  
//   // Fetch document content on mount if not already available
//   useEffect(() => {
//     if (!documentContent) {
//       fetchDocumentContent();
//     }
//   }, [document.id, documentContent]);
  
//   // Initialize chat with the document content
//   const { messages, append, isLoading, reload } = useChat({
//     id: document.id,
//     body: {
//       documentId: document.id,
//       documentName: document.name,
//       documentContent: documentContent || '',
//     },
//   });

//   // Send initial message when content is loaded
//   useEffect(() => {
//     if (documentContent && messages.length === 0 && !chatInitialized.current) {
//       chatInitialized.current = true;
//       append({
//         role: 'assistant',
//         content: `I've analyzed "${document.name}". What would you like to know about this document?`,
//       });
//     }
//   }, [documentContent, messages.length, document.name, append]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!message.trim()) return;
    
//     // Log what's being sent to verify
//     console.log('Sending message with document content:', {
//       message,
//       documentContentLength: documentContent?.length || 0,
//       documentContentPreview: documentContent?.substring(0, 100) + '...' || 'No content'
//     });
    
//     append({
//       role: 'user',
//       content: message,
//     }, {
//       body: {
//         documentId: document.id,
//         documentName: document.name,
//         documentContent: documentContent || '',
//       }
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
//         ) : error ? (
//           <div className="text-center text-red-500 py-8">
//             <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
//             <p>Error: {error}</p>
//             <button 
//               onClick={fetchDocumentContent}
//               className="mt-2 text-sm text-blue-500 hover:text-blue-700"
//             >
//               Try Again
//             </button>
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
