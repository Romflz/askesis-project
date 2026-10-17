# AGENTS.md

Guidance for anyone, human or AI, working on this codebase: what the stack is, how the pieces fit, and the
conventions to keep. Read [README.md](README.md) first for what the product does.

## Stack

| Layer      | Choice                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo   | pnpm workspace; Node 24 pinned with `devEngines` (pnpm downloads it)                                                                    |
| Web        | TanStack Start (React 19, TanStack Router, SSR, server functions) on Nitro; TanStack Query; SCSS; motion; recharts; KaTeX; highlight.js |
| API        | Fastify; Better Auth (email/password, username plugin); web-push                                                                        |
| Data       | Postgres 18 via Drizzle ORM                                                                                                             |
| Shared     | `@askesis/core` (domain logic), `@askesis/contracts` (zod schemas and wire types), `@askesis/db` (schema)                               |
| Scheduling | SM-2 written from public documentation; FSRS through ts-fsrs                                                                            |

The API runs TypeScript directly with Node's type stripping (`node src/server.ts`), so it has no build step. Imports
use explicit `.ts`/`.tsx` extensions.

## Layout

```
apps/web/src/
  routes/            File-based routes. _authed/* requires a session; api/auth/$ proxies Better Auth
  server/            Server functions (*.functions.ts) and server-only helpers (*.server.ts)
  components/        askesis/ (dashboard, top bar, celebrations), study/, decks/, analytics/, docs/, practice/, settings/
  lib/               queries.ts (every query and the write hook), seo, sitemap, tags, sound effects, PWA helpers, search params
  content/           The AI card spec (/llms.txt), the make-a-deck prompt and the package conversion prompt
  styles/            SCSS: tokens, base, one partial per feature, registered in main.scss
apps/api/src/
  routes/            me (dashboard, reviews, rewards, settings, push), library (decks, cards, tags, import/export),
                     study (queue, preview, undo, bury), analytics
  collection.ts      Loads a user's Collection from Postgres; first-run setup; streak freezes
  library.ts         Deck tree helpers, import (merge/upsert), tag queries
  push.ts            The daily reminder job
packages/core/src/
  schedule.ts        SM-2 and FSRS answers, previews, retrievability
  time.ts            Study days (time zone + rollover hour)
  collection.ts      The Collection type every computation starts from
  dashboard.ts       buildDashboard(collection): due counts, streaks, XP, quests, chest, charts
  analytics.ts       buildAnalytics(collection, options)
  gamification.ts    XP, levels, trophies, quests, chests, lucky finds
  csv.ts             Delimited import/export (header lines, progress and history columns)
  demo.ts            A seeded simulation of a learner, used by the public home page
  library/           The public practice decks (one file per deck) and topics
packages/contracts/src/index.ts   Zod input schemas and response types shared by web and API
packages/db/src/schema/           Drizzle tables (auth.ts, askesis.ts)
```

## How it fits together

- **The browser only talks to the web app.** Pages call server functions, which call the API with `apiFetch`
  (`apps/web/src/server/api.server.ts`), forwarding the session cookie. The `.server.ts` suffix keeps that code out of
  the client bundle.
- **Server data goes through TanStack Query** (`apps/web/src/lib/queries.ts`). Route loaders fill the cache with
  `ensureQueryData` (on the server for the first request, sent along with the HTML), components read it with
  `useSuspenseQuery`, and writes use `useUserDataMutation`, which invalidates everything under `['me']` afterwards. Don't
  call `router.invalidate()` for data; it's only for the session in the router context (sign-in, username).
  The dashboard and a study session keep their own state on top of a snapshot, so their writes only mark other pages
  stale, and each visit to `/study/session` fetches a fresh queue.
- **Auth is same-origin.** `/api/auth/*` on the web app proxies to Better Auth on the API, so cookies belong to
  `WEB_ORIGIN`. Sign-in only works on that origin.
- **One source of truth for numbers.** The API loads a `Collection` (decks, cards with their memory state, review
  logs, rewards) and `@askesis/core` turns it into the dashboard or analytics. The web app never recomputes server
  numbers, except to preview an answer locally with the same scheduler, so button intervals always match.
- **Grading is authoritative on the API** (`POST /me/reviews`). The client updates its local state optimistically.
- **XP and coins** are derived from the review log (answers, daily goals) plus a `reward` ledger for things claimed by
  hand (chests, quests, lucky finds, the welcome bonus). A unique index on (user, day, kind, key) prevents double
  claims. Today's quests are saved in `daily_quest` the first time they're shown, so targets don't drift during the
  day.
- **Study days** follow the user's time zone and rollover hour (4 AM by default). Anything "today" (limits, streaks,
  quests, chests) uses `dayKey()` from `time.ts`, never the server's local date.
- **Public pages** (home, practice, learn, docs, analytics for visitors) are server-rendered and cached in memory for
  visitors without a session cookie (`server/page-cache.ts`, production only). The practice routes load deck data
  through server functions so the deck library never ships in the client bundle.
- **Reminders:** `push.ts` runs every two minutes and sends each subscribed user one notification per study day, only
  if something is due, at the hour they picked (6 AM by default) or when their study day resets.

## Commands

```sh
pnpm dev                 # web :3000 and API :4000 (API restarts on file changes)
pnpm typecheck           # all packages
pnpm lint                # ESLint
pnpm format              # Prettier (write); pnpm format:check to verify
pnpm build               # production build of the web app
pnpm db:up               # start Postgres in Docker
pnpm db:push             # local development: push the Drizzle schema to the database
pnpm db:generate         # after a schema change: write the migration (the API applies it on start)
pnpm db:migrate          # apply pending migrations by hand
pnpm --filter @askesis/api vapid       # generate Web Push keys
pnpm --filter @askesis/api supporter <email> <0-3>
pnpm --filter @askesis/web sitemap
```

## Conventions

- **TypeScript everywhere**, strict. Share types through `@askesis/contracts`; validate API input with its zod
  schemas.
- **Formatting is Prettier's job** (no semicolons, single quotes, 130 columns); run `pnpm format`. ESLint covers
  correctness and hooks rules.
- **Comments explain why, not what.** A short line before non-obvious logic, a doc comment on exported functions and
  types where the name isn't enough. No comments that restate the code.
- **Styles are SCSS, never Tailwind.** Colors and spacing come from the tokens in `styles/_tokens.scss`
  (`light-dark()` covers both themes). Each feature has its own partial, registered in `styles/main.scss`.
- **Copy** is plain and short: sentence case, no exclamation marks except in celebrations, no jargon in user-facing
  text.
- **Accessibility:** every interactive element is a real button or link with a label, charts have a table view,
  motion respects `prefers-reduced-motion`.
- **Layout:** grids that hold cards use `minmax(0, 1fr)` tracks so long names can't widen the page; check 390px wide
  and dark mode for every UI change.

## Database

- Local development uses `pnpm db:push`. If push wants to drop or truncate data (for example to add a unique
  constraint), don't force it: make the change additive with SQL instead.
- Production uses migrations: run `pnpm db:generate` with every schema change and commit the SQL. The API applies
  pending migrations when it starts (`packages/db/src/migrate.ts`), so a deploy migrates the database by itself.
- Every user-owned table references `user.id` with `on delete cascade`.
- A card has two keys: `id`, internal and unique everywhere, and `identifier`, its identity in exported and imported
  files, unique per user only (two accounts can share one). New cards get theirs from `newIdentifiers`
  (`apps/api/src/identifiers.ts`). Never expose `id` in files, and filter by user whenever you look up an identifier.

## Content

- Public decks live in `packages/core/src/library/`, one file per deck, registered in `library/index.ts`. Each deck
  has exactly 50 cards with unique fronts, a meta description of 160 characters or fewer, an intro and an FAQ.
- Card text supports LaTeX and fenced code; languages must be registered in
  `apps/web/src/components/askesis/CardText.tsx`.
- Docs pages are defined in `apps/web/src/components/docs/pages.tsx`. Keep each page's `headings` in sync with its
  `H2` ids; an optional `faq` is rendered and published as FAQ structured data.
- `/llms.txt` is generated from `apps/web/src/content/card-spec.ts`, and the make-a-deck prompt lives in
  `content/card-prompt.ts`; the CSV examples in both must parse with the real importer.

## Testing changes

- `pnpm typecheck`, `pnpm lint` and `pnpm format:check` must pass.
- Check UI changes in a browser at 1440px and 390px, in light and dark mode, with no console errors and no horizontal
  overflow.
- Test accounts use `e2e-…@example.test` emails and are deleted by exact email afterwards. Never touch other accounts.

## Gotchas

- Pass dates to Drizzle `sql` templates as ISO strings or through typed operators; raw `Date` objects break the
  postgres driver.
- Inline scripts written as template literals need doubled backslashes in regexes (`\\/`), or the generated script
  breaks.
- floating-ui positions popovers with an inline `transform`; animate `translate` and `scale` instead of `transform`.
- Values read from `localStorage` load after mount (see `useStoredState`), so server and client renders match.

## License

PolyForm Noncommercial 1.0.0 (see `LICENSE.md`). Contributions are accepted under the same license.
