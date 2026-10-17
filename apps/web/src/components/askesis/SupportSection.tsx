import { SUPPORT_TIERS, type SupportLevel } from '@askesis/contracts'
import clsx from 'clsx'
import { Check, Heart } from 'lucide-react'
import type { ReactNode } from 'react'
import { GITHUB_URL, PATREON_URL } from '../../lib/links.ts'
import { GitHubMark, PatreonMark } from './brands.tsx'

interface Tier {
  name: string
  price: number
  tagline: string
  includes?: string
  perks: ReactNode[]
  featured?: boolean
}

// Monthly Patreon tiers. Perks are things we can keep doing as the project grows.
const TIERS: Tier[] = [
  {
    name: 'Backer',
    price: 3,
    tagline: 'Chip in and follow along.',
    perks: ['Your name in BACKERS.md in the repository', 'Patron-only devlog posts', 'Our thanks'],
  },
  {
    name: 'Insider',
    price: 8,
    tagline: 'See what’s coming and help steer.',
    includes: 'Backer',
    perks: ['Monthly devlog on what’s coming', 'Vote in roadmap polls', 'Early look at new features before release'],
    featured: true,
  },
  {
    name: 'Champion',
    price: 20,
    tagline: 'Put your feedback first in line.',
    includes: 'Insider',
    perks: [
      <>
        Your bug reports and feature requests get a <code className="support__label">patron</code> label and are reviewed first{' '}
        <span className="tier__note">(not a promise to build them)</span>
      </>,
      'Suggest a public practice deck; patron picks go to the top of the queue',
    ],
  },
  {
    name: 'Sponsor',
    price: 100,
    tagline: 'For companies and schools.',
    perks: ['Your logo in the README and on this page', 'Priority help with self-hosting'],
  },
]

const external = { target: '_blank', rel: 'noreferrer' } as const

/**
 * What support pays for, the Patreon tiers and other ways to help: the closing
 * section of the public home page and of the signed-in dashboard. `level` is
 * the viewer's tier (signed in); supporters get a thank-you and their tier marked.
 */
export function SupportSection({ level = 0 }: { level?: SupportLevel }) {
  const current = level ? SUPPORT_TIERS[level] : null
  return (
    <section className="panel support" id="support" aria-labelledby="support-title">
      <div className="support__backdrop" aria-hidden />

      <div className="support__intro">
        <div>
          <p className="eyebrow">{current ? 'Supporter' : 'Support Askesis'}</p>
          <h2 className="support__title" id="support-title">
            {current ? 'Thank you for supporting Askesis' : 'Help keep Askesis free for everyone'}
          </h2>
          {current && (
            <p className={`support__you supporter-chip supporter-chip--${level}`}>
              <Heart size={13} fill="currentColor" strokeWidth={0} aria-hidden /> You’re an Askesis {current}
            </p>
          )}
          <p className="support__pitch">
            {current
              ? 'Your support pays for hosting, the domain and development time, and keeps every feature free for everyone. Your badge shows next to your profile.'
              : 'Askesis is free and open source, and every feature stays free: no paywalls, no ads, no selling your data. Support pays for hosting, the domain, and development time.'}
          </p>
        </div>
        <div className="support__actions">
          <a href={PATREON_URL} className="btn btn--primary" {...external}>
            <PatreonMark size={15} />
            {current ? 'Manage on Patreon' : 'Become a patron'}
          </a>
          <a href={GITHUB_URL} className="btn btn--ghost" {...external}>
            <GitHubMark />
            Star on GitHub
          </a>
        </div>
      </div>

      <ul className="support__tiers" aria-label="Monthly tiers">
        {TIERS.map((tier) => (
          <li
            key={tier.name}
            className={clsx('tier', tier.featured && !current && 'tier--featured', tier.name === current && 'tier--current')}
          >
            <div className="tier__head">
              <h3 className="tier__name">{tier.name}</h3>
              {tier.name === current ? (
                <span className="tier__badge tier__badge--current">Your tier</span>
              ) : (
                tier.featured && !current && <span className="tier__badge">Recommended</span>
              )}
            </div>
            <p className="tier__price">
              <span className="tier__amount">€{tier.price}</span>
              <span className="tier__per">/ month</span>
            </p>
            <p className="tier__tagline">{tier.tagline}</p>
            {tier.includes && <p className="tier__includes">Everything in {tier.includes}, plus:</p>}
            <ul className="tier__perks">
              {tier.perks.map((perk, i) => (
                <li key={i}>
                  <Check size={15} strokeWidth={2.5} aria-hidden />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <a href={PATREON_URL} className="btn btn--ghost btn--sm btn--block tier__cta" {...external}>
              {tier.name === current ? 'Manage membership' : current ? `Switch to ${tier.name}` : `Join as ${tier.name}`}
            </a>
          </li>
        ))}
      </ul>

      <div className="support__footer">
        <p>
          Other ways to help:{' '}
          <a href={GITHUB_URL} {...external}>
            star the repo
          </a>
          ,{' '}
          <a href={`${GITHUB_URL}/issues`} {...external}>
            report bugs
          </a>
          , or{' '}
          <a href={GITHUB_URL} {...external}>
            contribute decks or code
          </a>
          .
        </p>
        <p>Billed monthly in euros through Patreon. Cancel anytime.</p>
      </div>
    </section>
  )
}
