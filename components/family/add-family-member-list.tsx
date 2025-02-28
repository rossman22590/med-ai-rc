// components/family/family-member-list.tsx
'use client';

import { useState } from 'react';
import { UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deleteFamilyMember } from '@/lib/actions/family';

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
};

export function FamilyMemberList({ members }: { members: FamilyMember[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteFamilyMember(id);
      toast.success('Family member removed');
      router.refresh();
    } catch (error) {
      toast.error('Failed to remove family member');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <UserCircle className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
        <p className="text-zinc-500 dark:text-zinc-400">
          No family members added yet
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {members.map((member) => (
        <li 
          key={member.id}
          className="flex items-center justify-between p-3 border rounded-md"
        >
          <div className="flex items-center">
            <UserCircle className="h-8 w-8 text-zinc-400 mr-3" />
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-zinc-500">{member.relation}</p>
            </div>
          </div>
          <button 
            className="text-red-500 hover:text-red-700 text-sm"
            onClick={() => handleDelete(member.id)}
            disabled={deletingId === member.id}
          >
            {deletingId === member.id ? 'Removing...' : 'Remove'}
          </button>
        </li>
      ))}
    </ul>
  );
}
