// components/report/report-creator.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText,
  Check,
  // Remove the unused Users import
  FileOutput,
  Loader2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { generateReport } from '@/lib/actions/reports';

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: Date;
};

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
};

export default function ReportCreator({
  documents = [],
  familyMembers = [],
}: {
  documents: Document[];
  familyMembers: FamilyMember[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [reasoningLevel, setReasoningLevel] = useState<'standard' | 'deep' | 'comprehensive'>('deep');
  const [generating, setGenerating] = useState(false);

  const toggleDocument = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleGenerateReport = async () => {
    if (!title) {
      toast.error('Please enter a title for the report');
      return;
    }

    if (selectedDocs.length === 0) {
      toast.error('Please select at least one document to analyze');
      return;
    }

    setGenerating(true);

    try {
      const result = await generateReport({
        title,
        documentIds: selectedDocs,
        familyMemberId: selectedMember || undefined,
        notes,
        reasoningLevel
      });

      if (result.success) {
        toast.success('Report generated successfully');
        router.push(`/reports/${result.reportId}`);
      } else {
        toast.error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      toast.error('An error occurred while generating the report');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create Medical Report</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Select documents to analyze and generate a simplified medical report
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Report Title
            </label>
            <input
              type="text"
              placeholder="E.g., Blood Test Results Explanation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md bg-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              For Family Member (Optional)
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full p-2 border rounded-md bg-transparent"
            >
              <option value="">No specific family member</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.relation})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              placeholder="Add any symptoms, concerns, or context..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-md bg-transparent"
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Select Documents to Analyze</h2>
          
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No documents available</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Upload medical documents to create a report
              </p>
              <button 
                className="px-4 py-2 border rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => router.push('/documents')}
              >
                Upload Documents
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`
                    p-3 rounded-md border cursor-pointer transition-colors
                    flex items-center justify-between
                    ${selectedDocs.includes(doc.id) 
                      ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-500' 
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}
                  `}
                  onClick={() => toggleDocument(doc.id)}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className={`h-5 w-5 ${
                      doc.type === 'pdf' ? 'text-blue-500' : 'text-green-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {selectedDocs.includes(doc.id) && (
                    <Check className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">AI Reasoning Level</h2>
            <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-sm">
              <Info className="h-4 w-4 mr-1" />
              Deeper reasoning provides more thorough analysis
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${reasoningLevel === 'standard' 
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800' 
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}
              `}
              onClick={() => setReasoningLevel('standard')}
            >
              <h3 className="font-medium">Standard</h3>
              <p className="text-xs text-zinc-500 mt-1">Quick analysis with basic explanations</p>
            </div>
            
            <div
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${reasoningLevel === 'deep' 
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800' 
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}
              `}
              onClick={() => setReasoningLevel('deep')}
            >
              <h3 className="font-medium">Deep</h3>
              <p className="text-xs text-zinc-500 mt-1">Thorough analysis with detailed explanations</p>
            </div>
            
            <div
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${reasoningLevel === 'comprehensive' 
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800' 
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}
              `}
              onClick={() => setReasoningLevel('comprehensive')}
            >
              <h3 className="font-medium">Comprehensive</h3>
              <p className="text-xs text-zinc-500 mt-1">In-depth analysis with maximum detail</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button 
            className="px-4 py-2 border rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
            onClick={handleGenerateReport}
            disabled={generating || !title || selectedDocs.length === 0}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Generating Report...
              </>
            ) : (
              <>
                <FileOutput className="mr-2 h-4 w-4 inline" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// // components/report/report-creator.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   FileText,
//   Check,
//   Users,
//   FileOutput,
//   Loader2,
//   Info
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { generateReport } from '@/lib/actions/reports';

// type Document = {
//   id: string;
//   name: string;
//   type: string;
//   url: string;
//   createdAt: Date;
// };

// type FamilyMember = {
//   id: string;
//   name: string;
//   relation: string;
// };

// export default function ReportCreator({
//   documents = [],
//   familyMembers = [],
// }: {
//   documents: Document[];
//   familyMembers: FamilyMember[];
// }) {
//   const router = useRouter();
//   const [title, setTitle] = useState('');
//   const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
//   const [selectedMember, setSelectedMember] = useState<string>('');
//   const [notes, setNotes] = useState('');
//   const [reasoningLevel, setReasoningLevel] = useState<'standard' | 'deep' | 'comprehensive'>('deep');
//   const [generating, setGenerating] = useState(false);

//   const toggleDocument = (docId: string) => {
//     setSelectedDocs(prev => 
//       prev.includes(docId)
//         ? prev.filter(id => id !== docId)
//         : [...prev, docId]
//     );
//   };

//   const handleGenerateReport = async () => {
//     if (!title) {
//       toast.error('Please enter a title for the report');
//       return;
//     }

//     if (selectedDocs.length === 0) {
//       toast.error('Please select at least one document to analyze');
//       return;
//     }

//     setGenerating(true);

//     try {
//       const result = await generateReport({
//         title,
//         documentIds: selectedDocs,
//         familyMemberId: selectedMember || undefined,
//         notes,
//         reasoningLevel
//       });

//       if (result.success) {
//         toast.success('Report generated successfully');
//         router.push(`/reports/${result.reportId}`);
//       } else {
//         toast.error(result.error || 'Failed to generate report');
//       }
//     } catch (error) {
//       toast.error('An error occurred while generating the report');
//       console.error(error);
//     } finally {
//       setGenerating(false);
//     }
//   };

//   return (
//     <div className="w-full space-y-8">
//       <div>
//         <h1 className="text-2xl font-bold">Create Medical Report</h1>
//         <p className="text-zinc-500 dark:text-zinc-400">
//           Select documents to analyze and generate a simplified medical report
//         </p>
//       </div>
      
//       <div className="space-y-6">
//         <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6 space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Report Title
//             </label>
//             <input
//               type="text"
//               placeholder="E.g., Blood Test Results Explanation"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full p-2 border rounded-md bg-transparent"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium mb-2">
//               For Family Member (Optional)
//             </label>
//             <select
//               value={selectedMember}
//               onChange={(e) => setSelectedMember(e.target.value)}
//               className="w-full p-2 border rounded-md bg-transparent"
//             >
//               <option value="">No specific family member</option>
//               {familyMembers.map((member) => (
//                 <option key={member.id} value={member.id}>
//                   {member.name} ({member.relation})
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Additional Notes (Optional)
//             </label>
//             <textarea
//               placeholder="Add any symptoms, concerns, or context..."
//               rows={3}
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               className="w-full p-2 border rounded-md bg-transparent"
//             />
//           </div>
//         </div>
        
//         <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
//           <h2 className="text-lg font-semibold mb-4">Select Documents to Analyze</h2>
          
//           {documents.length === 0 ? (
//             <div className="text-center py-8">
//               <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
//               <h3 className="text-lg font-medium">No documents available</h3>
//               <p className="text-sm text-zinc-500 mb-4">
//                 Upload medical documents to create a report
//               </p>
//               <button 
//                 className="px-4 py-2 border rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
//                 onClick={() => router.push('/documents')}
//               >
//                 Upload Documents
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
//               {documents.map((doc) => (
//                 <div
//                   key={doc.id}
//                   className={`
//                     p-3 rounded-md border cursor-pointer transition-colors
//                     flex items-center justify-between
//                     ${selectedDocs.includes(doc.id) 
//                       ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-500' 
//                       : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}
//                   `}
//                   onClick={() => toggleDocument(doc.id)}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <FileText className={`h-5 w-5 ${
//                       doc.type === 'pdf' ? 'text-blue-500' : 'text-green-500'
//                     }`} />
//                     <div>
//                       <p className="text-sm font-medium">{doc.name}</p>
//                       <p className="text-xs text-zinc-500">
//                         {new Date(doc.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
                  
//                   {selectedDocs.includes(doc.id) && (
//                     <Check className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
        
//         <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold">AI Reasoning Level</h2>
//             <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-sm">
//               <Info className="h-4 w-4 mr-1" />
//               Deeper reasoning provides more thorough analysis
//             </div>
//           </div>
          
//           <div className="grid grid-cols-3 gap-4">
//             <div
//               className={`
//                 border rounded-lg p-4 cursor-pointer transition-all
//                 ${reasoningLevel === 'standard' 
//                   ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800' 
//                   : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}
//               `}
//               onClick={() => setReasoningLevel('standard')}
//             >
//               <h3 className="font-medium">Standard</h3>
//               <p className="text-xs text-zinc-500 mt-1">Quick analysis with basic explanations</p>
//             </div>
            
//             <div
//               className={`
//                 border rounded-lg p-4 cursor-pointer transition-all
//                 ${reasoningLevel === 'deep' 
//                   ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800' 
//                   : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}
//               `}
//               onClick={() => setReasoningLevel('deep')}
//             >
//               <h3 className="font-medium">Deep</h3>
//               <p className="text-xs text-zinc-500 mt-1">Thorough analysis with detailed explanations</p>
//             </div>
            
//             <div
//               className={`
//                 border rounded-lg p-4 cursor-pointer transition-all
//                 ${reasoningLevel === 'comprehensive' 
//                   ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800' 
//                   : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}
//               `}
//               onClick={() => setReasoningLevel('comprehensive')}
//             >
//               <h3 className="font-medium">Comprehensive</h3>
//               <p className="text-xs text-zinc-500 mt-1">In-depth analysis with maximum detail</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex justify-end space-x-4 pt-4">
//           <button 
//             className="px-4 py-2 border rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
//             onClick={() => router.back()}
//           >
//             Cancel
//           </button>
//           <button 
//             className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
//             onClick={handleGenerateReport}
//             disabled={generating || !title || selectedDocs.length === 0}
//           >
//             {generating ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
//                 Generating Report...
//               </>
//             ) : (
//               <>
//                 <FileOutput className="mr-2 h-4 w-4 inline" />
//                 Generate Report
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
