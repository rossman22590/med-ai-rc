// components/family/add-family-member.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addFamilyMember } from '@/lib/actions/family';
import { Loader2 } from 'lucide-react';

export function AddFamilyMemberForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !relation) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addFamilyMember(name, relation);
      toast.success('Family member added successfully');
      setName('');
      setRelation('');
      router.refresh();
    } catch (error) {
      toast.error('Failed to add family member');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md bg-transparent"
          placeholder="Enter name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Relation</label>
        <select
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          className="w-full p-2 border rounded-md bg-transparent"
        >
          <option value="">Select relation</option>
          <option value="Spouse">Spouse</option>
          <option value="Parent">Parent</option>
          <option value="Child">Child</option>
          <option value="Sibling">Sibling</option>
          <option value="Grandparent">Grandparent</option>
          <option value="Grandchild">Grandchild</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Family Member'
        )}
      </button>
    </form>
  );
}

// // components/family/add-family-member.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import { addFamilyMember } from '@/lib/actions/family';
// import { Loader2 } from 'lucide-react';

// export function AddFamilyMemberForm() {
//   const router = useRouter();
//   const [name, setName] = useState('');
//   const [relation, setRelation] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!name || !relation) {
//       toast.error('Please fill in all fields');
//       return;
//     }
    
//     setIsSubmitting(true);
    
//     try {
//       await addFamilyMember(name, relation);
//       toast.success('Family member added successfully');
//       setName('');
//       setRelation('');
//       router.refresh();
//     } catch (error) {
//       toast.error('Failed to add family member');
//       console.error(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium mb-1">Name</label>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="w-full p-2 border rounded-md bg-transparent"
//           placeholder="Enter name"
//         />
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium mb-1">Relation</label>
//         <select
//           value={relation}
//           onChange={(e) => setRelation(e.target.value)}
//           className="w-full p-2 border rounded-md bg-transparent"
//         >
//           <option value="">Select relation</option>
//           <option value="Spouse">Spouse</option>
//           <option value="Parent">Parent</option>
//           <option value="Child">Child</option>
//           <option value="Sibling">Sibling</option>
//           <option value="Grandparent">Grandparent</option>
//           <option value="Grandchild">Grandchild</option>
//           <option value="Other">Other</option>
//         </select>
//       </div>
      
//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
//       >
//         {isSubmitting ? (
//           <>
//             <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
//             Adding...
//           </>
//         ) : (
//           'Add Family Member'
//         )}
//       </button>
//     </form>
//   );
// }
