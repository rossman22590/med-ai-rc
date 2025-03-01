// app/reports/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share, Loader2, Download } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useReactToPrint } from 'react-to-print';

type Report = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: string | Date;
};

// Simple code block component without external dependencies
const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  return (
    <div className="rounded-md bg-gray-900 p-4 my-4 overflow-x-auto print:bg-gray-200 print:text-black">
      <pre className="text-sm text-white print:text-black whitespace-pre-wrap break-words">
        <code>{value}</code>
      </pre>
    </div>
  );
};

// Extract the first section (AT-A-GLANCE SUMMARY) from markdown content
const extractAtAGlanceSummary = (content: string): string => {
  try {
    const atAGlanceRegex = /## AT-A-GLANCE SUMMARY\s*([\s\S]*?)(?=\s*##\s|$)/i;
    const match = content.match(atAGlanceRegex);
    return match ? match[1].trim() : '';
  } catch (error) {
    console.error('Error extracting at-a-glance summary:', error);
    return '';
  }
};

// Remove the AT-A-GLANCE SUMMARY section from the content to avoid duplication
const removeAtAGlanceSummary = (content: string): string => {
  try {
    const atAGlanceRegex = /(# Medical Report Analysis.*?(?=\s*##\s))?## AT-A-GLANCE SUMMARY\s*[\s\S]*?(?=\s*##\s|$)/i;
    return content.replace(atAGlanceRegex, '# Medical Report Analysis');
  } catch (error) {
    console.error('Error removing at-a-glance summary:', error);
    return content;
  }
};

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const [report, setReport] = useState<Report | null>(null);
  const [atAGlanceSummary, setAtAGlanceSummary] = useState<string>('');
  const [detailedContent, setDetailedContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Check authentication
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Fetch report
  useEffect(() => {
    if (!id || !isSignedIn) return;
    
    const fetchReport = async () => {
      try {
        setLoading(true);
        
        // Use fetch to get the report
        const response = await fetch(`/api/reports/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/reports');
            return;
          }
          throw new Error('Failed to fetch report');
        }
        
        const data = await response.json();
        setReport(data.report);
        
        // Extract the at-a-glance summary from the content
        const summary = extractAtAGlanceSummary(data.report.content);
        setAtAGlanceSummary(summary);
        
        // Remove the at-a-glance summary from the content to avoid duplication
        const detailed = removeAtAGlanceSummary(data.report.content);
        setDetailedContent(detailed);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id, isSignedIn, router]);
  
  // Handle PDF download
  const handlePrint = useReactToPrint({
    documentTitle: report?.title || 'Medical Report',
    onBeforePrint: async () => {
      // Add any pre-print setup if needed
      document.body.classList.add('printing');
      // Return a resolved promise to satisfy the type requirement
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log('PDF downloaded successfully');
      document.body.classList.remove('printing');
    },
    contentRef: printRef,
    pageStyle: `
      @page {
        size: A4;
        margin: 25mm 25mm 25mm 25mm; /* Increased margins on all sides */
      }
      @media print {
        * {
          box-sizing: border-box !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
          font-family: Arial, sans-serif !important;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          color: #333333 !important;
          line-height: 1.5 !important;
        }
        .print-container {
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        pre, code {
          white-space: pre-wrap !important;
          word-break: break-word !important;
          max-width: 100% !important;
          font-size: 0.85em !important;
        }
        table {
          page-break-inside: avoid !important;
          width: 100% !important;
          max-width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
        }
        td, th {
          word-break: break-word !important;
          max-width: 100% !important;
          overflow-wrap: break-word !important;
          padding: 6px !important;
        }
        img {
          max-width: 90% !important;
          height: auto !important;
          margin: 0 auto !important;
          display: block !important;
        }
        h1 {
          font-size: 24px !important;
          margin-top: 24px !important;
          margin-bottom: 16px !important;
          font-weight: bold !important;
          color: #333333 !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        }
        h2 {
          font-size: 20px !important;
          margin-top: 20px !important;
          margin-bottom: 12px !important;
          font-weight: bold !important;
          color: #333333 !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        }
        h3 {
          font-size: 16px !important;
          margin-top: 16px !important;
          margin-bottom: 8px !important;
          font-weight: bold !important;
          color: #333333 !important;
          text-transform: uppercase !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        }
        p {
          margin-bottom: 12px !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
        }
        ul, ol {
          padding-left: 20px !important;
          margin-top: 8px !important;
          margin-bottom: 16px !important;
        }
        li {
          margin-bottom: 6px !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
        }
        a {
          text-decoration: none !important;
          color: #000 !important;
        }
        /* Ensure content doesn't go beyond margins */
        .prose {
          max-width: 100% !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        /* Force all elements to respect container width */
        .prose > * {
          max-width: 100% !important;
          overflow-wrap: break-word !important;
        }
        /* Special styling for the summary box */
        .summary-box {
          background-color: #f0f7ff !important;
          border: 1px solid #d0e3ff !important;
          border-radius: 4px !important;
          padding: 16px !important;
          margin-bottom: 24px !important;
        }
        .summary-box h2 {
          margin-top: 0 !important;
          color: #2c5282 !important;
          font-size: 18px !important;
        }
        /* Key findings section styling */
        .key-findings h3 {
          color: #2c5282 !important;
        }
        /* Bullet points styling */
        .bullet-list li {
          position: relative !important;
          padding-left: 5px !important;
        }
        /* Nested bullet points */
        .bullet-list li li {
          margin-top: 4px !important;
        }
      }
    `,
  });
  
  // Wrapper function to fix type mismatch with onClick handler
  const handlePrintClick = () => {
    if (handlePrint) {
      handlePrint();
    }
  };
  
  // Define markdown components to be used for rendering
  const markdownComponents = {
    code({node, className, children, ...props}: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const value = String(children).replace(/\n$/, '');
      
      return !className?.includes('inline') ? (
        <CodeBlock language={language} value={value} />
      ) : (
        <code className={className + " break-words max-w-full"} {...props}>
          {children}
        </code>
      );
    },
    table({node, ...props}: any) {
      return (
        <div className="overflow-x-auto my-8 print:overflow-visible w-full max-w-full">
          <table className="min-w-full w-full divide-y divide-zinc-200 dark:divide-zinc-700 print:border print:border-collapse print:table-fixed" {...props} />
        </div>
      );
    },
    thead({node, ...props}: any) {
      return <thead className="bg-zinc-50 dark:bg-zinc-800 print:bg-gray-100" {...props} />;
    },
    th({node, ...props}: any) {
      return <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider print:text-black print:border print:border-gray-300 break-words" {...props} />;
    },
    td({node, ...props}: any) {
      return <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 print:text-black print:border print:border-gray-300 break-words" {...props} />;
    },
    tr({node, ...props}: any) {
      return <tr className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800/50 print:border print:border-gray-300" {...props} />;
    },
    img({node, ...props}: any) {
      return (
        <div className="my-8 flex justify-center w-full">
          <img 
            src={props.src || ''}
            alt={props.alt || 'Report image'}
            className="max-w-full rounded-md shadow-sm print:max-h-[300px] print:shadow-none print:max-w-[90%]"
            style={{ maxHeight: '400px' }}
          />
        </div>
      );
    },
    h1({node, ...props}: any) {
      return <h1 className="text-2xl font-bold mt-8 mb-4 break-words max-w-full" {...props} />;
    },
    h2({node, ...props}: any) {
      return <h2 className="text-xl font-bold mt-6 mb-3 break-words max-w-full" {...props} />;
    },
    h3({node, ...props}: any) {
      return <h3 className="text-lg font-bold mt-4 mb-2 break-words max-w-full uppercase text-zinc-700 print:text-zinc-900" {...props} />;
    },
    p({node, ...props}: any) {
      return <p className="my-4 break-words max-w-full" {...props} />;
    },
    ul({node, ...props}: any) {
      return <ul className="list-disc pl-6 my-4 space-y-2 max-w-full bullet-list" {...props} />;
    },
    ol({node, ...props}: any) {
      return <ol className="list-decimal pl-6 my-4 space-y-2 max-w-full" {...props} />;
    },
    li({node, ...props}: any) {
      return <li className="break-words max-w-full" {...props} />;
    },
    blockquote({node, ...props}: any) {
      return <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 py-2 my-4 text-zinc-700 dark:text-zinc-300 italic break-words print:border-gray-400 print:text-black max-w-full" {...props} />;
    },
    a({node, ...props}: any) {
      return <a className="text-blue-600 hover:underline print:text-black print:no-underline break-words max-w-full" {...props} />;
    }
  };
  
  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500">Loading report...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
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
  
  // Show not found state
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
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
  
  // Show report with enhanced features
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
      {/* Navigation and buttons - hidden in print */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Link 
          href="/reports" 
          className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Link>
        
        <div className="flex gap-2">
          <button 
            onClick={handlePrintClick}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
          
          <button className="flex items-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2 border rounded-md">
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
      </div>
      
      {/* Printable content */}
      <div ref={printRef} className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border p-6 mb-8 print:p-0 print:border-0 print:shadow-none print-container">
        {/* Header with title and date */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 break-words">{report.title}</h1>
          <div className="text-sm text-zinc-500 print:text-black">
            Created on {new Date(report.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        {/* At-a-glance summary - styled to match the example */}
        {atAGlanceSummary && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-md mb-6 print:bg-[#f0f7ff] print:border-[#d0e3ff] print:text-black summary-box">
            <h2 className="text-lg font-semibold mb-2">At-A-Glance Summary</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none print:prose-black">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {atAGlanceSummary}
              </ReactMarkdown>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="prose dark:prose-invert max-w-none print:prose-black print:max-w-full">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {detailedContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// // app/reports/[id]/page.tsx
// 'use client';

// import { useParams } from 'next/navigation';
// import { useState, useEffect, useRef } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, Share, Loader2, Download } from 'lucide-react';
// import { useAuth } from '@clerk/nextjs';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import { useReactToPrint } from 'react-to-print';

// type Report = {
//   id: string;
//   title: string;
//   content: string;
//   summary?: string;
//   createdAt: string | Date;
// };

// // Simple code block component without external dependencies
// const CodeBlock = ({ language, value }: { language: string; value: string }) => {
//   return (
//     <div className="rounded-md bg-gray-900 p-4 my-4 overflow-x-auto">
//       <pre className="text-sm text-white">
//         <code>{value}</code>
//       </pre>
//     </div>
//   );
// };

// // Extract the first section (AT-A-GLANCE SUMMARY) from markdown content
// const extractAtAGlanceSummary = (content: string): string => {
//   try {
//     const atAGlanceRegex = /## AT-A-GLANCE SUMMARY\s*([\s\S]*?)(?=\s*##\s|$)/i;
//     const match = content.match(atAGlanceRegex);
//     return match ? match[1].trim() : '';
//   } catch (error) {
//     console.error('Error extracting at-a-glance summary:', error);
//     return '';
//   }
// };

// // Remove the AT-A-GLANCE SUMMARY section from the content to avoid duplication
// const removeAtAGlanceSummary = (content: string): string => {
//   try {
//     const atAGlanceRegex = /(# Medical Report Analysis.*?(?=\s*##\s))?## AT-A-GLANCE SUMMARY\s*[\s\S]*?(?=\s*##\s|$)/i;
//     return content.replace(atAGlanceRegex, '# Medical Report Analysis');
//   } catch (error) {
//     console.error('Error removing at-a-glance summary:', error);
//     return content;
//   }
// };

// export default function ReportPage() {
//   const params = useParams();
//   const id = params?.id as string;
//   const [report, setReport] = useState<Report | null>(null);
//   const [atAGlanceSummary, setAtAGlanceSummary] = useState<string>('');
//   const [detailedContent, setDetailedContent] = useState<string>('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const { isLoaded, isSignedIn } = useAuth();
//   const printRef = useRef<HTMLDivElement>(null);
  
//   // Check authentication
//   useEffect(() => {
//     if (isLoaded && !isSignedIn) {
//       router.push('/');
//     }
//   }, [isLoaded, isSignedIn, router]);
  
//   // Fetch report
//   useEffect(() => {
//     if (!id || !isSignedIn) return;
    
//     const fetchReport = async () => {
//       try {
//         setLoading(true);
        
//         // Use fetch to get the report
//         const response = await fetch(`/api/reports/${id}`);
        
//         if (!response.ok) {
//           if (response.status === 404) {
//             router.push('/reports');
//             return;
//           }
//           throw new Error('Failed to fetch report');
//         }
        
//         const data = await response.json();
//         setReport(data.report);
        
//         // Extract the at-a-glance summary from the content
//         const summary = extractAtAGlanceSummary(data.report.content);
//         setAtAGlanceSummary(summary);
        
//         // Remove the at-a-glance summary from the content to avoid duplication
//         const detailed = removeAtAGlanceSummary(data.report.content);
//         setDetailedContent(detailed);
//       } catch (err) {
//         console.error('Error fetching report:', err);
//         setError('Failed to load report. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchReport();
//   }, [id, isSignedIn, router]);
  
//   // Handle PDF download
//   const handlePrint = useReactToPrint({
//     documentTitle: report?.title || 'Medical Report',
//     onAfterPrint: () => console.log('PDF downloaded successfully'),
//     contentRef: printRef,
//   });
  
//   // Wrapper function to fix type mismatch with onClick handler
//   const handlePrintClick = () => {
//     if (handlePrint) {
//       handlePrint();
//     }
//   };
  
//   // Define markdown components to be used for rendering
//   const markdownComponents = {
//     code({node, className, children, ...props}: any) {
//       const match = /language-(\w+)/.exec(className || '');
//       const language = match ? match[1] : '';
//       const value = String(children).replace(/\n$/, '');
      
//       return !className?.includes('inline') ? (
//         <CodeBlock language={language} value={value} />
//       ) : (
//         <code className={className} {...props}>
//           {children}
//         </code>
//       );
//     },
//     table({node, ...props}: any) {
//       return (
//         <div className="overflow-x-auto my-8">
//           <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700" {...props} />
//         </div>
//       );
//     },
//     thead({node, ...props}: any) {
//       return <thead className="bg-zinc-50 dark:bg-zinc-800" {...props} />;
//     },
//     th({node, ...props}: any) {
//       return <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider" {...props} />;
//     },
//     td({node, ...props}: any) {
//       return <td className="px-6 py-4 whitespace-nowrap text-zinc-900 dark:text-zinc-100" {...props} />;
//     },
//     tr({node, ...props}: any) {
//       return <tr className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800/50" {...props} />;
//     },
//     img({node, ...props}: any) {
//       return (
//         <div className="my-8 flex justify-center">
//           <img 
//             src={props.src || ''}
//             alt={props.alt || 'Report image'}
//             className="max-w-full rounded-md shadow-sm"
//             style={{ maxHeight: '400px' }}
//           />
//         </div>
//       );
//     },
//     h1({node, ...props}: any) {
//       return <h1 className="text-2xl font-bold mt-8 mb-4" {...props} />;
//     },
//     h2({node, ...props}: any) {
//       return <h2 className="text-xl font-bold mt-6 mb-3" {...props} />;
//     },
//     h3({node, ...props}: any) {
//       return <h3 className="text-lg font-bold mt-4 mb-2" {...props} />;
//     },
//     ul({node, ...props}: any) {
//       return <ul className="list-disc pl-6 my-4 space-y-2" {...props} />;
//     },
//     ol({node, ...props}: any) {
//       return <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />;
//     },
//     blockquote({node, ...props}: any) {
//       return <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 py-2 my-4 text-zinc-700 dark:text-zinc-300 italic" {...props} />;
//     }
//   };
  
//   // Show loading state
//   if (!isLoaded || loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
//         <p className="text-zinc-500">Loading report...</p>
//       </div>
//     );
//   }
  
//   // Show error state
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-red-500 mb-4">{error}</p>
//         <Link 
//           href="/reports" 
//           className="text-blue-500 hover:underline"
//         >
//           Back to Reports
//         </Link>
//       </div>
//     );
//   }
  
//   // Show not found state
//   if (!report) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-zinc-500 mb-4">Report not found</p>
//         <Link 
//           href="/reports" 
//           className="text-blue-500 hover:underline"
//         >
//           Back to Reports
//         </Link>
//       </div>
//     );
//   }
  
//   // Show report with enhanced features
//   return (
//     <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
//       <div className="flex justify-between items-center mb-6">
//         <Link 
//           href="/reports" 
//           className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
//         >
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back to Reports
//         </Link>
        
//         <div className="flex gap-2">
//           <button 
//             onClick={handlePrintClick}
//             className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
//           >
//             <Download className="h-4 w-4 mr-2" />
//             Download PDF
//           </button>
          
//           <button className="flex items-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2 border rounded-md">
//             <Share className="h-4 w-4 mr-2" />
//             Share
//           </button>
//         </div>
//       </div>
      
//       <div ref={printRef} className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border p-6 mb-8">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold mb-2">{report.title}</h1>
//           <div className="text-sm text-zinc-500">
//             Created on {new Date(report.createdAt).toLocaleDateString()}
//           </div>
//         </div>
        
//         {atAGlanceSummary && (
//           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-md mb-6">
//             <h2 className="text-lg font-semibold mb-2">At-A-Glance Summary</h2>
//             <div className="prose prose-sm dark:prose-invert max-w-none">
//               <ReactMarkdown
//                 remarkPlugins={[remarkGfm]}
//                 components={markdownComponents}
//               >
//                 {atAGlanceSummary}
//               </ReactMarkdown>
//             </div>
//           </div>
//         )}
        
//         <div className="prose dark:prose-invert max-w-none">
//           <ReactMarkdown
//             remarkPlugins={[remarkGfm]}
//             components={markdownComponents}
//           >
//             {detailedContent}
//           </ReactMarkdown>
//         </div>
//       </div>
//     </div>
//   );
// }



// // app/reports/[id]/page.tsx
// 'use client';

// import { useParams } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, Share, Loader2 } from 'lucide-react';
// import { useAuth } from '@clerk/nextjs';

// type Report = {
//   id: string;
//   title: string;
//   content: string;
//   createdAt: string | Date;
// };

// export default function ReportPage() {
//   const params = useParams();
//   const id = params?.id as string;
//   const [report, setReport] = useState<Report | null>(null);
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
  
//   // Fetch report
//   useEffect(() => {
//     if (!id || !isSignedIn) return;
    
//     const fetchReport = async () => {
//       try {
//         setLoading(true);
        
//         // Use fetch to get the report
//         const response = await fetch(`/api/reports/${id}`);
        
//         if (!response.ok) {
//           if (response.status === 404) {
//             router.push('/reports');
//             return;
//           }
//           throw new Error('Failed to fetch report');
//         }
        
//         const data = await response.json();
//         setReport(data.report);
//       } catch (err) {
//         console.error('Error fetching report:', err);
//         setError('Failed to load report. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchReport();
//   }, [id, isSignedIn, router]);
  
//   // Show loading state
//   if (!isLoaded || loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
//         <p className="text-zinc-500">Loading report...</p>
//       </div>
//     );
//   }
  
//   // Show error state
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-red-500 mb-4">{error}</p>
//         <Link 
//           href="/reports" 
//           className="text-blue-500 hover:underline"
//         >
//           Back to Reports
//         </Link>
//       </div>
//     );
//   }
  
//   // Show not found state
//   if (!report) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-zinc-500 mb-4">Report not found</p>
//         <Link 
//           href="/reports" 
//           className="text-blue-500 hover:underline"
//         >
//           Back to Reports
//         </Link>
//       </div>
//     );
//   }
  
//   // Show report
//   return (
//     <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
//       <Link 
//         href="/reports" 
//         className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-6"
//       >
//         <ArrowLeft className="h-4 w-4 mr-2" />
//         Back to Reports
//       </Link>
      
//       <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border p-6 mb-8">
//         <div className="flex justify-between items-start mb-6">
//           <h1 className="text-2xl font-bold">{report.title}</h1>
//           <button className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">
//             <Share className="h-4 w-4 mr-2" />
//             Share
//           </button>
//         </div>
        
//         <div className="text-sm text-zinc-500 mb-8">
//           Created on {new Date(report.createdAt).toLocaleDateString()}
//         </div>
        
//         <div className="prose dark:prose-invert max-w-none">
//           {report.content.split('\n').map((paragraph, i) => (
//             <p key={i}>{paragraph}</p>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
