// Applies the versioned migrations in ../migrations (production). Local
// development pushes the schema directly with `pnpm db:push`.
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { createDb } from './index.ts'

const db = createDb(process.env.DATABASE_URL ?? 'postgres://askesis:askesis@localhost:5432/askesis')
await migrate(db, { migrationsFolder: new URL('../migrations', import.meta.url).pathname })
await db.close()
console.log('migrations applied')
