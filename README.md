# Askesis

**Spaced repetition that plays like a game.** Askesis is a gamified flashcard app for the web with Anki-like
scheduling (or FSRS), decks and subdecks, Anki imports that keep your progress, a daily reminder when your cards are
ready, and a progression system that makes the daily habit stick: streaks, XP and levels, a daily chest, quests,
trophies and real analytics.

Version **1.0.0** · [License](#license) · Free for personal and community use · [Contributing](#contributing) · [Roadmap](ROADMAP.md)

---

## TL;DR

- **Proven scheduling.** Cards come back just before you'd forget them. Every deck uses a preset with the classic
  SM-2 timings (learning steps `1m 10m`, graduating interval 1 day, ease 250%, …) or FSRS with a desired retention.
- **Bring your decks.** Import CSV/TSV and Anki exports, merge into existing decks, and keep your progress and review
  history. `.apkg` files convert through a tested script (see [Import and export](#import-and-export)).
- **Never miss a day.** Install it as an app (PWA) and get one push notification a day (6 AM by default) when
  something is due.
- **Progress you can feel.** Every answer earns XP; streaks have freezes; a daily chest gets better with your streak;
  six daily quests; 36 trophies; an analytics page with forecasts, true retention and your toughest cards.
- **Free practice decks.** 96 public decks (4,800 cards) from Japanese, Spanish and Arabic to Java, Haskell, AWS and engineering,
  studyable without an account.
- **Self-hostable.** One web app, one API, one Postgres. No tracking, no ads.

## The board

The dashboard ("the board") is where each day starts:

| Panel                         | What it does                                                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Today**                     | Cards due now (new, learning, review), an estimate of the time it takes, and your daily goal ring.                                                         |
| **Streak**                    | Days in a row with at least one review, this week at a glance, and your banked streak freezes.                                                             |
| **Level**                     | Your rank (Spark → Engram) and progress to the next level.                                                                                                 |
| **Daily chest**               | Open once per study day for XP and coins. Better tiers with longer streaks; every 7th day in a row is a weekly chest (double rewards and a streak freeze). |
| **Daily quests**              | Six small goals a day, claimed by hand for XP and coins, with a bonus for clearing them all.                                                               |
| **Decks**                     | Every deck with today's new, learning and due counts, 30-day recall and mature share. Click one to open it.                                                |
| **Quick study**               | One click to a short session: up to 20 of today's cards, the ones you're closest to forgetting first.                                                      |
| **Insights, activity, stats** | Forecast, reviews per day, retention, a year-long heatmap, answer buttons, your collection and your best hour.                                             |
| **Trophies**                  | 36 milestones in four tiers, worked out from your review history, so they can't be lost.                                                                   |

The full-screen study session (`/study/session`) adds keyboard shortcuts, undo, bury, suspend, edit, combo
milestones, optional sounds and a summary at the end. `/analytics` goes deeper.

### The daily loop

1. Your **study day** rolls over at 4 AM in your time zone (configurable).
2. If you turned reminders on, you get **one notification** at 6 AM (or an hour you pick) when something is due.
3. You review. Each answer pays **XP** (multiplied by your streak, up to ×1.5) and can turn up a **lucky find**
   (a few coins, 1 answer in 25 on average).
4. You open the **daily chest** and claim finished **quests**.
5. Your **streak** grows; if you miss a day, a banked **freeze** covers it.

Grading stays honest: Hard, Good and Easy pay the same XP, so there's never a reason to press Easy on a card you
struggled with.

## Features

- **Study:** today's queue with per-deck limits, extra new cards, review ahead, forgotten cards, cram (no
  rescheduling), and custom study by tag: include tags (any or all), exclude tags, hierarchical `parent::child` tags.
- **Decks:** nested decks (`Parent::Child`), a card browser with search, filters and bulk actions, a card editor with
  live preview, and a tag tree (renaming or deleting a parent covers its children).
- **Cards:** plain text with LaTeX (`\( … \)`, `\[ … \]`, `$…$`, `$$…$$`, rendered by KaTeX) and fenced code blocks
  with syntax highlighting.
- **Gamification:** XP and ten ranks, streaks and freezes, daily chest, quests, coins, lucky finds, trophies,
  level-up and chest celebrations, optional sound effects.
- **Analytics:** future due, reviews over time, true retention by week, card counts, intervals, FSRS difficulty and
  recall, hourly and weekday patterns, answer buttons, cards added, a per-deck table and your toughest cards.
- **Reminders and PWA:** installable on desktop and phones; one daily Web Push reminder.
- **Practice and SEO:** `/practice` and `/learn/<topic>` serve free public decks with a no-account drill, JSON-LD
  (flashcard `Quiz` markup), `sitemap.xml` and `robots.txt`.
- **Make cards with AI:** a copy-paste prompt (in the import dialog and at `/docs/for-ai-agents`) has ChatGPT, Claude or
  Gemini write a deck you can import; `/llms.txt` is the exact spec for agents and scripts.
- **Accounts:** email and password, with unique usernames. Supporters get a badge.
- **Docs:** `/docs` explains studying, scheduling, workload, writing good cards, import and export, the daily chest,
  quests, levels and more.

## Setup

### Requirements

- **pnpm 12.** The repository pins pnpm 12.11.2 in `package.json` (`packageManager`). Install it with
  `curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=12.11.2 sh -` or see
  [pnpm.io/installation](https://pnpm.io/installation). Check with `pnpm --version`.
- **Node 24** comes with it: pnpm downloads the pinned Node 24.22.0 (`devEngines`), so there's nothing to install.
- **Docker** with Compose, for the local Postgres 18 database. Any Postgres 18 works too; point `DATABASE_URL` at it
  and skip `pnpm db:up`.

### First run

1. Get the code and install dependencies:

   ```sh
   git clone https://github.com/Romflz/askesis-project.git
   cd askesis-project
   pnpm install
   ```

2. Create your config by copying the example file to `.env` (it's git-ignored):

   ```sh
   cp .env.example .env
   ```

3. Set `BETTER_AUTH_SECRET` in `.env` to 32 or more random characters. The API won't start without it. To make one:

   ```sh
   openssl rand -base64 32
   ```

4. Start Postgres in Docker and create the tables:

   ```sh
   pnpm db:up      # Postgres 18 on localhost:5432, user/password/database "askesis"
   pnpm db:push    # applies the Drizzle schema
   ```

5. Start the app:

   ```sh
   pnpm dev        # web on http://localhost:3000, API on http://localhost:4000
   ```

Open http://localhost:3000 (sign-in only works on the `WEB_ORIGIN` address, so use `localhost`, not `127.0.0.1`). The
home page shows a sample learner's dashboard, and Quick study there opens a free practice deck. Register to get your
own dashboard at `/dashboard` (new accounts start with two starter decks). Settings → Sample data loads about eleven
months of simulated history into your account.

### Daily reminders (optional)

```sh
pnpm --filter @askesis/api vapid    # prints a key pair
```

Paste both keys into `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in `.env`, set `VAPID_SUBJECT` to a `mailto:` address,
and restart `pnpm dev`. Browsers allow push only over HTTPS, with `localhost` as the exception.

### Everyday commands

| Command                                      | What it does                                                       |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `pnpm dev`                                   | Web app and API with live reload.                                  |
| `pnpm db:up` / `pnpm db:down`                | Start or stop Postgres. Your data stays in a Docker volume.        |
| `pnpm db:push`                               | Apply schema changes after pulling new code.                       |
| `pnpm typecheck`, `pnpm lint`, `pnpm format` | Check types, lint, format the code.                                |
| `docker compose down -v`                     | Delete the local database completely (then `db:up` and `db:push`). |

### Troubleshooting

- **Port 5432 is already in use:** another Postgres is running. Stop it, or change the port in `docker-compose.yml` and
  `DATABASE_URL`.
- **The API exits with a `BETTER_AUTH_SECRET` error:** the secret is missing or shorter than 32 characters.
- **Signing in does nothing:** open the app at the exact `WEB_ORIGIN` address (`http://localhost:3000`).

### Configuration

Everything lives in one `.env` at the repository root (see `.env.example`):

| Variable                                                 | Purpose                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`                                           | Postgres connection string.                                                |
| `BETTER_AUTH_SECRET`                                     | Session signing secret, 32+ characters.                                    |
| `WEB_ORIGIN`                                             | Public origin of the web app; auth cookies are issued for it.              |
| `API_HOST`, `API_PORT`, `API_URL`                        | Where the API listens, and where the web app's server reaches it.          |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web Push reminders. Generate keys with `pnpm --filter @askesis/api vapid`. |
| `VITE_SITE_URL`                                          | Public origin for canonical URLs, Open Graph and the sitemap.              |
| `VITE_GITHUB_URL`, `VITE_PATREON_URL`                    | Links in the top bar and the support section.                              |

Restart both servers after changing `.env`.

## Self-hosting

```sh
pnpm install
pnpm build                              # builds apps/web/.output (Nitro)
pnpm start                              # applies pending migrations, then starts the API and the web app
```

Or run the two processes separately: `pnpm --filter @askesis/api start` (the API runs TypeScript natively, no build
step) and `pnpm --filter @askesis/web start`.

### Database changes and deploys

Production never uses `db:push`. Schema changes ship as migrations that are applied on deploy:

1. Change the schema in `packages/db/src/schema/` and try it locally with `pnpm db:push`.
2. Before you push, run `pnpm db:generate`. It writes the SQL for the change to `packages/db/migrations/`; commit it
   together with the schema change.
3. On deploy, the API's `start` runs the migrations first (`packages/db/src/migrate.ts`), so `pnpm start` and
   `pnpm --filter @askesis/api start` both bring the database up to date before serving:
   - only migrations the database hasn't run yet are applied (they're tracked in `drizzle.__drizzle_migrations`), so it's
     safe on every deploy;
   - a lock makes instances that start at the same time wait for each other;
   - if a migration fails, the API doesn't start, so new code never runs against an old schema.

If your platform has a release or post-deploy command instead, run `pnpm db:migrate` there.

### Production notes

- Push notifications and service workers need **HTTPS** outside localhost.
- Put a compressing reverse proxy (HTTP/2) in front of both processes.
- `pnpm --filter @askesis/web sitemap -- --site https://your.domain` writes a static `sitemap.xml`; `/sitemap.xml` is
  also served live.
- `pnpm --filter @askesis/api supporter <email> <0-3>` sets a supporter tier (1 Backer, 2 Insider, 3 Champion).

## Import and export

- **CSV/TSV** with optional header lines (`#separator`, `#html`, `#columns`, `#deck column`, `#tags column`); a
  plain-text (`.txt`) export uses the same lines.
- Decks are matched by full path, case-insensitively, and **merged**: importing never wipes a deck. A card with the
  same front in the same deck is updated (default), skipped, or imported as a duplicate.
- Exports include **study progress** and **review history** by default. Progress columns are `state, due, interval,
ease, stability, difficulty, step, reps, lapses, last_review, suspended`; `history` holds every past answer. On
  import, new cards stay new, existing cards only take newer progress, and history merges without duplicates, so a
  backup can be imported twice safely.
- **Anki imports:** a Notes in Plain Text export (`.txt`) imports directly (cloze notes become one card per
  deletion). `.apkg`/`.colpkg` packages convert through a copy-paste prompt for an AI assistant that runs a tested
  Python script, keeping progress and the review log.

The exact format, with tested examples, is at `/llms.txt`.

## Scheduling

- **SM-2 mode** (default) gives Anki-like timings. It's written from publicly documented behavior; no Anki code is
  used.
- **FSRS mode** (per preset) uses [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) with a desired
  retention.

New accounts get these defaults: learning steps `1m 10m`, graduating interval 1 day, easy interval 4 days,
relearning `10m`, 20 new and 200 reviews per day, starting ease 250%, easy bonus 130%, hard interval 120%.

## How it's built

A pnpm workspace with a server-rendered web app and a REST API on Postgres. See [AGENTS.md](AGENTS.md) for the full
architecture, conventions and commands.

```
apps/
  web/        TanStack Start (React 19, SSR, server functions), TanStack Query, SCSS, PWA
  api/        Fastify REST API, Better Auth, daily reminder job
packages/
  core/       Scheduling (SM-2 and FSRS), dashboard and analytics, gamification, CSV, public decks
  contracts/  Zod schemas and wire types shared by web and API
  db/         Drizzle schema (Postgres)
```

## Contributing

Askesis is a community project and contributions are welcome: bug reports, fixes, features, docs and new public decks.

- Open an issue to discuss bigger changes first.
- Keep pull requests focused, and run `pnpm typecheck`, `pnpm lint` and `pnpm format:check` before you push.
- New public decks need exactly 50 accurate cards (see `packages/core/src/library/`).

**AI-assisted contributions are welcome, as long as they make sense.** Use whatever tools help you, but you're
responsible for the result: read what you submit, test it, keep it consistent with the existing code, and make sure
you can explain every change. Pull requests that look generated without care (unrelated rewrites, invented APIs,
untested code) will be closed.

## License

Askesis is source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE.md).

- **You're free to** use it, clone it, fork it, change it, contribute to it, and **self-host it for yourself, your
  family, your school or your community.**
- **You may not** make money from it or use the code in a commercial product or service without a separate license.

Commercial licensing: [romflz@proton.me](mailto:romflz@proton.me). Honestly, for a flashcard app that's unlikely to
be needed; it's here to keep Askesis a community project.

## Contact

Questions, ideas or commercial licensing: **[romflz@proton.me](mailto:romflz@proton.me)**

## Acknowledgements

- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) and the
  [Open Spaced Repetition](https://github.com/open-spaced-repetition) community for FSRS.
