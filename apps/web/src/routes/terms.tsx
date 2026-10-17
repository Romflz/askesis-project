import { createFileRoute, Link } from '@tanstack/react-router'
import { CONTACT_EMAIL, GITHUB_URL, PATREON_URL } from '../lib/links.ts'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../lib/seo.ts'

const TITLE = 'Terms and conditions · Askesis'
const DESCRIPTION =
  'The rules for using Askesis: your account, the cards you add, fair use, XP and coins, Patreon support, and what happens if things go wrong.'
const UPDATED = '17 October 2026'

export const Route = createFileRoute('/terms')({
  head: () => {
    const { meta, links } = seo({ title: TITLE, description: DESCRIPTION, path: '/terms' })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'WebPage',
            '@id': absoluteUrl('/terms#page'),
            name: 'Terms and conditions',
            description: DESCRIPTION,
            url: absoluteUrl('/terms'),
            isPartOf: { '@id': absoluteUrl('/#website') },
            publisher: { '@id': ORGANIZATION['@id'] },
          },
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'Terms and conditions', path: '/terms' },
          ]),
        ),
      ],
      links,
    }
  },
  component: Terms,
})

function Terms() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  return (
    <main className="info-page">
      <header className="info-hero">
        <p className="eyebrow">Legal</p>
        <h1 className="info-hero__title">Terms and conditions</h1>
        <p className="info-hero__lead">
          The rules for using Askesis at askesisproject.org, in plain words. By creating an account or using the site, you agree
          to them.
        </p>
        <p className="info-hero__meta">Last updated {UPDATED}</p>
      </header>

      <div className="info-prose">
        <h2>The service</h2>
        <p>
          Askesis is a free flashcard app with spaced repetition and a progression system. You can practice the public decks
          without an account; an account saves your decks, cards and progress. We keep improving Askesis, so features may change,
          be added or be removed over time.
        </p>

        <h2>Your account</h2>
        <ul>
          <li>Use an email address you own and keep your password safe. You’re responsible for what happens on your account.</li>
          <li>One account per person. Don’t share it or sign in to anyone else’s.</li>
          <li>
            You need to be at least 13 to make an account. If you’re under the age of adulthood where you live, ask a parent or
            guardian first.
          </li>
          <li>
            Pick a username that doesn’t pretend to be someone else and isn’t offensive. We may change usernames that break this.
          </li>
        </ul>

        <h2>Your cards</h2>
        <ul>
          <li>
            The decks and cards you create or import are yours. You let us store and process them only as needed to run the
            service for you.
          </li>
          <li>
            Only add material you have the right to use, and nothing illegal. Short notes from a book for your own study are fine;
            uploading whole copyrighted works is not.
          </li>
          <li>
            We take care of your data, but no service is perfect. Export decks you care about from time to time as a backup.
          </li>
        </ul>

        <h2>Fair use</h2>
        <p>Please don’t:</p>
        <ul>
          <li>use Askesis to break the law or to harm anyone;</li>
          <li>attack, overload or probe the service, or scrape it beyond normal use;</li>
          <li>get around limits or security, or access accounts and data that aren’t yours;</li>
          <li>use scripts or bots to farm XP, coins, streaks or other rewards.</li>
        </ul>
        <p>Found a security problem? Email {mail} rather than posting it publicly, and we’ll fix it as quickly as we can.</p>

        <h2>XP, coins and rewards</h2>
        <p>
          XP, levels, coins, chests, quests, streaks and trophies are part of the game. They have no cash value and can’t be
          bought, sold or transferred. We may adjust them, for example to fix a bug or undo cheating.
        </p>

        <h2>Public practice decks</h2>
        <p>
          The public decks are written carefully, but they can contain mistakes. They’re for learning and practice, not
          professional, medical, legal or exam advice. If you spot an error, <Link to="/contact">let us know</Link>.
        </p>

        <h2>Supporting on Patreon</h2>
        <p>
          Supporting Askesis is optional, and every feature stays free either way. Payments, billing, cancellations and refunds
          are handled by{' '}
          <a href={PATREON_URL} target="_blank" rel="noreferrer">
            Patreon
          </a>{' '}
          under its own terms. We set supporter tiers on accounts by hand, so a new badge can take a little while to appear.
        </p>

        <h2>The code</h2>
        <p>
          The source code is public on{' '}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>{' '}
          under the PolyForm Noncommercial License 1.0.0. These terms cover using askesisproject.org; the license covers the code.
          Using the code in a commercial product or service needs a separate license, so email us first.
        </p>

        <h2>No guarantees</h2>
        <p>
          Askesis is free and provided as it is. We work to keep it running and your data safe, but we can’t promise it will
          always be available, error-free or suited to a particular purpose. We may pause it for maintenance.
        </p>

        <h2>Liability</h2>
        <p>
          As far as the law allows, we aren’t liable for indirect losses, or for lost data, study progress, streaks or rewards.
          Nothing in these terms limits any liability that can’t be limited by law, or your rights as a consumer.
        </p>

        <h2>Ending your account</h2>
        <p>
          You can stop using Askesis at any time and ask us to delete your account (see the{' '}
          <Link to="/privacy">privacy policy</Link>). We may suspend or close accounts that break these terms. Where it’s
          reasonable, we’ll tell you first and give you a chance to export your decks.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          If we change these terms, we’ll update the date at the top, and say so on the site before a significant change applies.
          If you keep using Askesis after that, the new terms apply.
        </p>

        <h2>Contact</h2>
        <p>Questions about these terms: {mail}.</p>
      </div>

      <p className="info-footnote">
        See also the <Link to="/privacy">privacy policy</Link>.
      </p>
    </main>
  )
}
