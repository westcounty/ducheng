import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'
import { config } from '../config.js'

const pool = new pg.Pool({ connectionString: config.databaseUrl })

export const db = drizzle(pool, { schema })

export async function checkConnection() {
  try {
    const result = await pool.query('SELECT 1 as ok')
    return result.rows[0].ok === 1
  } catch (err) {
    console.error('Database connection failed:', err.message)
    return false
  }
}
