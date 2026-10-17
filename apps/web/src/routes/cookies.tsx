import { createFileRoute, Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { Check } from 'lucide-react'
import { type Consent, saveConsent, useConsent } from '../lib/consent.ts'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../lib/seo.ts'

const TITLE = 'Cookie policy · Askesis'
const DESCRIPTION =
  'The cookies Askesis uses: essential ones to keep you signed in, and analytics only if you accept them. Change your choice at any time.'
const UPDATED = '17 October 2026'

interface Item {
  name: string
  purpose: string
  lasts: string
}

const ESSENTIAL: Item[] = [
  {
    name: '__Secure-better-auth.session_token',
    purpose: 'Keeps you signed in.',
    lasts: 'until you sign out or the session ends',
  },
  { name: 'askesis_tz', purpose: 'Your time zone, so “today” matches your clock.', lasts: '1 year' },
  {
    name: 'Browser storage',
    purpose: 'Your cookie choice, theme, study preferences and practice progress. It stays on your device.',
    lasts: 'until you clear it',
  },
]

const ANALYTICS: Item[] = [
  {
    name: 'ph_…_posthog',
    purpose: 'PostHog analytics: a random ID that tells visits apart, so we can see how Askesis is used. Stored on EU servers.',
    lasts: '1 year',
  },
]

const CHOICE_TEXT: Record<Consent, string> = {
  all: 'You accepted all cookies, including analytics.',
  essential: 'You accepted essential cookies only. Analytics are off.',
}

export const Route = createFileRoute('/cookies')({
  head: () => {
    const { meta, links } = seo({ title: TITLE, description: DESCRIPTION, path: '/cookies' })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'WebPage',
            '@id': absoluteUrl('/cookies#page'),
            name: 'Cookie policy',
            description: DESCRIPTION,
            url: absoluteUrl('/cookies'),
            isPartOf: { '@id': absoluteUrl('/#website') },
            publisher: { '@id': ORGANIZATION['@id'] },
          },
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'Cookie policy', path: '/cookies' },
          ]),
        ),
      ],
      links,
    }
  },
  component: Cookies,
})

function Cookies() {
  return (
    <main className="info-page">
      <header className="info-hero">
        <p className="eyebrow">Legal</p>
        <h1 className="info-hero__title">Cookie policy</h1>
        <p className="info-hero__lead">
          Askesis uses a few essential cookies to work. Analytics cookies are used only if you accept them.
        </p>
        <p className="info-hero__meta">Last updated {UPDATED}</p>
      </header>

      <CookieChoice />

      <div className="info-prose">
        <h2>Essential</h2>
        <p>Always on, because the site can’t work without them.</p>
        <CookieList items={ESSENTIAL} />

        <h2>Analytics</h2>
        <p>Only if you choose “Accept all”. You can turn them off at any time above.</p>
        <CookieList items={ANALYTICS} />

        <p>
          You can also delete cookies in your browser’s settings. For how we handle personal data, see the{' '}
          <Link to="/privacy">privacy policy</Link>.
        </p>
      </div>
    </main>
  )
}

/** The visitor's current choice and the buttons to change it. */
function CookieChoice() {
  const consent = useConsent()
  return (
    <section className="panel cookie-choice" aria-labelledby="choice-title">
      <div>
        <h2 id="choice-title" className="eyebrow">
          Your choice
        </h2>
        {/* Empty until mounted: only the browser knows the choice. */}
        <p className="cookie-choice__status" aria-live="polite">
          {consent === undefined ? ' ' : consent ? CHOICE_TEXT[consent] : 'You haven’t chosen yet.'}
        </p>
      </div>
      <div className="cookie-choice__actions">
        {(['essential', 'all'] as const).map((choice) => (
          <button
            key={choice}
            type="button"
            className={clsx('btn btn--ghost btn--sm', consent === choice && 'is-active')}
            aria-pressed={consent === choice}
            onClick={() => saveConsent(choice)}
          >
            {consent === choice && <Check size={14} aria-hidden />}
            {choice === 'all' ? 'Accept all' : 'Accept essential'}
          </button>
        ))}
      </div>
    </section>
  )
}

function CookieList({ items }: { items: Item[] }) {
  return (
    <dl className="cookie-list">
      {items.map((item) => (
        <div key={item.name} className="cookie-list__item">
          <dt>
            <code>{item.name}</code>
          </dt>
          <dd>{item.purpose}</dd>
          <dd className="cookie-list__lasts">Lasts: {item.lasts}</dd>
        </div>
      ))}
    </dl>
  )
}
