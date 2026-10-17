import { Link } from '@tanstack/react-router'
import { Cookie } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { ANALYTICS_ENABLED } from '../../lib/analytics.ts'
import { saveConsent, useConsent } from '../../lib/consent.ts'

/**
 * Asks once for cookie consent, in a centered popup on every page until the
 * visitor chooses. Both choices are one click; the choice can be changed later
 * on /cookies. Builds without analytics only use essential cookies, so they
 * never ask.
 */
export function CookieBanner() {
  const consent = useConsent()
  if (!ANALYTICS_ENABLED || consent !== null) return null
  return <CookiePopup />
}

function CookiePopup() {
  const ref = useRef<HTMLDialogElement>(null)
  // A native modal: it sits above everything, keeps focus inside and leaves the page inert until a choice is made.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    // Focus the popup itself, not its first link, so nothing looks preselected.
    dialog.focus()
  }, [])

  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      className="cookie-banner"
      aria-labelledby="cookie-banner-title"
      // Esc closes it without a choice (browsers don't let a page stop that): only
      // essential cookies are used until the visitor chooses, and the next visit asks again.
      aria-describedby="cookie-banner-text"
    >
      <div className="cookie-banner__head">
        <span className="cookie-banner__icon" aria-hidden>
          <Cookie size={20} />
        </span>
        <h2 id="cookie-banner-title" className="cookie-banner__title">
          Cookies
        </h2>
      </div>
      <p id="cookie-banner-text" className="cookie-banner__text">
        We use essential cookies to keep you signed in and remember your settings. If you accept all, we also use analytics
        cookies to learn how Askesis is used. <Link to="/cookies">Cookie policy</Link>
      </p>
      <div className="cookie-banner__actions">
        <button type="button" className="btn btn--ghost" onClick={() => saveConsent('essential')}>
          Accept essential
        </button>
        <button type="button" className="btn btn--primary" onClick={() => saveConsent('all')}>
          Accept all
        </button>
      </div>
    </dialog>
  )
}
