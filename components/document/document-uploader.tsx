// components/document/document-uploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Cloud, 
  File, 
  FileText, 
  Upload, 
  X,
  Loader2 
} from 'lucide-react';

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

export default function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for supported file types
    const validFiles = acceptedFiles.filter(file => {
      const isValid = file.type === 'application/pdf' || 
                     file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`Unsupported file type: ${file.type}`);
      }
      return isValid;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      // Upload each file
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to upload ${file.name}`);
        }
      }
      
      clearInterval(interval);
      setUploadProgress(100);
      
      toast.success(`Successfully uploaded ${files.length} document(s)`);
      setFiles([]);
      
      // Call onUploadComplete callback if provided
      if (onUploadComplete) {
        onUploadComplete();
      } else {
        router.refresh();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 cursor-pointer
          transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-zinc-300 dark:border-zinc-700'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Cloud className="h-10 w-10 text-zinc-400" />
          <h3 className="text-lg font-semibold">Drag medical files here</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Support for PDF documents and images (JPG, PNG)
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Files up to 10MB
          </p>
          <button type="button" className="mt-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200">
            <Upload className="mr-2 h-4 w-4 inline" />
            Select Files
          </button>
        </div>
      </div>
      
      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  {file.type === 'application/pdf' ? (
                    <FileText className="h-6 w-6 text-blue-500" />
                  ) : (
                    <File className="h-6 w-6 text-green-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload button and progress */}
      {files.length > 0 && (
        <div className="mt-6">
          {uploading && (
            <div className="mb-4 space-y-2">
              <div className="bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-zinc-900 dark:bg-zinc-100 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-zinc-500 text-right">
                {uploadProgress}% complete
              </p>
            </div>
          )}
          
          <button
            type="button"
            className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
            onClick={uploadFiles}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4 inline" />
                Upload {files.length} file{files.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// // components/document/document-uploader.tsx
// 'use client';

// import { useState, useCallback } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';
// import { 
//   Cloud, 
//   File, 
//   FileText, 
//   Upload, 
//   X,
//   Loader2 
// } from 'lucide-react';

// export default function DocumentUploader() {
//   const router = useRouter();
//   const [files, setFiles] = useState<File[]>([]);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     // Filter for supported file types
//     const validFiles = acceptedFiles.filter(file => {
//       const isValid = file.type === 'application/pdf' || 
//                      file.type.startsWith('image/');
//       if (!isValid) {
//         toast.error(`Unsupported file type: ${file.type}`);
//       }
//       return isValid;
//     });
    
//     setFiles(prev => [...prev, ...validFiles]);
//   }, []);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       'application/pdf': ['.pdf'],
//       'image/*': ['.png', '.jpg', '.jpeg']
//     },
//     maxSize: 10 * 1024 * 1024 // 10MB
//   });

//   const removeFile = (index: number) => {
//     setFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const uploadFiles = async () => {
//     if (files.length === 0) return;
    
//     setUploading(true);
//     setUploadProgress(0);
    
//     try {
//       // Simulate upload progress
//       const interval = setInterval(() => {
//         setUploadProgress(prev => {
//           if (prev >= 95) {
//             clearInterval(interval);
//             return 95;
//           }
//           return prev + 5;
//         });
//       }, 100);
      
//       // Upload each file
//       for (const file of files) {
//         const formData = new FormData();
//         formData.append('file', file);
        
//         const response = await fetch('/api/upload', {
//           method: 'POST',
//           body: formData
//         });
        
//         if (!response.ok) {
//           const error = await response.json();
//           throw new Error(error.error || `Failed to upload ${file.name}`);
//         }
//       }
      
//       clearInterval(interval);
//       setUploadProgress(100);
      
//       toast.success(`Successfully uploaded ${files.length} document(s)`);
//       setFiles([]);
//       router.refresh();
      
//     } catch (error) {
//       console.error('Upload error:', error);
//       toast.error('Upload failed: ' + (error as Error).message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       <div
//         {...getRootProps()}
//         className={`
//           border-2 border-dashed rounded-lg p-6 cursor-pointer
//           transition-colors
//           ${isDragActive ? 'border-primary bg-primary/5' : 'border-zinc-300 dark:border-zinc-700'}
//         `}
//       >
//         <input {...getInputProps()} />
//         <div className="flex flex-col items-center justify-center gap-2 text-center">
//           <Cloud className="h-10 w-10 text-zinc-400" />
//           <h3 className="text-lg font-semibold">Drag medical files here</h3>
//           <p className="text-sm text-zinc-500 dark:text-zinc-400">
//             Support for PDF documents and images (JPG, PNG)
//           </p>
//           <p className="text-xs text-zinc-400 dark:text-zinc-500">
//             Files up to 10MB
//           </p>
//           <button type="button" className="mt-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200">
//             <Upload className="mr-2 h-4 w-4 inline" />
//             Select Files
//           </button>
//         </div>
//       </div>
      
//       {/* File list */}
//       {files.length > 0 && (
//         <div className="mt-6 space-y-4">
//           <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
          
//           <div className="space-y-2">
//             {files.map((file, index) => (
//               <div 
//                 key={index} 
//                 className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-md"
//               >
//                 <div className="flex items-center space-x-3">
//                   {file.type === 'application/pdf' ? (
//                     <FileText className="h-6 w-6 text-blue-500" />
//                   ) : (
//                     <File className="h-6 w-6 text-green-500" />
//                   )}
//                   <div>
//                     <p className="text-sm font-medium truncate max-w-[200px]">
//                       {file.name}
//                     </p>
//                     <p className="text-xs text-zinc-500">
//                       {(file.size / 1024).toFixed(1)} KB
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   type="button"
//                   className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700"
//                   onClick={() => removeFile(index)}
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
      
//       {/* Upload button and progress */}
//       {files.length > 0 && (
//         <div className="mt-6">
//           {uploading && (
//             <div className="mb-4 space-y-2">
//               <div className="bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
//                 <div 
//                   className="bg-zinc-900 dark:bg-zinc-100 rounded-full h-2 transition-all duration-300"
//                   style={{ width: `${uploadProgress}%` }}
//                 ></div>
//               </div>
//               <p className="text-xs text-zinc-500 text-right">
//                 {uploadProgress}% complete
//               </p>
//             </div>
//           )}
          
//           <button
//             type="button"
//             className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
//             onClick={uploadFiles}
//             disabled={uploading}
//           >
//             {uploading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
//                 Uploading...
//               </>
//             ) : (
//               <>
//                 <Upload className="mr-2 h-4 w-4 inline" />
//                 Upload {files.length} file{files.length !== 1 ? 's' : ''}
//               </>
//             )}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
