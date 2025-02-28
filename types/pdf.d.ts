// types/pdf.d.ts
declare module 'pdfjs-dist/build/pdf.mjs' {
    export * from 'pdfjs-dist';
  }
  
  declare module 'pdfjs-dist/build/pdf.worker.min.mjs' {
    // This module doesn't export anything, it's just needed for the worker
    const worker: any;
    export default worker;
  }
  