// app/documents/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import DocumentChat from '@/components/document/document-chat';

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  contentText?: string | null;
  createdAt: string | Date;
};

export default function DocumentPage() {
  const params = useParams();
  const id = params?.id as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  
  // Check authentication
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Fetch document
  useEffect(() => {
    if (!id || !isSignedIn) return;
    
    const fetchDocument = async () => {
      try {
        setLoading(true);
        
        // Use fetch to get the document
        const response = await fetch(`/api/documents/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/documents');
            return;
          }
          throw new Error('Failed to fetch document');
        }
        
        const data = await response.json();
        setDocument(data.document);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [id, isSignedIn, router]);
  
  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500">Loading document...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Link 
          href="/documents" 
          className="text-blue-500 hover:underline"
        >
          Back to Documents
        </Link>
      </div>
    );
  }
  
  // Show not found state
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-zinc-500 mb-4">Document not found</p>
        <Link 
          href="/documents" 
          className="text-blue-500 hover:underline"
        >
          Back to Documents
        </Link>
      </div>
    );
  }
  
  // Show document
  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <Link 
        href="/documents" 
        className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Documents
      </Link>
      
      <div className="flex items-center mb-6">
        {document.type === 'pdf' ? (
          <FileText className="h-6 w-6 text-blue-500 mr-2" />
        ) : (
          <ImageIcon className="h-6 w-6 text-green-500 mr-2" />
        )}
        <h1 className="text-2xl font-bold">{document.name}</h1>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-lg border p-6">
        {document.type === 'pdf' ? (
          <iframe 
            src={document.url} 
            className="w-full h-[70vh]" 
            title={document.name}
          />
        ) : (
          <div className="flex justify-center relative h-[70vh]">
            {/* Using Next.js Image component with proper configuration for data URLs */}
            <div className="relative w-full h-full">
              <Image 
                src={document.url}
                alt={document.name}
                fill
                className="object-contain"
                unoptimized={document.url.startsWith('data:')} // Skip optimization for data URLs
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white dark:bg-zinc-900 rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Chat with this document</h2>
        <DocumentChat document={document} />
      </div>
    </div>
  );
}

// // app/documents/[id]/page.tsx
// 'use client';

// import { useParams } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
// import { useAuth } from '@clerk/nextjs';
// import DocumentChat from '@/components/document/document-chat';

// type Document = {
//   id: string;
//   name: string;
//   type: string;
//   url: string;
//   contentText?: string | null;
//   createdAt: string | Date;
// };

// export default function DocumentPage() {
//   const params = useParams();
//   const id = params?.id as string;
//   const [document, setDocument] = useState<Document | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const { isLoaded, isSignedIn } = useAuth();
  
//   // Check authentication
//   useEffect(() => {
//     if (isLoaded && !isSignedIn) {
//       router.push('/');
//     }
//   }, [isLoaded, isSignedIn, router]);
  
//   // Fetch document
//   useEffect(() => {
//     if (!id || !isSignedIn) return;
    
//     const fetchDocument = async () => {
//       try {
//         setLoading(true);
        
//         // Use fetch to get the document
//         const response = await fetch(`/api/documents/${id}`);
        
//         if (!response.ok) {
//           if (response.status === 404) {
//             router.push('/documents');
//             return;
//           }
//           throw new Error('Failed to fetch document');
//         }
        
//         const data = await response.json();
//         setDocument(data.document);
//       } catch (err) {
//         console.error('Error fetching document:', err);
//         setError('Failed to load document. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchDocument();
//   }, [id, isSignedIn, router]);
  
//   // Show loading state
//   if (!isLoaded || loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
//         <p className="text-zinc-500">Loading document...</p>
//       </div>
//     );
//   }
  
//   // Show error state
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-red-500 mb-4">{error}</p>
//         <Link 
//           href="/documents" 
//           className="text-blue-500 hover:underline"
//         >
//           Back to Documents
//         </Link>
//       </div>
//     );
//   }
  
//   // Show not found state
//   if (!document) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-zinc-500 mb-4">Document not found</p>
//         <Link 
//           href="/documents" 
//           className="text-blue-500 hover:underline"
//         >
//           Back to Documents
//         </Link>
//       </div>
//     );
//   }
  
//   // Show document
//   return (
//     <div className="container mx-auto px-4 py-8 pt-20">
//       <Link 
//         href="/documents" 
//         className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-6"
//       >
//         <ArrowLeft className="h-4 w-4 mr-2" />
//         Back to Documents
//       </Link>
      
//       <div className="flex items-center mb-6">
//         {document.type === 'pdf' ? (
//           <FileText className="h-6 w-6 text-blue-500 mr-2" />
//         ) : (
//           <ImageIcon className="h-6 w-6 text-green-500 mr-2" />
//         )}
//         <h1 className="text-2xl font-bold">{document.name}</h1>
//       </div>
      
//       <div className="bg-white dark:bg-zinc-900 rounded-lg border p-6">
//         {document.type === 'pdf' ? (
//           <iframe 
//             src={document.url} 
//             className="w-full h-[70vh]" 
//             title={document.name}
//           />
//         ) : (
//           <div className="flex justify-center">
//             <img 
//               src={document.url} 
//               alt={document.name} 
//               className="max-w-full max-h-[70vh] object-contain"
//             />
//           </div>
//         )}
//       </div>
      
//       <div className="mt-8 bg-white dark:bg-zinc-900 rounded-lg border p-6">
//         <h2 className="text-xl font-semibold mb-4">Chat with this document</h2>
//         <DocumentChat document={document} />
//       </div>
//     </div>
//   );
// }
