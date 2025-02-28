// lib/db/schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Use 'clerk_id' instead of 'clerkId' to match SQL naming conventions
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique().notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'pdf' or 'image'
  url: text('url').notNull(),
  contentText: text('content_text'), // Extracted text content
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const familyMembers = pgTable('family_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  relation: text('relation').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  familyMemberId: uuid('family_member_id').references(() => familyMembers.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  status: text('status').notNull().default('draft'), // 'draft', 'complete'
  shareToken: text('share_token').unique(),
  shareExpiry: timestamp('share_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reportDocuments = pgTable('report_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => documents.id),
});

// // lib/db/schema.ts
// import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// export const users = pgTable('users', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   email: text('email').unique().notNull(),
//   name: text('name'),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });

// export const documents = pgTable('documents', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
//   name: text('name').notNull(),
//   type: text('type').notNull(), // 'pdf' or 'image'
//   url: text('url').notNull(),
//   contentText: text('content_text'), // Extracted text content
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });

// export const familyMembers = pgTable('family_members', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
//   name: text('name').notNull(),
//   relation: text('relation').notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });

// export const reports = pgTable('reports', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
//   familyMemberId: uuid('family_member_id').references(() => familyMembers.id, { onDelete: 'set null' }),
//   title: text('title').notNull(),
//   content: text('content').notNull(),
//   summary: text('summary'),
//   status: text('status').notNull().default('draft'), // 'draft', 'complete'
//   shareToken: text('share_token').unique(),
//   shareExpiry: timestamp('share_expiry'),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });

// export const reportDocuments = pgTable('report_documents', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   reportId: uuid('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
//   documentId: uuid('document_id').notNull().references(() => documents.id),
// });
