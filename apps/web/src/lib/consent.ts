import { useSyncExternalStore } from 'react'

// Cookie consent: 'essential' (only what the site needs to work) or 'all'
// (essential plus analytics). Analytics may start only once the choice is
// 'all' and must stop if it changes back, so every change is announced.

export type Consent = 'essential' | 'all'

const KEY = 'askesis-consent'
// Bump when what we use cookies for changes, so everyone is asked again.
const VERSION = 1
const EVENT = 'askesis:consent'

// The choice for this visit when storage is blocked, so the banner still goes away.
let fallback: Consent | null = null

export function readConsent(): Consent | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { choice?: unknown; version?: unknown } | null
    if (saved?.version === VERSION && (saved.choice === 'all' || saved.choice === 'essential')) return saved.choice
  } catch {
    // Unreadable or unavailable storage.
  }
  return fallback
}

/** Saves the choice with the date it was made, and tells listeners in this tab (other tabs get a storage event). */
export function saveConsent(choice: Consent) {
  fallback = choice
  try {
    localStorage.setItem(KEY, JSON.stringify({ choice, version: VERSION, at: new Date().toISOString() }))
  } catch {
    // Storage full or blocked: the choice still applies for this visit.
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Calls `listener` whenever the choice changes, in this tab or another. Returns the unsubscribe function. */
export function onConsentChange(listener: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener()
  }
  window.addEventListener(EVENT, listener)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, listener)
    window.removeEventListener('storage', onStorage)
  }
}

/**
 * The visitor's choice, kept live: `undefined` on the server and during
 * hydration (only the browser knows it), `null` until they choose.
 */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(onConsentChange, readConsent, () => undefined)
}
