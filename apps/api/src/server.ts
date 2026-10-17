import Fastify from 'fastify'
import { ZodError } from 'zod'
import { db } from './db.ts'
import { env } from './env.ts'
import { startReminderJob } from './push.ts'
import { analyticsRoutes } from './routes/analytics.ts'
import { authRoutes } from './routes/auth.ts'
import { docRoutes } from './routes/docs.ts'
import { libraryRoutes } from './routes/library.ts'
import { meRoutes } from './routes/me.ts'
import { studyRoutes } from './routes/study.ts'

const app = Fastify({
  logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' },
  // The web app's auth proxy sets X-Forwarded-Host/-Proto, so request.host and
  // request.protocol describe the origin the browser actually used.
  trustProxy: true,
})

app.decorateRequest('session', null)

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.code(400).send({ error: 'invalid_request', issues: error.issues })
  }
  // Fastify's own client errors (bad JSON, body too large, ...) keep their status.
  const status = (error as { statusCode?: number }).statusCode
  if (status && status >= 400 && status < 500) {
    return reply.code(status).send({ error: (error as { code?: string }).code ?? 'bad_request' })
  }
  reply.log.error(error)
  return reply.code(500).send({ error: 'internal_error' })
})

app.get('/healthz', async () => ({ ok: true }))
await app.register(authRoutes)
await app.register(docRoutes)
await app.register(meRoutes)
await app.register(libraryRoutes)
await app.register(studyRoutes)
await app.register(analyticsRoutes)

// Replaced once the server is listening and the reminder job has started.
let stopReminders = () => {}
app.addHook('onClose', async () => {
  stopReminders()
  await db.close()
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => void app.close().then(() => process.exit(0)))
}

await app.listen({ host: env.API_HOST, port: env.API_PORT })
stopReminders = startReminderJob(app.log)
