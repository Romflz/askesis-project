import { analyticsQuery } from '@askesis/contracts'
import { type Analytics, buildAnalytics } from '@askesis/core'
import { demoCollection } from '@askesis/core/demo'
import { createServerFn } from '@tanstack/react-start'
import { apiFetch } from './api.server.ts'

// The analytics page. Signed-in users get their own collection, sliced by range
// and deck; visitors get the sample learner's last three months, with a login
// popup when they try to filter it.

export const getMyAnalytics = createServerFn({ method: 'GET' })
  .validator(analyticsQuery)
  .handler(({ data }) => {
    const params = new URLSearchParams({ range: data.range })
    if (data.deck) params.set('deck', data.deck)
    return apiFetch<Analytics>(`/me/analytics?${params}`)
  })

/** Built here rather than on the API: the sample learner needs no account or database. */
export const getDemoAnalytics = createServerFn({ method: 'GET' }).handler(() =>
  buildAnalytics(demoCollection(), { days: 90 }, true),
)
