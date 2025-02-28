// lib/types.ts
export interface User {
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Document {
    id: string;
    userId: string;
    name: string;
    type: 'pdf' | 'image';
    url: string;
    contentText?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface FamilyMember {
    id: string;
    userId: string;
    name: string;
    relation: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Report {
    id: string;
    userId: string;
    familyMemberId?: string | null;
    title: string;
    content: string;
    summary?: string;
    status: 'draft' | 'complete';
    shareToken?: string;
    shareExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ReportDocument {
    id: string;
    reportId: string;
    documentId: string;
    createdAt: Date;
  }
  