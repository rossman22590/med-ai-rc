// app/reports/create/page.tsx
import { Metadata } from 'next';
import { CreateReportClient } from '@/components/report/create-report-client';

export const metadata: Metadata = {
  title: 'Create Report | Family Medical Analysis',
  description: 'Create a new medical report',
};

export default function CreateReportPage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
      <CreateReportClient />
    </div>
  );
}
