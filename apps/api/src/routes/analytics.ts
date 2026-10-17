import { analyticsQuery } from '@askesis/contracts'
import { type Analytics, buildAnalytics } from '@askesis/core'
import type { FastifyInstance } from 'fastify'
import { loadCollection } from '../collection.ts'
import { requireSession } from '../http.ts'
import { zoneHint } from './me.ts'

// The analytics page: the dashboard's collection, sliced by a time range and
// a deck (with its subdecks), computed in @askesis/core.
export async function analyticsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireSession)

  app.get('/me/analytics', async (request): Promise<Analytics> => {
    const { range, deck } = analyticsQuery.parse(request.query)
    const col = await loadCollection(request.session!.user.id, zoneHint(request))
    // An unknown deck (deleted, or someone else's) falls back to every deck; `deck` in the result says which.
    return buildAnalytics(col, { days: range === 'all' ? null : Number(range), deckIds: deck ? [deck] : undefined })
  })
}
