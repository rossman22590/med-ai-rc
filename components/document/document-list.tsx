// components/document/document-list.tsx
'use client';

import { useState } from 'react';
import { FileText, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  contentText?: string;
  createdAt: Date;
  updatedAt: Date;
};

interface DocumentListProps {
  documents: Document[];
  onDeleteComplete?: () => void; // Make this prop optional
}

export default function DocumentList({ documents, onDeleteComplete }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    setDeletingId(id);
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      toast.success('Document deleted successfully');
      
      if (onDeleteComplete) {
        onDeleteComplete();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };
  
  if (documents.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
        <p className="text-zinc-500">No documents uploaded yet.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className="border rounded-lg p-4 bg-white dark:bg-zinc-800"
        >
          <div className="flex justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-700 rounded-md">
                <FileText className="h-5 w-5 text-zinc-500" />
              </div>
              <div>
                <h3 className="font-medium">{doc.name}</h3>
                <p className="text-sm text-zinc-500">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(doc.id)}
              disabled={deletingId === doc.id}
              className="text-zinc-400 hover:text-red-500 transition-colors"
            >
              {deletingId === doc.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// // components/document/document-list.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   FileText, 
//   Image as ImageIcon, 
//   Calendar, 
//   Trash2,
//   ExternalLink,
//   FileQuestion
// } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';
// import { deleteDocument } from '@/lib/actions/documents';
// import { toast } from 'sonner';

// type Document = {
//   id: string;
//   name: string;
//   type: string;
//   url: string;
//   createdAt: Date;
// };

// export default function DocumentList({ documents }: { documents: Document[] }) {
//   const router = useRouter();
//   const [deleting, setDeleting] = useState<string | null>(null);

//   if (!documents || documents.length === 0) {
//     return (
//       <div className="text-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
//         <FileQuestion className="h-12 w-12 mx-auto text-zinc-400" />
//         <h3 className="mt-4 text-lg font-medium">No documents yet</h3>
//         <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
//           Upload medical documents to get started
//         </p>
//       </div>
//     );
//   }

//   const handleDelete = async (id: string) => {
//     try {
//       setDeleting(id);
//       await deleteDocument(id);
//       toast.success('Document deleted');
//       router.refresh();
//     } catch (error) {
//       toast.error('Failed to delete document');
//     } finally {
//       setDeleting(null);
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//       {documents.map((doc) => (
//         <div 
//           key={doc.id}
//           className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-zinc-900"
//         >
//           <div className="p-4 flex flex-col h-full">
//             <div className="flex items-start justify-between">
//               <div className="flex items-center space-x-3">
//                 {doc.type === 'pdf' ? (
//                   <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
//                     <FileText className="h-6 w-6 text-blue-500 dark:text-blue-300" />
//                   </div>
//                 ) : (
//                   <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md">
//                     <ImageIcon className="h-6 w-6 text-green-500 dark:text-green-300" />
//                   </div>
//                 )}
//                 <div className="flex-1 min-w-0">
//                   <h3 className="text-sm font-medium truncate" title={doc.name}>
//                     {doc.name}
//                   </h3>
//                 </div>
//               </div>
//             </div>
            
//             <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
//               <div className="flex items-center">
//                 <Calendar className="h-3 w-3 mr-1" />
//                 {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
//               </div>
              
//               <div className="flex space-x-2">
//                 <a 
//                   href={doc.url} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="p-1 hover:text-zinc-900 dark:hover:text-zinc-200"
//                 >
//                   <ExternalLink className="h-4 w-4" />
//                 </a>
//                 <button
//                   onClick={() => handleDelete(doc.id)}
//                   disabled={deleting === doc.id}
//                   className="p-1 hover:text-red-500"
//                 >
//                   <Trash2 className={`h-4 w-4 ${deleting === doc.id ? 'animate-pulse' : ''}`} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
