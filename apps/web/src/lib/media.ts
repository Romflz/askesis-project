import { useSyncExternalStore } from 'react'

/** Phones, matching the SCSS `down(sm)` breakpoint. */
export const PHONE_QUERY = '(max-width: 639.98px)'

/**
 * Whether a media query matches, kept live as the window resizes. The server
 * and the hydration pass see `false`, so layout that must not shift on load
 * belongs in CSS; use this for props that only exist in JS (chart axes).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
