import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Bug, Mail, Scale } from 'lucide-react'
import { GitHubMark, PatreonMark } from '../components/askesis/brands.tsx'
import { CopyButton } from '../components/askesis/CopyButton.tsx'
import { CONTACT_EMAIL, GITHUB_URL, PATREON_URL } from '../lib/links.ts'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../lib/seo.ts'

const TITLE = 'Contact · Askesis'
const DESCRIPTION =
  'Questions, ideas, feedback or licensing: email the Askesis team, report a bug on GitHub or support the project on Patreon.'

const external = { target: '_blank', rel: 'noreferrer' } as const

export const Route = createFileRoute('/contact')({
  head: () => {
    const { meta, links } = seo({ title: TITLE, description: DESCRIPTION, path: '/contact' })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'ContactPage',
            '@id': absoluteUrl('/contact#page'),
            name: 'Contact Askesis',
            description: DESCRIPTION,
            url: absoluteUrl('/contact'),
            isPartOf: { '@id': absoluteUrl('/#website') },
            about: { '@id': ORGANIZATION['@id'] },
          },
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ),
      ],
      links,
    }
  },
  component: Contact,
})

function Contact() {
  return (
    <main className="info-page">
      <header className="info-hero">
        <p className="eyebrow">Contact</p>
        <h1 className="info-hero__title">Get in touch</h1>
        <p className="info-hero__lead">
          Questions, ideas, feedback or a deck you’d like to see: write to us. Email is the best way to reach us.
        </p>
      </header>

      <section className="panel contact-email" aria-labelledby="email-title">
        <span className="contact-email__icon" aria-hidden>
          <Mail size={22} />
        </span>
        <div className="contact-email__body">
          <h2 id="email-title" className="eyebrow">
            Email
          </h2>
          <a href={`mailto:${CONTACT_EMAIL}`} className="contact-email__address">
            {CONTACT_EMAIL}
          </a>
        </div>
        <CopyButton text={CONTACT_EMAIL} label="Copy address" className="btn--ghost contact-email__copy" />
      </section>

      <section aria-labelledby="ways-title">
        <h2 id="ways-title" className="info-section-title">
          Other ways to reach us
        </h2>
        <div className="contact-ways">
          <a href={`${GITHUB_URL}/issues`} className="contact-way" {...external}>
            <span className="contact-way__icon" aria-hidden>
              <Bug size={18} />
            </span>
            <span className="contact-way__title">Found a bug or have an idea?</span>
            <span className="contact-way__text">Open an issue on GitHub, where everyone can follow along and add to it.</span>
            <span className="contact-way__cta">
              <GitHubMark size={14} /> Open an issue
            </span>
          </a>
          <Link to="/docs" className="contact-way">
            <span className="contact-way__icon" aria-hidden>
              <BookOpen size={18} />
            </span>
            <span className="contact-way__title">Need help with the app?</span>
            <span className="contact-way__text">The docs explain studying, scheduling, imports, rewards and more.</span>
            <span className="contact-way__cta">
              Read the docs <ArrowRight size={14} />
            </span>
          </Link>
          <a href={PATREON_URL} className="contact-way" {...external}>
            <span className="contact-way__icon" aria-hidden>
              <PatreonMark size={16} />
            </span>
            <span className="contact-way__title">Want to support the project?</span>
            <span className="contact-way__text">
              Patrons pay for hosting and development, and keep Askesis free for everyone.
            </span>
            <span className="contact-way__cta">
              Become a patron <ArrowRight size={14} />
            </span>
          </a>
          <a href={`mailto:${CONTACT_EMAIL}?subject=Commercial%20license`} className="contact-way">
            <span className="contact-way__icon" aria-hidden>
              <Scale size={18} />
            </span>
            <span className="contact-way__title">Commercial licensing</span>
            <span className="contact-way__text">
              Askesis is free for personal and community use. To use it in a paid product or service, email us first.
            </span>
            <span className="contact-way__cta">
              <Mail size={14} /> Email about a license
            </span>
          </a>
        </div>
      </section>

      <p className="info-footnote">
        Curious why Askesis exists? <Link to="/about">Read about the project</Link>.
      </p>
    </main>
  )
}
