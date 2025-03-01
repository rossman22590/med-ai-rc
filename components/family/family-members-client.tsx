// components/family/family-members-client.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth, useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
};

export function FamilyMembersClient() {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch family members
  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch('/api/family');
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchFamilyMembers();
    }
  }, [userId]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !relation) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, relation }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add family member');
      }
      
      toast.success('Family member added successfully');
      setName('');
      setRelation('');
      
      // Refresh the list
      fetchFamilyMembers();
    } catch (error) {
      toast.error('Failed to add family member');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!userId) {
    return <div>Please sign in to manage family members.</div>;
  }
  
  if (loading) {
    return <div>Loading family members...</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Add Family Member</h2>
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
        </div>
      </div>
      
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Your Family Members</h2>
        
        {members.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm text-center">
            <p className="text-zinc-500">No family members added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div 
                key={member.id} 
                className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-zinc-500">{member.relation}</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/family/${member.id}`, {
                        method: 'DELETE',
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to delete family member');
                      }
                      
                      toast.success('Family member deleted');
                      fetchFamilyMembers();
                    } catch (error) {
                      toast.error('Failed to delete family member');
                      console.error(error);
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
