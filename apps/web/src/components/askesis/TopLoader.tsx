import { useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

// Shown only when a navigation takes longer than this, so instant ones never flash.
const DELAY_MS = 120

type Phase = 'idle' | 'loading' | 'done'

/**
 * A thin progress bar across the top of the viewport while the router loads the
 * next page. It creeps toward the end while loaders run and completes when the
 * new page renders. Fixed position, so it never moves the layout; decorative,
 * so screen readers skip it (the new page's title announces the navigation).
 */
export function TopLoader() {
  const pending = useRouterState({ select: (s) => s.status === 'pending' || s.isLoading })
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    if (pending) {
      const timer = setTimeout(() => setPhase('loading'), DELAY_MS)
      return () => clearTimeout(timer)
    }
    setPhase((current) => (current === 'loading' ? 'done' : current))
  }, [pending])

  useEffect(() => {
    if (phase !== 'done') return
    // Long enough for the bar to fill and fade out (see _toploader.scss).
    const timer = setTimeout(() => setPhase('idle'), 450)
    return () => clearTimeout(timer)
  }, [phase])

  return (
    <div className="toploader" data-phase={phase} aria-hidden>
      <div className="toploader__bar" />
    </div>
  )
}
