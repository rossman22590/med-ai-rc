// components/common/content-viewer.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

// Define a generic type for the data
type ApiResponse<T = Record<string, unknown>> = {
  [key: string]: T;
};

type ViewerProps<T = Record<string, unknown>> = {
  id: string;
  apiPath: string;
  backLink: string;
  backText: string;
  renderContent: (data: ApiResponse<T>) => ReactNode;
};

export default function ContentViewer<T = Record<string, unknown>>({
  id,
  apiPath,
  backLink,
  backText,
  renderContent
}: ViewerProps<T>) {
  const [data, setData] = useState<ApiResponse<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  
  // Check authentication
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Fetch data
  useEffect(() => {
    if (!id || !isSignedIn) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use fetch to get the data
        const response = await fetch(`${apiPath}/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push(backLink);
            return;
          }
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        setData(responseData as ApiResponse<T>);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isSignedIn, router, apiPath, backLink]);
  
  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500">Loading content...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Link 
          href={backLink} 
          className="text-blue-500 hover:underline"
        >
          {backText}
        </Link>
      </div>
    );
  }
  
  // Show not found state
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-zinc-500 mb-4">Content not found</p>
        <Link 
          href={backLink} 
          className="text-blue-500 hover:underline"
        >
          {backText}
        </Link>
      </div>
    );
  }
  
  // Show back link and content
  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <Link 
        href={backLink} 
        className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {backText}
      </Link>
      
      {renderContent(data)}
    </div>
  );
}

// // components/common/content-viewer.tsx
// 'use client';

// import { useState, useEffect, ReactNode } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, Loader2 } from 'lucide-react';
// import { useAuth } from '@clerk/nextjs';

// type ViewerProps = {
//   id: string;
//   apiPath: string;
//   backLink: string;
//   backText: string;
//   renderContent: (data: any) => ReactNode;
// };

// export default function ContentViewer({
//   id,
//   apiPath,
//   backLink,
//   backText,
//   renderContent
// }: ViewerProps) {
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const { isLoaded, isSignedIn } = useAuth();
  
//   // Check authentication
//   useEffect(() => {
//     if (isLoaded && !isSignedIn) {
//       router.push('/');
//     }
//   }, [isLoaded, isSignedIn, router]);
  
//   // Fetch data
//   useEffect(() => {
//     if (!id || !isSignedIn) return;
    
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Use fetch to get the data
//         const response = await fetch(`${apiPath}/${id}`);
        
//         if (!response.ok) {
//           if (response.status === 404) {
//             router.push(backLink);
//             return;
//           }
//           throw new Error(`Failed to fetch data: ${response.statusText}`);
//         }
        
//         const responseData = await response.json();
//         setData(responseData);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError('Failed to load content. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [id, isSignedIn, router, apiPath, backLink]);
  
//   // Show loading state
//   if (!isLoaded || loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
//         <p className="text-zinc-500">Loading content...</p>
//       </div>
//     );
//   }
  
//   // Show error state
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-red-500 mb-4">{error}</p>
//         <Link 
//           href={backLink} 
//           className="text-blue-500 hover:underline"
//         >
//           {backText}
//         </Link>
//       </div>
//     );
//   }
  
//   // Show not found state
//   if (!data) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-zinc-500 mb-4">Content not found</p>
//         <Link 
//           href={backLink} 
//           className="text-blue-500 hover:underline"
//         >
//           {backText}
//         </Link>
//       </div>
//     );
//   }
  
//   // Show back link and content
//   return (
//     <div className="container mx-auto px-4 py-8 pt-20">
//       <Link 
//         href={backLink} 
//         className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-6"
//       >
//         <ArrowLeft className="h-4 w-4 mr-2" />
//         {backText}
//       </Link>
      
//       {renderContent(data)}
//     </div>
//   );
// }
