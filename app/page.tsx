// app/page.tsx
import { Metadata } from 'next';
import { DocumentsClient } from '@/components/document/documents-client';

export const metadata: Metadata = {
  title: 'Medical Documents | Family Medical Translator',
  description: 'Upload and manage your medical documents',
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
      <DocumentsClient />
    </div>
  );
}
