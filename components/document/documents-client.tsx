// components/document/documents-client.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import DocumentUploader from './document-uploader';
import DocumentList from './document-list';

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  contentText?: string;
  createdAt: Date;
  updatedAt: Date;
};

export function DocumentsClient() {
  const { userId } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDocuments = async () => {
    try {
      if (!userId) return;
      
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [userId]);
  
  if (!userId) {
    return <div>Please sign in to view documents.</div>;
  }
  
  if (loading) {
    return <div>Loading documents...</div>;
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Medical Documents</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Upload medical documents, reports, or test results for AI analysis
        </p>
      </div>
      
      <DocumentUploader onUploadComplete={fetchDocuments} />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Documents</h2>
        <DocumentList documents={documents} onDeleteComplete={fetchDocuments} />
      </div>
    </div>
  );
}
