// app/family/page.tsx
import { Metadata } from 'next';
import { FamilyMembersClient } from '@/components/family/family-members-client';

export const metadata: Metadata = {
  title: 'Family Members | Family Medical Analysis',
  description: 'Manage your family members for medical reports',
};

export default function FamilyPage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Family Members</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage family members for your medical reports
          </p>
        </div>
      </div>
      
      <FamilyMembersClient />
    </div>
  );
}

// // app/family/page.tsx
// import { Metadata } from 'next';
// import { getFamilyMembers } from '@/lib/actions/family';
// import { AddFamilyMemberForm } from '@/components/family/add-family-member';
// import { FamilyMemberList } from '../../components/family/add-family-member-list';
// export const metadata: Metadata = {
//   title: 'Family Members | Family Medical Translator',
//   description: 'Manage your family members',
// };

// export default async function FamilyPage() {
//   const familyMembers = await getFamilyMembers();
  
//   return (
//     <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-bold">Family Members</h1>
//           <p className="text-zinc-500 dark:text-zinc-400">
//             Manage family members for medical reports
//           </p>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white dark:bg-zinc-900 rounded-lg border p-6">
//           <h2 className="text-xl font-semibold mb-4">Add Family Member</h2>
//           <AddFamilyMemberForm />
//         </div>
        
//         <div className="bg-white dark:bg-zinc-900 rounded-lg border p-6">
//           <h2 className="text-xl font-semibold mb-4">Your Family Members</h2>
//           <FamilyMemberList members={familyMembers} />
//         </div>
//       </div>
//     </div>
//   );
// }
