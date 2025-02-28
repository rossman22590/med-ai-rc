// app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings as UserIcon, Bell, Lock, HelpCircle, Loader2 } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';

export default function SettingsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { openUserProfile } = useClerk();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  // Handle account deletion (this would need additional confirmation in a real app)
  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        // In a real app, you would need to handle data deletion in your database as well
        await user?.delete();
        router.push('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
        setIsDeleting(false);
      }
    }
  };

  // Loading state
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  // Get the creation date safely (fixing the Date constructor error)
  const formattedCreationDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString() 
    : 'Unknown date';

  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage your account preferences and settings
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <nav className="space-y-1">
            <a 
              href="#profile" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <UserIcon className="mr-3 h-5 w-5 text-zinc-500" />
              Profile
            </a>
            <a 
              href="#notifications" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Bell className="mr-3 h-5 w-5 text-zinc-500" />
              Notifications
            </a>
            <a 
              href="#security" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Lock className="mr-3 h-5 w-5 text-zinc-500" />
              Security
            </a>
            <a 
              href="#help" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <HelpCircle className="mr-3 h-5 w-5 text-zinc-500" />
              Help & Support
            </a>
          </nav>
        </div>
        
        <div className="md:col-span-2">
          <div id="profile" className="bg-white dark:bg-zinc-900 rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            
            <div className="space-y-4">
              {user?.imageUrl && (
                <div className="flex items-center space-x-4">
                  <img 
                    src={user.imageUrl} 
                    alt="Profile" 
                    className="h-16 w-16 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{user.fullName || 'User'}</p>
                    <p className="text-sm text-zinc-500">Member since {formattedCreationDate}</p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={user?.fullName || ''}
                  className="w-full p-2 border rounded-md bg-transparent"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={user?.primaryEmailAddress?.emailAddress || ''}
                  className="w-full p-2 border rounded-md bg-transparent"
                  disabled
                />
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => openUserProfile()}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  Manage Profile
                </button>
              </div>
            </div>
          </div>
          
          <div id="notifications" className="bg-white dark:bg-zinc-900 rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-zinc-500">Receive updates about your reports</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Report Sharing Notifications</h3>
                  <p className="text-sm text-zinc-500">Get notified when someone views a shared report</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div id="security" className="bg-white dark:bg-zinc-900 rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
            
            <div className="space-y-4">
              <div>
                <button 
                  onClick={() => openUserProfile()}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  Manage Security Settings
                </button>
              </div>
              
              <div className="pt-4">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeleting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                  Delete Account
                </button>
                <p className="mt-2 text-xs text-zinc-500">
                  This will permanently delete your account and all associated data.
                </p>
              </div>
            </div>
          </div>
          
          <div id="help" className="bg-white dark:bg-zinc-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Help & Support</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Frequently Asked Questions</h3>
                <div className="space-y-2">
                  <details className="border rounded-md p-3">
                    <summary className="font-medium cursor-pointer">How secure are my medical documents?</summary>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Your documents are securely stored and encrypted. We never share your medical information with third parties.
                    </p>
                  </details>
                  
                  <details className="border rounded-md p-3">
                    <summary className="font-medium cursor-pointer">Can I delete my uploaded documents?</summary>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Yes, you can delete any document from your document library at any time.
                    </p>
                  </details>
                  
                  <details className="border rounded-md p-3">
                    <summary className="font-medium cursor-pointer">How accurate is the AI interpretation?</summary>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      While our AI provides helpful interpretations, it should not replace professional medical advice. Always consult with healthcare professionals for medical decisions.
                    </p>
                  </details>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Contact Support</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Need help? Contact our support team at <a href="mailto:support@example.com" className="text-blue-500 hover:underline">support@example.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
