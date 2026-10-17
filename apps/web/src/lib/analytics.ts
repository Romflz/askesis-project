import type { PostHog, Properties } from 'posthog-js'
import { onConsentChange, readConsent } from './consent.ts'

// Product analytics with PostHog, only with consent: the library is downloaded
// after "Accept all" and never before, and "Accept essential" stops it. Without
// a token and host (development, self-hosted copies) nothing loads at all.

const TOKEN = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN as string | undefined
// Our own subdomain in production, a reverse proxy to PostHog's EU servers, so blockers don't drop events.
const HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined

let client: PostHog | null = null
let loading = false
let userId: string | null = null

function enable(token: string, host: string) {
  if (client) {
    if (client.has_opted_out_capturing()) client.opt_in_capturing({ captureEventName: false })
    return
  }
  if (loading) return
  loading = true
  import('posthog-js')
    .then(({ default: posthog }) => {
      // The choice may have changed while the library downloaded.
      if (readConsent() !== 'all') return
      posthog.init(token, {
        api_host: host,
        ui_host: 'https://eu.posthog.com',
        defaults: '2025-05-24',
        person_profiles: 'identified_only',
        capture_exceptions: true,
        // Opting out also stops PostHog writing its cookie and storage.
        opt_out_persistence_by_default: true,
        // Neither is covered by the privacy policy.
        disable_session_recording: true,
        disable_surveys: true,
      })
      // An earlier "Accept essential" leaves PostHog's own opt-out flag behind.
      if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing({ captureEventName: false })
      if (userId) posthog.identify(userId)
      client = posthog
    })
    .catch(() => {
      // Blocked or offline: analytics stay off for this visit.
    })
    .finally(() => {
      loading = false
    })
}

/**
 * Starts analytics if the visitor accepted all cookies, and follows later
 * changes to that choice. Returns the unsubscribe function.
 */
export function startAnalytics() {
  if (!TOKEN || !HOST) return
  const apply = () => {
    if (readConsent() === 'all') return enable(TOKEN, HOST)
    if (!client) return
    client.opt_out_capturing()
    // Opting out stops capturing but leaves the ID in its cookie and storage behind.
    client.persistence?.clear()
    client.sessionPersistence?.clear()
  }
  apply()
  return onConsentChange(apply)
}

/** Ties events to the signed-in account by its ID only (no name or email); `null` after sign-out. */
export function identify(id: string | null) {
  if (id === userId) return
  const previous = userId
  userId = id
  if (!client) return
  // A new person on this device: don't merge their events with the previous account's.
  if (previous) client.reset()
  if (id) client.identify(id)
}

/** Records a product event. Does nothing without consent. */
export function capture(event: string, properties?: Properties) {
  client?.capture(event, properties)
}
