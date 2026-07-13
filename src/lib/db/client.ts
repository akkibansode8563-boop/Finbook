import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../../drizzle/schema';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

// Disable prefetch to ensure compatibility with Supabase connection pooling (Transaction Mode)
export const pgClient = postgres(connectionString, { prepare: false });

export const db = drizzle(pgClient, { schema });
