// app/reports/page.tsx
import { Metadata } from 'next';
import { ReportsClient } from '@/components/report/reports-client';

export const metadata: Metadata = {
  title: 'Medical Reports | Family Medical Analysis',
  description: 'View your generated medical reports',
};

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
      <ReportsClient />
    </div>
  );
}

// // app/reports/page.tsx
// import { Metadata } from 'next';
// import Link from 'next/link';
// import { getRecentReports } from '@/lib/actions/reports';
// import { FileText, Plus } from 'lucide-react';

// export const metadata: Metadata = {
//   title: 'Medical Reports | Family Medical Analysis',
//   description: 'View your generated medical reports',
// };

// export default async function ReportsPage() {
//   const reports = await getRecentReports();
  
//   return (
//     <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-bold">Medical Reports</h1>
//           <p className="text-zinc-500 dark:text-zinc-400">
//             View and manage your simplified medical reports
//           </p>
//         </div>
        
//         <Link
//           href="/reports/create"
//           className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200"
//         >
//           <Plus className="h-4 w-4 inline mr-2" />
//           New Report
//         </Link>
//       </div>
      
//       {reports.length === 0 ? (
//         <div className="text-center p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
//           <FileText className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
//           <h3 className="text-lg font-medium mb-2">No reports yet</h3>
//           <p className="text-zinc-500 dark:text-zinc-400 mb-4">
//             Create your first medical report
//           </p>
//           <Link
//             href="/reports/create"
//             className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200"
//           >
//             <Plus className="h-4 w-4 inline mr-2" />
//             Create Report
//           </Link>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-4">
//           {reports.map((report) => (
//             <Link
//               key={report.id}
//               href={`/reports/${report.id}`}
//               className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
//             >
//               <div className="flex items-start">
//                 <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md mr-3">
//                   <FileText className="h-5 w-5 text-zinc-500" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-medium">{report.title}</h3>
//                   <p className="text-sm text-zinc-500 mt-1">
//                     {new Date(report.createdAt).toLocaleDateString()}
//                   </p>
//                   {report.summary && (
//                     <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
//                       {report.summary}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
