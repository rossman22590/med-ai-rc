// lib/db.ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './db/schema';

// Create a connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Drizzle ORM with the pool
export const db = drizzle(pool, { schema });
