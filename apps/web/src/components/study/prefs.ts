import { useCallback, useEffect, useState } from 'react'

// Per-device preferences, kept in localStorage. Values load after mount, so the
// server render (defaults) and the first client render always match.

/**
 * State saved under `key`. Returns [value, update, loaded]: `update` merges a
 * patch and saves it, and `loaded` turns true once storage has been read.
 */
export function useStoredState<T extends object>(key: string, defaults: T): [T, (patch: Partial<T>) => void, boolean] {
  const [value, setValue] = useState(defaults)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setValue({ ...defaults, ...(JSON.parse(raw) as Partial<T>) })
    } catch {
      // Unreadable or unavailable storage: keep the defaults.
    }
    setLoaded(true)
    // Defaults are a constant per call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback(
    (patch: Partial<T>) => {
      setValue((current) => {
        const next = { ...current, ...patch }
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // Storage full or blocked: the change still applies for this visit.
        }
        return next
      })
    },
    [key],
  )

  return [value, update, loaded]
}

/** Display options for the study session, set in its preferences panel. */
export interface SessionPrefs {
  showIntervals: boolean
  showTimer: boolean
  showCounts: boolean
  textSize: 's' | 'm' | 'l' | 'xl'
  align: 'center' | 'left'
  animate: boolean
  confetti: boolean
  keyHints: boolean
  focusMode: boolean
}

export const DEFAULT_SESSION_PREFS: SessionPrefs = {
  showIntervals: true,
  showTimer: true,
  showCounts: true,
  textSize: 'm',
  align: 'center',
  animate: true,
  confetti: true,
  keyHints: true,
  focusMode: false,
}
