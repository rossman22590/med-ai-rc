// components/report/reports-client.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

type Report = {
  id: string;
  title: string;
  summary?: string | null;
  createdAt: Date;
};

export function ReportsClient() {
  const { userId } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchReports() {
      try {
        if (!userId) return;
        
        const response = await fetch('/api/reports');
        const data = await response.json();
        setReports(data.reports || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReports();
  }, [userId]);
  
  if (!userId) {
    return <div>Please sign in to view reports.</div>;
  }
  
  if (loading) {
    return <div>Loading reports...</div>;
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Medical Reports</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            View and manage your simplified medical reports
          </p>
        </div>
        
        <Link
          href="/reports/create"
          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          New Report
        </Link>
      </div>
      
      {reports.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-lg font-medium mb-2">No reports yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            Create your first medical report
          </p>
          <Link
            href="/reports/create"
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Create Report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md mr-3">
                  <FileText className="h-5 w-5 text-zinc-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{report.title}</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  {report.summary && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {report.summary}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
