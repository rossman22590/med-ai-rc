
// components/report/report-viewer.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share, Loader2 } from 'lucide-react';

type Report = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: string | Date;
};

export default function ReportViewer({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reports/${reportId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/reports');
            return;
          }
          throw new Error('Failed to fetch report');
        }
        
        const data = await response.json();
        setReport(data.report);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [reportId, router]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500">Loading report...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 mb-4">{error}</p>
        <Link 
          href="/reports" 
          className="text-blue-500 hover:underline"
        >
          Back to Reports
        </Link>
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-zinc-500 mb-4">Report not found</p>
        <Link 
          href="/reports" 
          className="text-blue-500 hover:underline"
        >
          Back to Reports
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
      <Link 
        href="/reports" 
        className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Reports
      </Link>
      
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <button className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
        
        <div className="text-sm text-zinc-500 mb-8">
          Created on {new Date(report.createdAt).toLocaleDateString()}
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          {report.content.split('\n').map((paragraph, i) => {
            // Check if the paragraph contains an image URL
            if (paragraph.match(/https?:\/\/.*\.(jpeg|jpg|gif|png)/i)) {
              return (
                <div key={i} className="my-4 flex justify-center">
                  <div className="relative w-full max-w-2xl h-[300px]">
                    <Image 
                      src={paragraph.trim()}
                      alt="Report image"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              );
            }
            return <p key={i}>{paragraph}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
// // components/document/document-viewer.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
// import DocumentChat from '@/components/document/document-chat';

// type Document = {
//   id: string;
//   name: string;
//   type: string;
//   url: string;
//   contentText?: string | null;
//   createdAt: string | Date;
// };

// export default function DocumentViewer({ documentId }: { documentId: string }) {
//   const [document, setDocument] = useState<Document | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
  
//   useEffect(() => {
//     const fetchDocument = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`/api/documents/${documentId}`);
        
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
//   }, [documentId, router]);
  
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[50vh]">
//         <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
//         <p className="text-zinc-500">Loading document...</p>
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[50vh]">
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
  
//   if (!document) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[50vh]">
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
