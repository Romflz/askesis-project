import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth, type Session } from './auth.ts'

/** Fastify's Node-style headers (repeated headers arrive as arrays) as Fetch `Headers`, for Better Auth. */
export function toWebHeaders(request: FastifyRequest) {
  const headers = new Headers()
  for (const [key, value] of Object.entries(request.headers)) {
    if (value === undefined) continue
    for (const v of Array.isArray(value) ? value : [value]) headers.append(key, v)
  }
  return headers
}

export async function getSession(request: FastifyRequest): Promise<Session | null> {
  return auth.api.getSession({ headers: toWebHeaders(request) })
}

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by requireSession; null on routes that don't use it. */
    session: Session | null
  }
}

/** preHandler that rejects anonymous requests and attaches the session. */
export async function requireSession(request: FastifyRequest, reply: FastifyReply) {
  const session = await getSession(request)
  if (!session) return reply.code(401).send({ error: 'unauthorized' })
  request.session = session
}
