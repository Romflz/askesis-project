// Inserts the example docs, owned by a system user. Safe to rerun: existing
// rows are left alone.
import { createDb, schema } from './index.ts'

const db = createDb(process.env.DATABASE_URL ?? 'postgres://askesis:askesis@localhost:5432/askesis')

const SYSTEM_USER = { id: 'askesis-system', name: 'Askesis', email: 'system@askesis.local' }

const seedDocs = [
  {
    slug: 'getting-started',
    title: 'Getting started',
    summary: 'Run the API, the web app, and Postgres locally.',
    tags: ['guide', 'setup'],
    body: `Askesis Docs is a pnpm workspace with two apps.

apps/api is a Fastify server. It owns the database (Drizzle + Postgres) and authentication (Better Auth).
apps/web is a TanStack Start app. It renders every page on the server and talks to the API only from server functions.

Run \`pnpm db:up\`, \`pnpm db:migrate\`, \`pnpm db:seed\`, then \`pnpm dev\`.`,
  },
  {
    slug: 'ssr-modes',
    title: 'Choosing an SSR mode per route',
    summary: 'Why some routes render fully on the server and others do not.',
    tags: ['architecture', 'ssr'],
    body: `Public pages (home, docs list, doc detail) use full SSR so content is indexable and fast on first paint.

The account page uses 'data-only': its loader runs on the server with the session cookie, but the component renders on the client, where dates are formatted in the viewer's time zone.

The editor uses ssr: false. It is private, restores drafts from localStorage, and gains nothing from server rendering.`,
  },
  {
    slug: 'streaming',
    title: 'Streaming related docs',
    summary: 'Critical data is awaited; secondary data is streamed.',
    tags: ['architecture', 'ssr', 'streaming'],
    body: `The doc page loader awaits the doc itself, since the title and meta tags depend on it, and returns the related-docs query as an unawaited promise.

Start flushes the document shell immediately and streams the related list into a Suspense boundary when it resolves.`,
  },
  {
    slug: 'server-boundaries',
    title: 'Server-only boundaries',
    summary: 'Where secrets and network calls are allowed to live.',
    tags: ['architecture', 'security'],
    body: `Files ending in .server.ts are protected by Start's import protection. The client bundle cannot import them.

Server functions in *.functions.ts are the only bridge. Their handlers are replaced with RPC stubs in the client build, so the API base URL and forwarded cookies never reach the browser.`,
  },
  {
    slug: 'deployment',
    title: 'Deployment targets',
    summary: 'Change the Nitro preset, not the app.',
    tags: ['guide', 'deployment'],
    body: `The web app builds with Nitro. NITRO_PRESET selects the runtime (node-server by default; bun, vercel, netlify and others also work) without touching routes or server functions.

The API is a plain Node process: \`pnpm --filter @askesis/api start\`.`,
  },
]

await db.insert(schema.user).values(SYSTEM_USER).onConflictDoNothing()
for (const doc of seedDocs) {
  await db
    .insert(schema.docs)
    .values({ ...doc, authorId: SYSTEM_USER.id })
    .onConflictDoNothing({ target: schema.docs.slug })
}
await db.close()
console.log(`seeded ${seedDocs.length} docs`)
