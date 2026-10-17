import { createFileRoute, Link } from '@tanstack/react-router'
import { CONTACT_EMAIL } from '../lib/links.ts'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../lib/seo.ts'

const TITLE = 'Privacy policy · Askesis'
const DESCRIPTION =
  'What personal data Askesis collects, why, who else handles it, how long we keep it, and your rights under the GDPR.'
const UPDATED = '17 October 2026'

export const Route = createFileRoute('/privacy')({
  head: () => {
    const { meta, links } = seo({ title: TITLE, description: DESCRIPTION, path: '/privacy' })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'WebPage',
            '@id': absoluteUrl('/privacy#page'),
            name: 'Privacy policy',
            description: DESCRIPTION,
            url: absoluteUrl('/privacy'),
            isPartOf: { '@id': absoluteUrl('/#website') },
            publisher: { '@id': ORGANIZATION['@id'] },
          },
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'Privacy policy', path: '/privacy' },
          ]),
        ),
      ],
      links,
    }
  },
  component: Privacy,
})

function Privacy() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  return (
    <main className="info-page">
      <header className="info-hero">
        <p className="eyebrow">Legal</p>
        <h1 className="info-hero__title">Privacy policy</h1>
        <p className="info-hero__lead">What we collect, why, and who else handles it.</p>
        <p className="info-hero__meta">Last updated {UPDATED}</p>
      </header>

      <div className="info-prose">
        <h2>Who we are</h2>
        <p>
          Askesis (askesisproject.org) is the controller of your personal data. Contact: {mail}. This policy covers
          askesisproject.org only, not copies of Askesis that others run.
        </p>

        <h2>What we collect and why</h2>
        <ul>
          <li>
            <strong>Account:</strong> name, username, email address and password (stored as a hash). To create and run your
            account. <span className="info-basis">Basis: contract.</span>
          </li>
          <li>
            <strong>Your studying:</strong> decks, cards, answers, rewards and settings, including your time zone. To provide the
            app. <span className="info-basis">Basis: contract.</span>
          </li>
          <li>
            <strong>Sign-in and security:</strong> IP address, browser and server logs. To keep you signed in, protect the service
            and fix problems. <span className="info-basis">Basis: contract and legitimate interests.</span>
          </li>
          <li>
            <strong>Reminders:</strong> the push address your browser gives us, only if you turn reminders on.{' '}
            <span className="info-basis">Basis: consent.</span>
          </li>
          <li>
            <strong>Analytics:</strong> pages visited, clicks, device, browser and approximate location, only if you accept all
            cookies. To understand how Askesis is used and improve it. <span className="info-basis">Basis: consent.</span>
          </li>
          <li>
            <strong>Supporter tier:</strong> if you support us on Patreon. To give you your perks.{' '}
            <span className="info-basis">Basis: contract.</span>
          </li>
          <li>
            <strong>Emails you send us:</strong> to reply. <span className="info-basis">Basis: legitimate interests.</span>
          </li>
        </ul>
        <p>
          An account needs an email address and password; without them we can’t create one. We don’t sell your data, show ads or
          make automated decisions about you.
        </p>

        <h2>Who else handles it</h2>
        <ul>
          <li>
            <strong>Cloudflare:</strong> network and security. Requests, including IP addresses, pass through it.
          </li>
          <li>
            <strong>PostHog:</strong> analytics, on EU servers, only with your consent.
          </li>
          <li>
            <strong>Google, Mozilla or Apple:</strong> deliver reminders through your browser, only if you turn them on.
          </li>
          <li>
            <strong>Patreon:</strong> handles payments if you support us, under its own privacy policy.
          </li>
        </ul>
        <p>
          Some of these providers are based outside the EU. Where data leaves the EU, it’s covered by safeguards the GDPR allows,
          such as standard contractual clauses or the EU–US Data Privacy Framework.
        </p>

        <h2>How long we keep it</h2>
        <ul>
          <li>Account and studying data: until your account is deleted.</li>
          <li>Sign-in sessions: until they expire or you sign out.</li>
          <li>Logs, analytics and emails: only as long as needed for the purposes above.</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          You can ask to access, correct, delete or export your data, and to restrict or object to how we use it. You can withdraw
          consent at any time: for analytics on the <Link to="/cookies">cookie page</Link>, for reminders in Settings. You can
          also complain to a data protection authority. To make a request, email {mail} from the address on your account.
        </p>

        <h2>Cookies</h2>
        <p>
          See the <Link to="/cookies">cookie policy</Link>.
        </p>

        <h2>Children</h2>
        <p>Askesis isn’t meant for children under 13.</p>

        <h2>Changes</h2>
        <p>We may update this policy. The date at the top shows the current version.</p>
      </div>

      <p className="info-footnote">
        See also the <Link to="/terms">terms and conditions</Link>.
      </p>
    </main>
  )
}
