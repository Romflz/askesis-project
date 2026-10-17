/// <reference types="vite/client" />
import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'
import monoLatin from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url'
import type { QueryClient } from '@tanstack/react-query'
import {
  Asset,
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useMatches,
  useRouter,
  useTags,
} from '@tanstack/react-router'
import { type ReactNode, useEffect } from 'react'
import { CookieBanner } from '../components/askesis/CookieBanner.tsx'
import { themeScript, TopBar } from '../components/askesis/TopBar.tsx'
import { TopLoader } from '../components/askesis/TopLoader.tsx'
import { registerPwa } from '../lib/pwa.ts'
import { absoluteUrl, DEFAULT_IMAGE, SITE_NAME } from '../lib/seo.ts'
import { getSessionUser } from '../server/session.functions.ts'
import appCss from '../styles/main.scss?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Every route reads the user from context. Guests cost nothing: without a
  // session cookie, getSessionUser returns null without asking the API.
  beforeLoad: async () => ({ user: await getSessionUser() }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Askesis' },
      { name: 'description', content: 'Spaced repetition that plays like a game. Open source, powered by FSRS.' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Askesis' },
      // Social defaults; public routes override title, description, URL and image via lib/seo.ts.
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: absoluteUrl(DEFAULT_IMAGE) },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: absoluteUrl(DEFAULT_IMAGE) },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    // The head script sets data-theme and data-install on <html> before hydration, so React must not flag them.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* The latin web fonts every page uses above the fold, requested with the CSS
            rather than after it, and ahead of the scripts (styles/_fonts.scss uses the
            same fingerprinted files). */}
        <link rel="preload" href={geistLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={monoLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Rendered here, not in head(): the router keeps one meta per name. */}
        <meta name="theme-color" content="#07080b" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f3f3ef" media="(prefers-color-scheme: light)" />
        {import.meta.env.DEV ? <HeadContent /> : <ProdHeadContent />}
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

/**
 * HeadContent with the page's module preloads at low fetch priority. The
 * scripts hydrate a page that is already server-rendered, so on a slow
 * connection the stylesheet and fonts (what first paint waits for) shouldn't
 * share bandwidth with them; they still start downloading right away.
 * Development keeps HeadContent, which also manages Vite's dev styles.
 */
function ProdHeadContent() {
  const tags = useTags()
  const nonce = useRouter().options.ssr?.nonce
  return tags.map((tag) => {
    const lowered =
      tag.tag === 'link' && tag.attrs?.rel === 'modulepreload' ? { ...tag, attrs: { ...tag.attrs, fetchPriority: 'low' } } : tag
    return <Asset {...lowered} key={`tsr-meta-${JSON.stringify(tag)}`} nonce={nonce} />
  })
}

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    /** The route renders its own top bar (dashboards with live stats, full-screen auth pages). */
    ownChrome?: boolean
  }
}

function RootLayout() {
  const { user } = Route.useRouteContext()
  const ownChrome = useMatches({ select: (matches) => matches.some((m) => m.staticData?.ownChrome) })
  useEffect(registerPwa, [])
  return (
    <>
      <TopLoader />
      {!ownChrome && <TopBar user={user} />}
      <Outlet />
      <CookieBanner />
    </>
  )
}
