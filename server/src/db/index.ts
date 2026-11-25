import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL || '';

const pool = mysql.createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

export const db = drizzle(pool, { schema, mode: 'default' });
export { pool };
