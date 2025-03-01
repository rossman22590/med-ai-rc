// app/documents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Image as ImageIcon, Loader2, Trash, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import DocumentUploader from '@/components/document/document-uploader';
import { toast } from 'sonner';

type Document = {
  id: string;
  name: string;
  type: string;
  createdAt: string | Date;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  
  // Check authentication
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Use fetch to get the documents
      const response = await fetch('/api/documents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!isSignedIn) return;
    fetchDocuments();
  }, [isSignedIn]);
  
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    // Prevent the click from navigating to the document page
    e.preventDefault();
    e.stopPropagation();
    
    // Show a more detailed confirmation message
    if (!confirm('Are you sure you want to delete this document? If this document is used in any reports, you need to remove those references first.')) {
      return;
    }
    
    setDeletingId(id);
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle foreign key constraint error specifically
        if (data.error && data.error.includes('foreign key constraint')) {
          throw new Error('This document is used in one or more reports. Please remove those references first before deleting.');
        } else {
          throw new Error(data.error || 'Failed to delete document');
        }
      }
      
      toast.success('Document deleted successfully');
      // Update the documents list after successful deletion
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(`${(error as Error).message}`, {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setDeletingId(null);
    }
  };
  
  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500">Loading documents...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Medical Documents</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Upload medical documents, reports, or test results for AI analysis
          </p>
        </div>
        
        <DocumentUploader onUploadComplete={fetchDocuments} />
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
          
          {documents.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
              <p className="text-zinc-500 dark:text-zinc-400 mb-4">No documents uploaded yet</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Upload medical documents to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link
                    href={`/documents/${doc.id}`}
                    className="block p-4"
                  >
                    <div className="flex items-center mb-3">
                      {doc.type === 'pdf' ? (
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
                          <FileText className="h-6 w-6 text-blue-500 dark:text-blue-300" />
                        </div>
                      ) : (
                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md">
                          <ImageIcon className="h-6 w-6 text-green-500 dark:text-green-300" />
                        </div>
                      )}
                      <div className="ml-3">
                        <h3 className="text-sm font-medium truncate max-w-[200px]">{doc.name}</h3>
                        <p className="text-xs text-zinc-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    disabled={deletingId === doc.id}
                    className="absolute top-3 right-3 p-2 text-zinc-400 hover:text-red-500 transition-colors bg-white dark:bg-zinc-800 rounded-full"
                    aria-label="Delete document"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// // app/documents/page.tsx
// import { Metadata } from 'next';
// import Link from 'next/link';
// import DocumentUploader from '@/components/document/document-uploader';
// import { getUserDocuments } from '@/lib/actions/documents';
// import { FileText, Image as ImageIcon, Plus } from 'lucide-react';

// export const metadata: Metadata = {
//   title: 'Medical Documents | Family Medical Translator',
//   description: 'Upload and manage your medical documents',
// };

// export default async function DocumentsPage() {
//   // Properly await getUserDocuments
//   const documents = await getUserDocuments();
  
//   return (
//     <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
//       <div className="space-y-8">
//         <div>
//           <h1 className="text-2xl font-bold">Medical Documents</h1>
//           <p className="text-zinc-500 dark:text-zinc-400">
//             Upload medical documents, reports, or test results for AI analysis
//           </p>
//         </div>
        
//         <DocumentUploader />
        
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
          
//           {documents.length === 0 ? (
//             <div className="text-center p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
//               <p className="text-zinc-500 dark:text-zinc-400 mb-4">No documents uploaded yet</p>
//               <p className="text-sm text-zinc-400 dark:text-zinc-500">
//                 Upload medical documents to get started
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {documents.map((doc) => (
//                 <Link
//                   key={doc.id}
//                   href={`/documents/${doc.id}`}
//                   className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
//                 >
//                   <div className="p-4">
//                     <div className="flex items-center mb-3">
//                       {doc.type === 'pdf' ? (
//                         <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
//                           <FileText className="h-6 w-6 text-blue-500 dark:text-blue-300" />
//                         </div>
//                       ) : (
//                         <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md">
//                           <ImageIcon className="h-6 w-6 text-green-500 dark:text-green-300" />
//                         </div>
//                       )}
//                       <div className="ml-3">
//                         <h3 className="text-sm font-medium truncate max-w-[200px]">{doc.name}</h3>
//                         <p className="text-xs text-zinc-500">
//                           {new Date(doc.createdAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
