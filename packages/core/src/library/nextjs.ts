import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const tsx = (...lines: string[]) => code('tsx', ...lines)

const CARDS: CardContent[] = [
  {
    front: 'What is the App Router?',
    back: 'Next.js’s router in the `app/` directory: folders map to URL segments, special files like `page.tsx` and `layout.tsx` define the UI, and components are React Server Components by default',
    extra: 'The older Pages Router (`pages/`) is still supported.',
  },
  {
    front: 'Which file makes a folder a public route?',
    back: '`page.tsx` (or `.js`, `.jsx`, `.ts`); without one the folder isn’t routable, so other files can be colocated safely',
  },
  {
    front: 'Which URL does `app/blog/[slug]/page.tsx` serve?',
    back: '`/blog/:slug`, e.g. `/blog/hello-world` with `slug` set to `"hello-world"`',
  },
  {
    front: 'Read a dynamic route parameter in a page',
    back: tsx(
      '// app/blog/[slug]/page.tsx',
      'export default async function Page({',
      '  params,',
      '}: {',
      '  params: Promise<{ slug: string }>',
      '}) {',
      '  const { slug } = await params',
      '  return <h1>{slug}</h1>',
      '}',
    ),
    extra: '`params` became a Promise in Next.js 15, and Next.js 16 removed synchronous access.',
  },
  {
    front: '`[...slug]` vs `[[...slug]]`',
    back: '`app/docs/[...slug]` matches `/docs/a/b` (`slug` = `["a", "b"]`) but not `/docs`; the optional `[[...slug]]` also matches `/docs`',
  },
  {
    front: 'What is a folder named `(marketing)`?',
    back: 'A route group: it organizes routes or gives them a shared layout without adding a segment to the URL',
    extra: 'Folders starting with an underscore, like `_components`, are private and never become routes.',
  },
  {
    front: 'Are App Router components server or client components by default?',
    back: "Server Components, unless their module has `'use client'` or is imported from a module that does",
  },
  {
    front: 'What can Server Components do that Client Components can’t?',
    back: 'Be `async`, read databases, files and secrets directly, and keep their code and dependencies out of the browser bundle',
    extra: 'In exchange, they can’t use state, effects, event handlers or browser APIs.',
  },
  {
    front: "When does a component need `'use client'`?",
    back: 'When it uses state or effects (`useState`, `useEffect`), event handlers like `onClick`, browser APIs like `localStorage`, or hooks built on them',
  },
  {
    front: "Where should `'use client'` go?",
    back: 'At the very top of the file, before imports. Everything that module imports becomes client code, so put it on small interactive leaf components, not whole pages',
  },
  {
    front: 'Are Client Components rendered on the server?',
    back: "Yes. They are prerendered to HTML for the first load and then hydrated in the browser; `'use client'` means the code also ships to the browser, not that it only runs there",
  },
  {
    front: 'How can a Client Component display a Server Component?',
    back: 'Pass the Server Component as `children` (or another prop) from a server parent; a client module can’t import a Server Component',
    extra: tsx('// app/page.tsx (server)', '<Modal>', '  <Cart /> {/* still a Server Component */}', '</Modal>'),
  },
  {
    front: 'What props can a Server Component pass to a Client Component?',
    back: 'Only serializable values: strings, numbers, plain objects, arrays, Dates, Promises and the like; not functions or class instances, except Server Actions',
  },
  {
    front: "What does `import 'server-only'` do?",
    back: 'Makes the build fail if client code imports that module, so secrets and server logic can’t leak into the browser bundle',
  },
  {
    front: 'Which environment variables reach the browser?',
    back: 'Only those prefixed with `NEXT_PUBLIC_`; they are inlined into the JavaScript at build time. All others stay on the server',
  },
  {
    front: 'What does `layout.tsx` do?',
    back: 'Wraps a segment and its children (through the `children` prop) with shared UI; it keeps its state and doesn’t re-render when navigating between those child pages',
  },
  {
    front: 'What must the root layout contain?',
    back: '`app/layout.tsx` is required and must render the `<html>` and `<body>` tags',
  },
  {
    front: '`template.tsx` vs `layout.tsx`',
    back: 'A template also wraps child routes, but it remounts on every navigation, so state resets and effects run again',
  },
  {
    front: 'What does `loading.tsx` do?',
    back: 'Wraps the segment’s page in a React Suspense boundary and shows instantly while the page’s content streams in',
  },
  {
    front: 'What does `error.tsx` do, and what must it be?',
    back: "An error boundary for its segment that renders a fallback with a way to retry; it must be a Client Component (`'use client'`)",
    extra: 'Errors thrown in the root layout need `global-error.tsx`.',
  },
  {
    front: 'What does calling `notFound()` do?',
    back: 'Stops rendering and shows the nearest `not-found.tsx` with a 404 status; it comes from `next/navigation`',
  },
  {
    front: 'Write a route handler',
    back: tsx(
      '// app/api/users/route.ts',
      'export async function GET() {',
      '  const users = await db.user.findMany()',
      '  return Response.json(users)',
      '}',
      '',
      'export async function POST(request: Request) {',
      '  const data = await request.json()',
      '  return Response.json(await db.user.create({ data }), { status: 201 })',
      '}',
    ),
    extra: 'Export one function per HTTP method.',
  },
  {
    front: 'Can `page.tsx` and `route.ts` share a folder?',
    back: 'No. A segment is either a page or an endpoint; put handlers under their own path, such as `app/api/…`',
  },
  {
    front: 'Are GET route handlers cached by default?',
    back: "Not since Next.js 15 (they were in 14). Opt in with `export const dynamic = 'force-static'`",
  },
  {
    front: 'Create a post with a Server Action',
    back: tsx(
      'export default function NewPost() {',
      '  async function create(formData: FormData) {',
      "    'use server'",
      "    await db.post.create({ data: { title: String(formData.get('title')) } })",
      "    revalidatePath('/posts')",
      '  }',
      '  return (',
      '    <form action={create}>',
      '      <input name="title" />',
      '      <button>Save</button>',
      '    </form>',
      '  )',
      '}',
    ),
    extra: 'The form works even before JavaScript loads; Server Actions are called with POST requests.',
  },
  {
    front: 'Why must every Server Action check auth and validate input?',
    back: 'Each action is exposed as a public POST endpoint that anyone can call directly, not only through your form',
  },
  {
    front: 'Can you define a Server Action inside a Client Component?',
    back: "No. Put `'use server'` at the top of a separate file and import the action from there, or receive it as a prop",
  },
  {
    front: 'Is `fetch` cached by default in a Server Component?',
    back: "Not since Next.js 15. Opt in per request with `{ cache: 'force-cache' }` or `{ next: { revalidate: 3600 } }`",
    extra: 'Next.js 14 cached `fetch` by default, which surprised many people.',
  },
  {
    front: 'What does `export const revalidate = 3600` do in a page?',
    back: 'Time-based revalidation (ISR): the page is served from cache and regenerated in the background once it’s older than an hour',
    extra: 'Per request: `fetch(url, { next: { revalidate: 3600 } })`.',
  },
  {
    front: 'Refresh cached data right after a mutation',
    back: "Call `revalidatePath('/posts')`, or `revalidateTag('posts', 'max')` for data fetched with `{ next: { tags: ['posts'] } }`",
    extra:
      'The second `cacheLife` profile argument to `revalidateTag` is new in Next.js 16; in Server Actions, `updateTag` gives read-your-own-writes.',
  },
  {
    front: "What does the `'use cache'` directive do?",
    back: 'With Cache Components enabled (`cacheComponents: true`, Next.js 16), it marks a function, component or route as cacheable; `cacheLife()` sets how long and `cacheTag()` tags it',
    extra: tsx('async function getPosts() {', "  'use cache'", "  cacheLife('hours')", '  return db.post.findMany()', '}'),
  },
  {
    front: 'What is request memoization?',
    back: 'Identical `fetch` GET requests (same URL and options) made during one server render run only once; wrap other data functions in React’s `cache()` for the same effect',
  },
  {
    front: 'Static vs dynamic rendering',
    back: 'Routes are prerendered at build time by default; they render per request when they read request data like `cookies()`, `headers()` or `searchParams`, or use uncached data',
    extra: 'With Cache Components, a route can mix both: a prerendered shell with dynamic parts streamed inside `<Suspense>`.',
  },
  {
    front: 'Prerender every blog post at build time',
    back: tsx(
      '// app/blog/[slug]/page.tsx',
      'export async function generateStaticParams() {',
      '  const posts = await getPosts()',
      '  return posts.map((post) => ({ slug: post.slug }))',
      '}',
    ),
  },
  {
    front: 'Read a cookie in a Server Component',
    back: tsx("import { cookies } from 'next/headers'", '', "const theme = (await cookies()).get('theme')?.value"),
    extra:
      '`cookies()` and `headers()` are async since Next.js 15 and make the route dynamic. Setting cookies only works in Server Actions and route handlers.',
  },
  {
    front: 'Read the query string `?page=2` in a page',
    back: tsx(
      'export default async function Page({',
      '  searchParams,',
      '}: {',
      '  searchParams: Promise<{ page?: string }>',
      '}) {',
      "  const { page = '1' } = await searchParams",
      '}',
    ),
    extra: 'Reading `searchParams` makes the page render per request.',
  },
  {
    front: 'Set a page’s title and description',
    back: tsx(
      "import type { Metadata } from 'next'",
      '',
      'export const metadata: Metadata = {',
      "  title: 'Pricing',",
      "  description: 'Plans for teams of every size',",
      '}',
    ),
    extra: 'Export it from a `page` or `layout`; metadata only works in Server Components.',
  },
  {
    front: 'Generate metadata from fetched data',
    back: tsx(
      'export async function generateMetadata({ params }: Props): Promise<Metadata> {',
      '  const { slug } = await params',
      '  const post = await getPost(slug)',
      '  return { title: post.title }',
      '}',
    ),
    extra: 'Fetches shared with the page are deduplicated.',
  },
  {
    front: `What is the page title?\n${tsx('// app/layout.tsx', "title: { template: '%s | Acme', default: 'Acme' }", '', '// app/pricing/page.tsx', "title: 'Pricing'")}`,
    back: '`Pricing | Acme`; pages without a title fall back to `Acme`',
  },
  {
    front: 'Which special files generate metadata?',
    back: '`favicon.ico`, `icon.png`, `opengraph-image.png` (or `.tsx`), `sitemap.ts` and `robots.ts` in `app/`; Next.js adds the tags and routes',
  },
  {
    front: 'Redirect logged-out users with middleware',
    back: tsx(
      '// middleware.ts (proxy.ts in Next.js 16)',
      "import { NextResponse, type NextRequest } from 'next/server'",
      '',
      'export function middleware(request: NextRequest) {',
      "  if (!request.cookies.has('session')) {",
      "    return NextResponse.redirect(new URL('/login', request.url))",
      '  }',
      '}',
      '',
      "export const config = { matcher: ['/dashboard/:path*'] }",
    ),
    extra: 'Middleware runs before the route; returning nothing lets the request continue.',
  },
  {
    front: 'What happened to `middleware.ts` in Next.js 16?',
    back: 'It was renamed to `proxy.ts` with an exported `proxy` function that runs on the Node.js runtime; `middleware.ts` still works for the Edge runtime but is deprecated',
  },
  {
    front: 'Is middleware enough to protect private pages?',
    back: 'No. Treat it as an optimistic check and verify auth again next to the data: in Server Components, Server Actions and route handlers',
    extra: 'CVE-2025-29927 (March 2025) let a crafted header skip middleware entirely on unpatched versions.',
  },
  {
    front: 'What does `<Link>` from `next/link` add over `<a>`?',
    back: 'Client-side navigation without a full page reload, and in production it prefetches routes as their links enter the viewport',
  },
  {
    front: 'Where do you import `useRouter` from in the App Router?',
    back: '`next/navigation`, not `next/router` (that’s the Pages Router). `usePathname` and `useSearchParams` live there too; all are Client Component hooks',
  },
  {
    front: 'What is special about `redirect()`?',
    back: 'It throws a special error to stop rendering, so code after it never runs; call it outside `try`/`catch` blocks',
    extra: '`redirect` from `next/navigation` works in Server Components, Server Actions and route handlers.',
  },
  {
    front: 'Why might `useSearchParams()` break the production build?',
    back: 'On a statically rendered route, the Client Component calling it must be inside a `<Suspense>` boundary; otherwise the build fails with a missing Suspense boundary error',
  },
  {
    front: 'What does `next/image` do?',
    back: '`<Image>` resizes images on demand, serves modern formats like WebP (AVIF can be enabled), lazy-loads by default and reserves space to avoid layout shift',
    extra: 'Remote images need `width` and `height` (or `fill`) and an allowed host in `images.remotePatterns`.',
  },
  {
    front: 'How do you stream a slow part of a page?',
    back: 'Wrap the slow async component in `<Suspense fallback={…}>`: the rest of the page is sent at once and that part streams in when its data is ready',
  },
  {
    front: 'What is a folder named `@modal`?',
    back: 'A parallel route slot: its page renders alongside the main page and reaches the parent layout as a `modal` prop',
    extra: 'Combined with intercepting routes like `(.)photo/[id]`, it powers modals that keep a shareable URL.',
  },
]

export const NEXTJS: PublicDeck = {
  slug: 'nextjs-essentials',
  title: 'Next.js essentials: 50 cards on the App Router and caching',
  shortTitle: 'Next.js',
  category: 'web',
  level: 'intermediate',
  icon: 'code',
  description:
    'Next.js App Router basics: server vs client components, layouts, route handlers, server actions, caching, metadata, dynamic routes and middleware.',
  intro:
    'The App Router changed how Next.js apps are built, and its defaults have kept moving: fetch stopped being cached in Next.js 15, params became async, and Next.js 16 added Cache Components and renamed middleware to proxy. These cards cover the stable core, from server and client components to layouts, route handlers, Server Actions, revalidation and metadata, with version notes where behavior changed.',
  faq: [
    {
      q: 'Which Next.js version does this deck cover?',
      a: 'The App Router as of Next.js 15 and 16, with notes where they differ from Next.js 14, such as fetch caching defaults and async params.',
    },
    {
      q: 'Does it cover the Pages Router?',
      a: 'No. It focuses on the App Router, which is the recommended way to build new Next.js apps. getServerSideProps and other Pages Router APIs aren’t included.',
    },
    {
      q: 'Should I learn React first?',
      a: 'Yes. Next.js builds on React, so components, props, state and hooks should feel familiar. Our React deck covers those basics.',
    },
    {
      q: 'Is middleware still a thing in Next.js 16?',
      a: 'It was renamed to proxy and now runs on the Node.js runtime. The old middleware file still works for Edge use cases but is deprecated.',
    },
  ],
  cards: CARDS,
}
