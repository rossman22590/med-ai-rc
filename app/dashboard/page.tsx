// app/dashboard/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { getUserDocuments } from '@/lib/actions/documents';
import { getRecentReports } from '@/lib/actions/reports';
import { FileText, Upload, Plus, FileOutput } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | Family Medical Translator',
  description: 'Your medical documents and reports dashboard',
};

export default async function DashboardPage() {
  const documents = await getUserDocuments(5); // Get 5 most recent
  const reports = await getRecentReports(5); // Get 5 most recent
  
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl md:ml-[200px]">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Link 
              href="/documents" 
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              View all
            </Link>
          </div>
          
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="p-3 border rounded-lg flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md mr-3 ${
                      doc.type === 'pdf' 
                        ? 'bg-blue-100 dark:bg-blue-900' 
                        : 'bg-green-100 dark:bg-green-900'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        doc.type === 'pdf' 
                          ? 'text-blue-500 dark:text-blue-300' 
                          : 'text-green-500 dark:text-green-300'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border rounded-lg text-center">
              <FileText className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
              <h3 className="text-lg font-medium mb-2">No documents yet</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Upload medical documents to start creating reports
              </p>
              <Link
                href="/documents"
                className="inline-flex items-center px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Link>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Reports</h2>
            <Link
              href="/reports"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              View all
            </Link>
          </div>
          
          {reports.length > 0 ? (
            <div className="space-y-2">
              {reports.map((report) => (
                <Link 
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="p-3 border rounded-lg block hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md mr-3">
                      <FileOutput className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {report.summary && (
                    <p className="mt-2 text-xs text-zinc-500 line-clamp-2">
                      {report.summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 border rounded-lg text-center">
              <FileOutput className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
              <h3 className="text-lg font-medium mb-2">No reports yet</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Create your first medical report
              </p>
              <Link
                href="/reports/create"
                className="inline-flex items-center px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
