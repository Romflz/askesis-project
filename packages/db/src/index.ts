import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'

export { schema }
// Apps take query helpers (eq, and, sql, ...) from here instead of depending on drizzle-orm.
export * from 'drizzle-orm'

/**
 * A Drizzle client over a postgres-js pool. Columns are camelCase in TypeScript
 * and snake_case in Postgres; `close()` ends the pool so scripts can exit.
 */
export function createDb(url: string) {
  const client = postgres(url, { max: 10 })
  const db = drizzle(client, { schema, casing: 'snake_case' })
  return Object.assign(db, { close: () => client.end() })
}

export type Db = ReturnType<typeof createDb>
