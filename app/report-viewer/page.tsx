// app/report-viewer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Share, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

type Report = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: string | Date;
};

export default function ReportViewerPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const { isLoaded, isSignedIn } = useAuth();
  
  // Check authentication
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Fetch report
  useEffect(() => {
    if (!reportId || !isSignedIn) return;
    
    const fetchReport = async () => {
      try {
        setLoading(true);
        
        // Use fetch to get the report
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
  }, [reportId, isSignedIn, router]);
  
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
  
  // Show report
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
          {report.content.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
