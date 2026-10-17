import type { FastifyInstance } from 'fastify'
import { auth } from '../auth.ts'
import { toWebHeaders } from '../http.ts'

/** Mounts Better Auth's fetch handler on Fastify. */
export async function authRoutes(app: FastifyInstance) {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      const url = new URL(request.url, `${request.protocol}://${request.host}`)
      const response = await auth.handler(
        new Request(url, {
          method: request.method,
          headers: toWebHeaders(request),
          // Fastify has already parsed the JSON body; Better Auth reads it again from the Request.
          body: request.body === undefined ? undefined : JSON.stringify(request.body),
        }),
      )
      reply.status(response.status)
      response.headers.forEach((value, key) => reply.header(key, value))
      return reply.send(response.body ? await response.text() : null)
    },
  })
}
