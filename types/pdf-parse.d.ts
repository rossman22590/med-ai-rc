// types/pdf-parse.d.ts
declare module 'pdf-parse' {
    interface PDFOptions {
      pagerender?: (pageData: any) => Promise<string> | string;
      max?: number;
      version?: string;
    }
  
    interface PDFData {
      numpages: number;
      numrender: number;
      info: any;
      metadata: any;
      text: string;
      version: string;
    }
  
    function PDFParse(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;
    
    export = PDFParse;
  }
  