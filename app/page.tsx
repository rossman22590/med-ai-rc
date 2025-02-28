// app/documents/page.tsx
import { Metadata } from 'next';
import DocumentUploader from '@/components/document/document-uploader';
import DocumentList from '@/components/document/document-list';
import { getUserDocuments } from '@/lib/actions/documents';

export const metadata: Metadata = {
  title: 'Medical Documents | Family Medical Translator',
  description: 'Upload and manage your medical documents',
};

export default async function DocumentsPage() {
  const documents = await getUserDocuments();
  
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Medical Documents</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Upload medical documents, reports, or test results for AI analysis
          </p>
        </div>
        
        <DocumentUploader />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Documents</h2>
          <DocumentList documents={documents} />
        </div>
      </div>
    </div>
  );
}
