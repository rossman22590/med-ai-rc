// app/reports/create/page.tsx
import { Metadata } from 'next';
import ReportCreator from '@/components/report/report-creator';
import { getUserDocuments } from '@/lib/actions/documents';
import { getFamilyMembers } from '@/lib/actions/family';

export const metadata: Metadata = {
  title: 'Create Report | Family Medical Translator',
  description: 'Create a new medical report',
};

export default async function CreateReportPage() {
  const documents = await getUserDocuments();
  const familyMembers = await getFamilyMembers();
  
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
      <ReportCreator 
        documents={documents} 
        familyMembers={familyMembers} 
      />
    </div>
  );
}
