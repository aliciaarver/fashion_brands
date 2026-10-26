import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import process from 'node:process'
import * as schema from './schema'

const globalForDatabase = globalThis as unknown as {
  fashionSql?: ReturnType<typeof postgres>
}

export function useDatabase() {
  const config = useRuntimeConfig()
  // На хостинге (Vercel) адрес базы задаётся переменной окружения во время работы, а не при сборке
  const sql = globalForDatabase.fashionSql || postgres(process.env.DATABASE_URL || config.databaseUrl, { max: 8 })

  if (process.env.NODE_ENV !== 'production') {
    globalForDatabase.fashionSql = sql
  }

  return drizzle(sql, { schema })
}
