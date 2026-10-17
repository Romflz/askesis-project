// Applies the versioned migrations in ../migrations (production). Runs on every
// API start (see apps/api `start`), so a deploy brings the database up to date
// by itself; migrations that already ran are skipped. Local development pushes
// the schema directly with `pnpm db:push` instead.
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

// Any fixed number works; it only has to be the same for every instance.
const LOCK_KEY = 4_620_517_311

// One connection, so the advisory lock and the migrations share a session: when
// several instances start at once, the others wait and then find nothing to do.
const client = postgres(process.env.DATABASE_URL ?? 'postgres://askesis:askesis@localhost:5432/askesis', {
  max: 1,
  onnotice: () => {},
})
try {
  await client`select pg_advisory_lock(${LOCK_KEY})`
  await migrate(drizzle(client), { migrationsFolder: new URL('../migrations', import.meta.url).pathname })
  console.log('Database migrations are up to date')
} finally {
  await client`select pg_advisory_unlock(${LOCK_KEY})`.catch(() => {})
  await client.end()
}
