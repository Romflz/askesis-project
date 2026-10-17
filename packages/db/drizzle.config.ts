import { defineConfig } from 'drizzle-kit'

// drizzle-kit doesn't read the workspace .env on its own.
try {
  process.loadEnvFile(new URL('../../.env', import.meta.url).pathname)
} catch {
  // No .env: fall back to the local default below.
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://askesis:askesis@localhost:5432/askesis',
  },
})
