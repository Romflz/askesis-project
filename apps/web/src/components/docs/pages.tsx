import {
  BellRing,
  BookOpenText,
  Bot,
  Brain,
  CalendarClock,
  ChartLine,
  FileSpreadsheet,
  FolderTree,
  Gauge,
  Gift,
  Keyboard,
  ListFilter,
  type LucideIcon,
  PenLine,
  Scroll,
  Server,
  Sigma,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Kbd } from '../askesis/ui.tsx'
import { AgentSpec, CardPrompt, PackagePrompt } from './AgentSpec.tsx'
import { C, Callout, Code, DocLink, H2, Rating, Steps, Table } from './primitives.tsx'

export type DocSection = 'Basics' | 'Scheduling' | 'Your cards' | 'More'

export interface DocPage {
  slug: string
  title: string
  /** Shown under the title and on the docs home; also the meta description. */
  summary: string
  section: DocSection
  icon: LucideIcon
  /** In page order; ids match the H2 anchors in `body`. */
  headings: { id: string; label: string }[]
  /** A function, so a page's JSX is only built when it renders, not wherever DOCS is imported. */
  body: () => ReactNode
  /** Questions answered at the end of the page, also published as FAQ structured data. */
  faq?: { q: string; a: string }[]
}

export const SECTIONS: DocSection[] = ['Basics', 'Scheduling', 'Your cards', 'More']

// ── Getting started ───────────────────────────────────────────────────────────

const gettingStarted: DocPage = {
  slug: 'getting-started',
  title: 'Getting started',
  summary: 'What Askesis is, your first session, and a tour of the dashboard.',
  section: 'Basics',
  icon: BookOpenText,
  headings: [
    { id: 'what', label: 'What Askesis is' },
    { id: 'account', label: 'Your account' },
    { id: 'dashboard', label: 'The dashboard' },
    { id: 'sample', label: 'Try it with sample data' },
    { id: 'keys', label: 'Keyboard shortcuts' },
  ],
  body: () => (
    <>
      <H2 id="what">What Askesis is</H2>
      <p>
        Askesis is an open-source spaced repetition app. You review flashcards, grade how well you remembered each one, and
        Askesis schedules the next review for just before you would forget it. Scheduling follows the classic SM-2 timings, and
        you can switch any deck to FSRS.
      </p>
      <p>
        On top of that sit streaks, XP and levels, daily quests, trophies and analytics, so a daily review habit is easy to keep.
        New to spaced repetition? <DocLink slug="spaced-repetition">Spaced repetition, explained</DocLink> covers why it works in
        a few minutes.
      </p>
      <Callout tone="note" title="The home page is a demo">
        The public home page shows a simulated learner with about 11 months of history. You can answer cards there, but nothing is
        saved. Your own dashboard lives at <C>/dashboard</C> once you sign in.
      </Callout>

      <H2 id="account">Your account</H2>
      <p>Create an account with an email and password. Every new account starts with:</p>
      <ul>
        <li>
          Two starter decks: <strong>Askesis Basics</strong> (how spaced repetition and Askesis work) and{' '}
          <strong>World Capitals</strong>.
        </li>
        <li>
          A deck preset with the standard SM-2 defaults, so cards come back on a familiar schedule. See{' '}
          <DocLink slug="scheduling">How scheduling works</DocLink>.
        </li>
        <li>Your device’s time zone, so your study day and streak roll over at local time.</li>
      </ul>

      <H2 id="dashboard">The dashboard</H2>
      <Table
        head={['Panel', 'What it shows']}
        rows={[
          [
            'Today',
            'Cards due now, split into New (blue), Learning (orange) and Review (green), an estimated time, and your daily goal ring.',
          ],
          [
            'Quick study',
            'A short session of up to 20 of today’s cards, the ones you’re closest to forgetting first. Visitors pick a free practice deck instead.',
          ],
          ['Streak', 'Consecutive study days, this week at a glance, and your banked streak freezes.'],
          ['Level', 'Your rank and progress to the next level.'],
          ['Decks', 'Every deck with today’s New, Learn and Due counts, 30-day recall and the share of mature cards.'],
          [
            'Daily chest',
            'Open once a day for XP and coins; better chests with longer streaks, and a weekly chest for seven days in a row. Shows your coins.',
          ],
          ['Daily quests', 'Six small goals a day; claim each for XP and coins, all six for a bonus.'],
          ['Insights', 'Forecast of upcoming reviews, reviews per day, and true retention by week. Each chart has a table view.'],
          ['Activity', 'A year-long heatmap of reviews per day, with averages and streak stats.'],
          [
            'Answers, Collection, Sharpest hour',
            'How you grade, what your collection is made of, and the hour of day you recall best.',
          ],
          ['Trophies', 'Achievements, unlocked and in progress.'],
        ]}
      />
      <p>
        What each number means and how it’s worked out: <DocLink slug="stats">Reading your stats</DocLink>.
      </p>

      <H2 id="sample">Try it with sample data</H2>
      <p>
        To see every chart and trophy with real-looking numbers, open <strong>Settings → Sample data</strong> and load sample
        history. It replaces your collection with about 13,500 cards and 11 months of simulated reviews.
      </p>
      <Callout tone="warn">
        Loading sample data deletes your decks, cards and review history. Settings and presets are kept.
      </Callout>

      <H2 id="keys">Keyboard shortcuts</H2>
      <Table
        head={['Key', 'Action']}
        rows={[
          [
            <>
              <Kbd>Space</Kbd> or <Kbd>Enter</Kbd>
            </>,
            'Show the answer',
          ],
          [<Kbd>1</Kbd>, <Rating kind="again">Again</Rating>],
          [<Kbd>2</Kbd>, <Rating kind="hard">Hard</Rating>],
          [<Kbd>3</Kbd>, <Rating kind="good">Good</Rating>],
          [<Kbd>4</Kbd>, <Rating kind="easy">Easy</Rating>],
        ]}
      />
      <p>They work in every study session and in the practice drill on public deck pages.</p>
    </>
  ),
}

// ── Spaced repetition ─────────────────────────────────────────────────────────

const spacedRepetition: DocPage = {
  slug: 'spaced-repetition',
  title: 'Spaced repetition, explained',
  summary:
    'Why reviewing at growing intervals works, what your answers tell the scheduler, and how the retention target sets your workload.',
  section: 'Basics',
  icon: Brain,
  headings: [
    { id: 'forgetting', label: 'The forgetting curve' },
    { id: 'recall', label: 'Active recall' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'difficulty', label: 'Desirable difficulty' },
    { id: 'answers', label: 'What your answers mean' },
    { id: 'due-day', label: 'Why the due day matters' },
    { id: 'retention', label: 'Retention and workload' },
    { id: 'limits', label: 'What it won’t do' },
  ],
  body: () => (
    <>
      <p>
        Spaced repetition rests on a handful of findings from memory research that have held up for a long time. You don’t need
        them to use Askesis, but they explain why it asks you to study the way it does.
      </p>

      <H2 id="forgetting">The forgetting curve</H2>
      <p>
        In the 1880s Hermann Ebbinghaus learned lists of nonsense syllables and tested himself after different delays. He forgot
        fast at first and then more slowly: most of the loss came in the first day or two. Later studies found the same shape for
        all kinds of material.
      </p>
      <p>
        The useful part is what a review does. Each successful recall makes the memory more durable, so the next decline is
        slower. A card you remembered after 3 days may hold for 8 the next time, then 20, then a couple of months. That is the
        pattern in the intervals Askesis gives (
        <DocLink slug="scheduling" hash="example">
          an example
        </DocLink>
        ).
      </p>

      <H2 id="recall">Active recall</H2>
      <p>
        Pulling an answer out of memory strengthens it more than reading it again. This is the <em>testing effect</em> (or
        retrieval practice), one of the most consistently replicated results in learning research. Rereading feels productive
        because the material looks familiar, but recognizing something isn’t the same as recalling it.
      </p>
      <p>
        That’s why a card shows only its front at first. Produce the answer, in your head or out loud, before you reveal it.
        Flipping the card and nodding along loses most of the benefit.
      </p>
      <Callout tone="tip">Commit to an answer before you look. If you aren’t sure you knew it, you didn’t.</Callout>

      <H2 id="spacing">Spacing</H2>
      <p>
        The same number of reviews works better spread over days than packed into one sitting. This <em>spacing effect</em> is why
        cramming can get you through tomorrow’s test but fades soon after.
      </p>
      <p>
        Spaced repetition adds one idea: let the gaps grow as the memory gets stronger. A card you know well comes up a few times
        a year; a shaky one comes back tomorrow. Your time goes to the cards that need it, which is what keeps a large collection
        manageable.
      </p>

      <H2 id="difficulty">Desirable difficulty</H2>
      <p>
        Recall that takes some effort does more for memory than recall that’s effortless. The psychologist Robert Bjork called
        this a <em>desirable difficulty</em>. A review shortly before you would forget is harder than one an hour after learning,
        and it is worth more.
      </p>
      <p>
        So the scheduler doesn’t try to make every review easy. Aiming for about 90% recall means roughly one review in ten ends
        in Again. That is by design: a schedule where you never forget would have you reviewing far more often than you need to.
      </p>

      <H2 id="answers">What your answers mean</H2>
      <p>Your grade is all the scheduler learns from, so each button has a specific meaning:</p>
      <Table
        head={['Button', 'It tells Askesis', 'So the card']}
        rows={[
          [
            <Rating kind="again">Again</Rating>,
            'You couldn’t recall it, or recalled it wrong.',
            'Goes back to short (re)learning steps. A forgotten review card is a lapse, and its intervals restart small.',
          ],
          [<Rating kind="hard">Hard</Rating>, 'You got it, but it was a struggle.', 'Grows more slowly than with Good.'],
          [
            <Rating kind="good">Good</Rating>,
            'You recalled it after a normal moment of thought.',
            'Grows at the normal rate. Most of your answers should be Good.',
          ],
          [
            <Rating kind="easy">Easy</Rating>,
            'It was instant and effortless.',
            'Jumps further ahead. Pressed too often, intervals outrun your memory.',
          ],
        ]}
      />
      <p>
        Hard is a pass, not a fail: if you recalled it, even slowly, choose Hard or Good. Hard, Good and Easy earn the same XP (
        <DocLink slug="gamification" hash="xp">
          XP
        </DocLink>
        ), so there is nothing to gain by grading up. The exact rules are in{' '}
        <DocLink slug="scheduling">How scheduling works</DocLink>.
      </p>

      <H2 id="due-day">Why the due day matters</H2>
      <p>
        A card’s due date is the scheduler’s estimate of when your chance of recalling it drops to about the target. Reviewing
        around that day gets you the most memory for your time:
      </p>
      <ul>
        <li>
          <strong>Too early</strong>: the memory is still strong, so the review is easy and does little. It costs time and earns
          less.
        </li>
        <li>
          <strong>Too late</strong>: the chance that you’ve forgotten keeps rising. A forgotten review card goes back to
          relearning with a short interval, so a lapse costs more than one extra review.
        </li>
        <li>
          <strong>On time</strong>: hard enough to count, likely enough to succeed.
        </li>
      </ul>
      <p>
        A few days late isn’t a disaster. When you still remember an overdue card, Askesis counts the extra time in your favor:
        with the default scheduler, Good adds half the delay to the next interval and Easy adds all of it. The real cost of
        skipped days is the pile that builds up, which is why a short daily session beats a long weekly one. See{' '}
        <DocLink slug="workload" hash="backlog">
          Handling a backlog
        </DocLink>
        .
      </p>

      <H2 id="retention">Retention and workload</H2>
      <p>
        The share of cards you aim to remember sets how much you review. Aim higher and cards come back sooner, so you do more
        reviews to forget less, and the returns shrink near the top. With FSRS’s default parameters, a card that comes back in 30
        days at 90% comes back in about 12 days at 95%: well over twice the reviews to halve the forgetting.
      </p>
      <p>
        The default scheduler has no target to set; you steer it with its ease and interval options. The retention charts in
        Askesis compare against 90%, a common goal. With FSRS you choose the target yourself, as <em>desired retention</em>. How
        to pick one:{' '}
        <DocLink slug="workload" hash="fsrs">
          FSRS and desired retention
        </DocLink>
        .
      </p>

      <H2 id="limits">What it won’t do</H2>
      <ul>
        <li>
          <strong>It won’t make sense of things for you.</strong> Understand a topic first, then make cards for what you want to
          keep. Memorizing what you don’t understand is slow and fragile.
        </li>
        <li>
          <strong>It can’t fix a bad card.</strong> A vague or overloaded card stays hard however it’s scheduled. See{' '}
          <DocLink slug="writing-cards">Writing good cards</DocLink>.
        </li>
        <li>
          <strong>It needs regular, short sessions.</strong> A few minutes most days works far better than an hour once a week.
        </li>
      </ul>
    </>
  ),
}

// ── Studying ──────────────────────────────────────────────────────────────────

const studying: DocPage = {
  slug: 'studying',
  title: 'Studying & the four buttons',
  summary: 'What each answer does, how a card moves from new to mature, and the study modes.',
  section: 'Basics',
  icon: Keyboard,
  headings: [
    { id: 'buttons', label: 'The four buttons' },
    { id: 'lifecycle', label: 'A card’s life' },
    { id: 'limits', label: 'Daily limits' },
    { id: 'leeches', label: 'Leeches' },
    { id: 'study-page', label: 'The study page' },
    { id: 'session', label: 'During a session' },
  ],
  body: () => (
    <>
      <H2 id="buttons">The four buttons</H2>
      <p>After you reveal the answer, grade how well you remembered it. Each button shows when the card would come back.</p>
      <Table
        head={['Button', 'Press it when', 'What happens']}
        rows={[
          [
            <Rating kind="again">Again</Rating>,
            'You forgot, or got it wrong.',
            'The card goes back to its first (re)learning step, usually a few minutes.',
          ],
          [<Rating kind="hard">Hard</Rating>, 'You got it, but only with real effort.', 'A shorter step or interval than Good.'],
          [
            <Rating kind="good">Good</Rating>,
            'You remembered after a moment. The normal answer.',
            'The next step, or a longer interval.',
          ],
          [<Rating kind="easy">Easy</Rating>, 'The answer came instantly.', 'The card skips ahead with an even longer interval.'],
        ]}
      />
      <Callout tone="tip" title="Grade honestly">
        Hard, Good and Easy earn the same XP, so there’s nothing to gain by pressing Easy when it wasn’t. Honest answers give the
        scheduler the best data.
      </Callout>

      <H2 id="lifecycle">A card’s life</H2>
      <Table
        head={['Stage', 'Meaning']}
        rows={[
          [<strong>New</strong>, 'Never studied. Introduced up to your daily new-card limit.'],
          [
            <strong>Learning</strong>,
            <>
              Going through same-day <em>learning steps</em> (by default <C>1m 10m</C>).
            </>,
          ],
          [<strong>Young</strong>, 'Graduated to day-long intervals, under 21 days.'],
          [<strong>Mature</strong>, 'An interval of 21 days or more. These are memories that stick.'],
          [
            <strong>Relearning</strong>,
            <>
              A review card you forgot. It goes through <em>relearning steps</em> (by default <C>10m</C>) and comes back with a
              shorter interval.
            </>,
          ],
        ]}
      />

      <H2 id="limits">Daily limits</H2>
      <p>
        Each deck preset sets how many new cards are introduced per day (default 20) and the maximum number of reviews per day
        (default 200). Learning cards are always shown, since skipping a step would break it. Limits reset when your study day
        rolls over (4 AM by default). Choosing limits you can keep up with:{' '}
        <DocLink slug="workload">Managing your workload</DocLink>.
      </p>

      <H2 id="leeches">Leeches</H2>
      <p>
        A card you keep forgetting is a <em>leech</em>. When a card reaches the preset’s leech threshold (default 8 lapses) it
        gets the <C>leech</C> tag, and again every half-threshold after that. If the preset’s leech action is{' '}
        <strong>Suspend</strong>, it is also taken out of reviews until you unsuspend it. Leeches usually need rewriting, not more
        reviews:{' '}
        <DocLink slug="workload" hash="leeches">
          what to do about them
        </DocLink>
        .
      </p>

      <H2 id="study-page">The study page</H2>
      <p>
        The study page lets you choose exactly what to study: pick decks (a parent deck includes its subdecks), then start today’s
        cards or open Custom study for another mode, tags and a card count.
      </p>
      <Table
        head={['Mode', 'What it studies', 'Changes scheduling?']}
        rows={[
          ['Today’s cards', 'Today’s queue: learning cards, due reviews and new cards within daily limits.', 'Yes'],
          ['Quick study', 'Up to 20 of today’s cards, the ones you’re closest to forgetting first.', 'Yes'],
          ['Extra new cards', 'New cards beyond today’s limit.', 'Yes'],
          ['Review ahead', 'Review cards due in the next few days.', 'Yes'],
          ['Forgotten cards', 'Cards you pressed Again on in the last few days.', 'Yes'],
          ['Cram', 'Any cards from your selection, for a quick refresher.', 'No, answers are not saved'],
        ]}
      />
      <p>
        You can also set the order (mixed: learning cards first, then reviews and new cards together; by due date; or random) and
        how many cards to include. Every option, the tag filter and session links are covered in{' '}
        <DocLink slug="custom-study">Custom study & tags</DocLink>.
      </p>

      <H2 id="session">During a session</H2>
      <ul>
        <li>
          <strong>Undo</strong> (<Kbd>Z</Kbd>) takes back your last answer and restores the card exactly as it was.
        </li>
        <li>
          <strong>Later</strong> (<Kbd>L</Kbd>) moves a card to the end of this session without changing its schedule.
        </li>
        <li>
          <strong>Edit</strong> (<Kbd>E</Kbd>) fixes a typo without leaving the session.
        </li>
        <li>
          <strong>Bury</strong> (<Kbd>B</Kbd>) hides a card until tomorrow.
        </li>
        <li>
          <strong>Suspend</strong> (<Kbd>S</Kbd>) hides a card until you unsuspend it on the Decks page.
        </li>
      </ul>
      <p>
        Cards you answer Again come back later in the same session once their step is due. If nothing else is left, cards due
        within your learn-ahead limit (default 20 minutes) are shown early.
      </p>
    </>
  ),
}

// ── Custom study ──────────────────────────────────────────────────────────────

const customStudy: DocPage = {
  slug: 'custom-study',
  title: 'Custom study & tags',
  summary:
    'Study exactly what you want: pick decks, then open Custom study for a mode, tags and a card count. Links can be bookmarked.',
  section: 'Basics',
  icon: ListFilter,
  headings: [
    { id: 'page', label: 'The study page' },
    { id: 'decks', label: 'Choosing decks' },
    { id: 'modes', label: 'Study modes' },
    { id: 'tags', label: 'Filtering by tags' },
    { id: 'preview', label: 'The live preview' },
    { id: 'links', label: 'Session links' },
    { id: 'session', label: 'During a session' },
  ],
  body: () => (
    <>
      <H2 id="page">The study page</H2>
      <p>
        Go to <C>/study</C> to set up a session. Three quick starts sit at the top:
      </p>
      <Table
        head={['Button', 'What it starts']}
        rows={[
          ['All due today', 'Today’s cards from every deck, ignoring the deck choices below.'],
          ['10 extra new cards', 'Ten new cards beyond today’s limit, from your selection below.'],
          ['Quick cram', '25 random cards from your selection, practice only.'],
        ]}
      />
      <p>
        Below them, tick the decks to study. <strong>Start studying</strong> runs today’s cards for them, and{' '}
        <strong>Custom study</strong> opens a popup with every other way to study them: a mode, tags to include or leave out, how
        many cards and in what order. Askesis remembers your choices on this device.
      </p>

      <H2 id="decks">Choosing decks</H2>
      <ul>
        <li>Tick a deck to include it. A parent deck always includes its subdecks, so ticking it ticks the branch.</li>
        <li>Untick one subdeck and its parent shows a dash: only part of the branch is selected.</li>
        <li>
          <strong>All decks</strong> selects everything, including decks you add later.
        </li>
        <li>Each row shows today’s New, Learn and Due counts, with its subdecks added in.</li>
        <li>The play button on a row starts today’s cards for just that deck and its subdecks.</li>
      </ul>

      <H2 id="modes">Study modes</H2>
      <p>The Custom study popup lists every mode, each with the number of cards it would give right now.</p>
      <Table
        head={['Mode', 'What it studies', 'Options', 'Reschedules?']}
        rows={[
          [
            'Today’s cards',
            'Learning cards, due reviews and new cards, within each deck’s daily limits. The normal session.',
            'Order',
            'Yes',
          ],
          [
            'Quick study',
            'Today’s cards you’re closest to forgetting: learning steps that are up, then due reviews from the lowest chance of recall, then new cards if there’s room. The dashboard’s Quick study button starts 20.',
            'Up to N cards',
            'Yes',
          ],
          [
            'Extra new cards',
            'New cards beyond today’s limit, in each deck’s new-card order.',
            'Up to N cards (10, 25, 50, 100 or any number)',
            'Yes',
          ],
          [
            'Review ahead',
            'Review cards that come due in the next few days.',
            'Due in the next N days (default 3), up to N cards',
            'Yes',
          ],
          [
            'Forgotten cards',
            'Cards you pressed Again on recently, whatever their state now.',
            'Forgotten in the last N days (default 7), up to N cards',
            'Yes',
          ],
          ['Cram', 'Any cards in your selection, new or not.', 'Up to N cards', 'No, practice only'],
        ]}
      />
      <p>
        <strong>Order</strong> is Mixed (learning cards first, then reviews with new cards spread among them), Due date, or
        Random. In Today’s cards, learning cards always come first; Quick study has its own order, most at risk first. Suspended
        and buried cards are left out of every mode.
      </p>
      <ul>
        <li>Answers in every mode except Cram are saved and reschedule the card, just like a normal session.</li>
        <li>
          Extra new cards count toward today’s new-card limit, so do your regular session first, or you’ll only be taking today’s
          new cards early.
        </li>
        <li>Cram answers aren’t saved: they don’t change when cards come back, and earn no XP.</li>
      </ul>
      <p>
        When extra study is worth it, and when it isn’t:{' '}
        <DocLink slug="workload" hash="extra">
          Studying extra
        </DocLink>
        .
      </p>

      <H2 id="tags">Filtering by tags</H2>
      <p>
        The tag filter, in the Custom study popup, narrows the selected decks to cards with certain tags. Leave it empty to study
        every card in them.
      </p>
      <ul>
        <li>
          <strong>Include</strong> a tag (its <strong>+</strong> button) to study only cards that have it.
        </li>
        <li>
          <strong>Exclude</strong> a tag (its <strong>−</strong> button) to leave out every card that has it, even cards that
          match an included tag.
        </li>
        <li>Clicking a tag’s name cycles it: include, exclude, off.</li>
      </ul>
      <Table
        head={['Setting', 'Studies']}
        rows={[
          [<strong>Any of them</strong>, 'Default. Cards with at least one of the included tags.'],
          [<strong>All of them</strong>, 'Only cards that have every included tag. Available once you include two or more.'],
          [<strong>Excluded tags</strong>, 'Cards with any excluded tag are always left out.'],
        ]}
      />
      <p>
        <strong>A tag covers the tags below it.</strong> Tags nest with <C>::</C>, so including <C>lpic1</C> also matches{' '}
        <C>lpic1::chapter::01</C> and everything else under <C>lpic1</C>. Excluding works the same way. Matching ignores upper and
        lower case.
      </p>
      <p>To find tags:</p>
      <ul>
        <li>
          <strong>Most used</strong> shows your ten most common tags. Click once to include, again to exclude. Right-click or
          Shift-click excludes straight away.
        </li>
        <li>
          <strong>Search</strong> filters as you type. Several words must all appear, and the best matches come first: the exact
          tag, then a level with that name, then levels starting with it.
        </li>
        <li>
          <strong>All tags</strong> is a tree. Expand a tag to see the ones below it; each shows how many cards it covers.
        </li>
      </ul>
      <p>
        Your picks are listed at the bottom of the popup, under Selected tags, with a sentence that spells out the filter, for
        example “Cards tagged <strong>verbs</strong> or <strong>nouns</strong>, without <strong>leech</strong>. 120 cards match in
        the selected decks.”
      </p>
      <Callout tone="tip">
        Include <C>leech</C> and pick Cram to go over your hardest cards without touching their schedule.
      </Callout>

      <H2 id="preview">The live preview</H2>
      <p>
        The Today panel on the study page counts today’s cards for the selected decks. In the Custom study popup, each mode shows
        how many cards it would give, and the footer counts the session your choices make, updating as you change them:
      </p>
      <ul>
        <li>The number of cards, split into new, learning and review.</li>
        <li>A time estimate, at about 8 seconds per review or learning card and 20 seconds per new card.</li>
        <li>If no card in the selected decks has your tags, it says so and Start custom study stays disabled.</li>
      </ul>

      <H2 id="links">Session links</H2>
      <p>
        Every session has its own address. Start one from the study page and the address bar holds the link: bookmark it to repeat
        that exact session. Every parameter is optional, and values that don’t make sense fall back to the defaults.
      </p>
      <Code code="/study/session?decks=<id,id>&tags=a,b&match=all&xtags=c&mode=cram&order=random&limit=50" />
      <Table
        head={['Parameter', 'Values', 'Default']}
        rows={[
          [<C>decks</C>, 'Deck ids, separated by commas. Subdecks are included.', 'All decks'],
          [<C>tags</C>, 'Tags to include, separated by commas (up to 20).', 'None'],
          [
            <C>match</C>,
            <>
              <C>any</C> or <C>all</C>: how included tags combine.
            </>,
            <C>any</C>,
          ],
          [<C>xtags</C>, 'Tags to exclude, separated by commas (up to 20).', 'None'],
          [
            <C>mode</C>,
            <>
              <C>scheduled</C> (Today’s cards), <C>new</C>, <C>ahead</C>, <C>forgotten</C> or <C>cram</C>
            </>,
            <C>scheduled</C>,
          ],
          [
            <C>order</C>,
            <>
              <C>mixed</C>, <C>due</C> or <C>random</C>
            </>,
            <C>mixed</C>,
          ],
          [<C>limit</C>, '1–1000 cards. Today’s cards ignores it and uses the daily limits.', '100'],
          [<C>ahead</C>, 'Days to look ahead in review-ahead mode, 1–365.', '3'],
          [<C>forgotten</C>, 'Days to look back in forgotten mode, 1–365.', '7'],
        ]}
      />

      <H2 id="session">During a session</H2>
      <Table
        head={['Key', 'Action']}
        rows={[
          [
            <>
              <Kbd>Space</Kbd> or <Kbd>Enter</Kbd>
            </>,
            'Show the answer; once it’s shown, answer Good',
          ],
          [
            <>
              <Kbd>1</Kbd> <Kbd>2</Kbd> <Kbd>3</Kbd> <Kbd>4</Kbd>
            </>,
            <>
              <Rating kind="again">Again</Rating> <Rating kind="hard">Hard</Rating> <Rating kind="good">Good</Rating>{' '}
              <Rating kind="easy">Easy</Rating>
            </>,
          ],
          [
            <>
              <Kbd>Z</Kbd> or <Kbd>⌘/Ctrl Z</Kbd>
            </>,
            'Undo your last answer',
          ],
          [<Kbd>L</Kbd>, 'Later: move the card to the end of this session'],
          [<Kbd>E</Kbd>, 'Edit the card'],
          [<Kbd>B</Kbd>, 'Bury: hide the card until tomorrow'],
          [<Kbd>S</Kbd>, 'Suspend: hide the card until you unsuspend it in Decks'],
          [<Kbd>?</Kbd>, 'Show all shortcuts'],
          [<Kbd>Esc</Kbd>, 'Close a panel, or end the session'],
        ]}
      />
      <p>
        Undo restores the card exactly as it was before your answer. Later doesn’t touch the card’s schedule; it only moves it to
        the back of the queue. On small screens the same actions are compact buttons by the card. Session preferences (text size,
        alignment, interval previews, timer, focus mode and more) are saved on this device. Which of Later, Bury and Suspend to
        use:{' '}
        <DocLink slug="workload" hash="bury-suspend">
          Bury, suspend or later
        </DocLink>
        .
      </p>
    </>
  ),
}

// ── Scheduling ────────────────────────────────────────────────────────────────

const scheduling: DocPage = {
  slug: 'scheduling',
  title: 'How scheduling works',
  summary: 'Deck presets, the default timings, the SM-2 rules in plain words, and FSRS.',
  section: 'Scheduling',
  icon: CalendarClock,
  headings: [
    { id: 'presets', label: 'Deck presets' },
    { id: 'defaults', label: 'The defaults' },
    { id: 'new-cards', label: 'New and learning cards' },
    { id: 'reviews', label: 'Review cards' },
    { id: 'lapses', label: 'Lapses' },
    { id: 'example', label: 'An example' },
    { id: 'fsrs', label: 'FSRS' },
    { id: 'day', label: 'Your study day' },
  ],
  body: () => (
    <>
      <Callout tone="note">
        The default scheduler in Askesis follows the classic SM-2 timings, written from publicly documented behavior; no code from
        other apps is used. FSRS comes from the open-source{' '}
        <a href="https://github.com/open-spaced-repetition/ts-fsrs" target="_blank" rel="noreferrer">
          ts-fsrs
        </a>{' '}
        library.
      </Callout>

      <H2 id="presets">Deck presets</H2>
      <p>
        A preset is a set of scheduling options shared by any number of decks. Edit them in{' '}
        <strong>Settings → Deck presets</strong>. Each deck picks its own preset; subdecks don’t inherit their parent’s. A live
        preview next to the form shows exactly when cards would come back with your settings.
      </p>

      <H2 id="defaults">The defaults</H2>
      <p>New accounts get a preset with these standard values:</p>
      <Table
        head={['Option', 'Default', 'What it does']}
        rows={[
          ['New cards per day', '20', 'New cards introduced per deck each day.'],
          ['Maximum reviews per day', '200', 'Cap on review cards per deck each day.'],
          ['Learning steps', <C>1m 10m</C>, 'Same-day delays a new card goes through.'],
          ['Graduating interval', '1 day', 'First interval after the last learning step.'],
          ['Easy interval', '4 days', 'Interval when you press Easy on a new or learning card.'],
          ['Relearning steps', <C>10m</C>, 'Delays after you forget a review card.'],
          ['Minimum interval', '1 day', 'Shortest interval a forgotten card can get.'],
          ['Leech threshold / action', '8 lapses / tag', 'When a card counts as a leech, and what happens.'],
          ['Maximum interval', '36,500 days', 'No card is scheduled further out than this.'],
          ['Starting ease', '250%', 'How fast a new card’s intervals grow.'],
          ['Easy bonus', '130%', 'Extra multiplier for Easy.'],
          ['Hard interval', '120%', 'Multiplier for Hard.'],
          ['Interval modifier', '100%', 'Scales every review interval.'],
          ['New interval', '0%', 'Share of the old interval a forgotten card keeps.'],
          ['FSRS', 'Off', 'Switch to the FSRS model (see below).'],
          ['Desired retention', '90%', 'FSRS only: the recall chance to aim for.'],
        ]}
      />

      <H2 id="new-cards">New and learning cards</H2>
      <ul>
        <li>
          <Rating kind="good">Good</Rating> moves to the next learning step. After the last step the card graduates with the{' '}
          <em>graduating interval</em>.
        </li>
        <li>
          <Rating kind="easy">Easy</Rating> graduates right away with the <em>easy interval</em>.
        </li>
        <li>
          <Rating kind="hard">Hard</Rating> repeats the current step. On the first step the delay is the average of the first two
          steps (or 1.5× the step if there is only one).
        </li>
        <li>
          <Rating kind="again">Again</Rating> goes back to the first step.
        </li>
      </ul>

      <H2 id="reviews">Review cards</H2>
      <p>Each review card has an interval (days) and an ease (starting at 250%). “Days late” is how overdue the card was.</p>
      <Table
        head={['Answer', 'Next interval', 'Ease']}
        rows={[
          [<Rating kind="hard">Hard</Rating>, 'interval × hard interval × modifier, at least 1 day longer', '−15%'],
          [<Rating kind="good">Good</Rating>, '(interval + days late ÷ 2) × ease × modifier, at least Hard + 1', 'unchanged'],
          [<Rating kind="easy">Easy</Rating>, '(interval + days late) × ease × easy bonus × modifier, at least Good + 1', '+15%'],
        ]}
      />
      <p>
        Intervals are capped at the maximum interval. When a review is actually scheduled (not in previews), intervals of 3 days
        or more get a small random spread, so cards learned together don’t stay bunched up.
      </p>

      <H2 id="lapses">Lapses</H2>
      <p>
        <Rating kind="again">Again</Rating> on a review card is a lapse. The ease drops by 20% (never below 130%), and the new
        interval is the old one × <em>new interval</em> (0% by default, so it falls to the minimum interval of 1 day). The card
        then goes through the relearning steps before it is a review card again.
      </p>

      <H2 id="example">An example</H2>
      <p>With the defaults, a new card answered Good every time comes back after:</p>
      <Code code="10m → 1d → 3d → 8d → 20d → 1.7mo → 4.2mo" />
      <p>A card last reviewed 30 days ago comes back in 36 days on Hard, 75 on Good and 98 on Easy.</p>

      <H2 id="fsrs">FSRS</H2>
      <p>
        FSRS (Free Spaced Repetition Scheduler) predicts when you will forget each card from its review history, instead of using
        fixed multipliers. Turn it on per preset. It uses:
      </p>
      <ul>
        <li>
          <strong>Desired retention</strong> (70–99%, default 90%): the chance of recall you aim for when a card comes due. Higher
          means more reviews.
        </li>
        <li>Your learning and relearning steps, and the maximum interval.</li>
      </ul>
      <p>
        With FSRS on, ease, easy bonus, hard interval, interval modifier, new interval and the graduating and easy intervals don’t
        apply. Cards scheduled before you switched get a starting memory state from their current interval.
      </p>

      <H2 id="day">Your study day</H2>
      <ul>
        <li>
          <strong>Next day starts at</strong> (default 4 AM): reviews before this hour count toward the previous day. Limits,
          quests and streaks reset here.
        </li>
        <li>
          <strong>Time zone</strong>: set from your device when you sign up. Change it in Settings → Study.
        </li>
        <li>
          <strong>Learn ahead limit</strong> (default 20 minutes): when nothing else is due, learning cards due this soon are
          shown early.
        </li>
      </ul>
      <Callout tone="tip">
        Grading happens on the server, so every device schedules the same way. The answer buttons preview the same rules, so the
        times on them match what you get.
      </Callout>
    </>
  ),
}

// ── Workload ──────────────────────────────────────────────────────────────────

const workload: DocPage = {
  slug: 'workload',
  title: 'Managing your workload',
  summary:
    'Daily limits, how new cards turn into reviews, catching up on a backlog, leeches, bury and suspend, and picking a retention target.',
  section: 'Scheduling',
  icon: Gauge,
  headings: [
    { id: 'limits', label: 'Daily limits' },
    { id: 'new-cards', label: 'New cards become reviews' },
    { id: 'backlog', label: 'Handling a backlog' },
    { id: 'leeches', label: 'Leeches' },
    { id: 'bury-suspend', label: 'Bury, suspend or later' },
    { id: 'extra', label: 'Studying extra' },
    { id: 'fsrs', label: 'FSRS and desired retention' },
  ],
  body: () => (
    <>
      <H2 id="limits">Daily limits</H2>
      <p>
        Every deck preset has two daily limits, under <strong>Settings → Deck presets → Daily limits</strong>:
      </p>
      <Table
        head={['Limit', 'Default', 'What it caps']}
        rows={[
          ['New cards per day', '20', 'New cards introduced in each deck per study day (0 to 9,999).'],
          ['Maximum reviews per day', '200', 'Review cards shown in each deck per study day (0 to 99,999).'],
        ]}
      />
      <ul>
        <li>
          Limits apply to <strong>each deck on its own</strong>, subdecks included. A parent with three subdecks on a 20-new-card
          preset can introduce 20 new cards in each of them, plus any in the parent itself.
        </li>
        <li>Learning and relearning cards are never capped, since skipping a step would break it.</li>
        <li>
          Limits reset when your study day rolls over (4 AM by default, see{' '}
          <DocLink slug="scheduling" hash="day">
            Your study day
          </DocLink>
          ).
        </li>
        <li>Reviews past the limit aren’t lost. They stay due and come up on the next days, most overdue first.</li>
        <li>
          To give one deck different limits, create another preset and choose it for that deck in{' '}
          <strong>Settings → Decks</strong>.
        </li>
      </ul>

      <H2 id="new-cards">New cards become reviews</H2>
      <p>
        New cards are where your future workload comes from. Each card you learn today comes back tomorrow, then in a few days,
        then less and less often, for as long as you keep it. The reviews you do today mostly come from the new cards of the past
        weeks.
      </p>
      <p>
        A common rule of thumb: once things settle, after a month or two, you do about{' '}
        <strong>10 reviews a day for every new card a day</strong>. With the default 20 new cards a day, expect around 200 reviews
        a day. Hard material pushes that up; easy material pulls it down.
      </p>
      <Table
        head={['New cards per day', 'Reviews per day, roughly', 'Time per day, roughly']}
        rows={[
          ['5', '50', '10 minutes'],
          ['10', '100', '15–20 minutes'],
          ['20', '200', '35 minutes'],
          ['30', '300', '50 minutes'],
        ]}
      />
      <p>
        Times assume about 8 seconds per review and 20 per new card, the same estimate the study page uses. The dashboard’s
        estimate switches to your own average pace once you have some history.
      </p>
      <Callout tone="tip" title="Pick a limit you can keep">
        Choose a new-card limit you could manage on a busy day, not on your best one. Raising it later is easy; the reviews from a
        burst of new cards keep coming for weeks.
      </Callout>
      <p>
        The <strong>Forecast</strong> tab on the dashboard shows the reviews already scheduled for the next 30 days, so you can
        see a wave coming (
        <DocLink slug="stats" hash="insights">
          Reading your stats
        </DocLink>
        ).
      </p>

      <H2 id="backlog">Handling a backlog</H2>
      <p>Missed a few days, or a few weeks? The reviews waited for you. To catch up without burning out:</p>
      <Steps>
        <li>
          <strong>Pause new cards.</strong> Set New cards per day to 0 in the deck’s preset until the pile is gone. New cards only
          add to it.
        </li>
        <li>
          <strong>Do a fixed amount each day.</strong> Lower Maximum reviews per day, or stop after a set time. Askesis shows the
          most overdue cards first.
        </li>
        <li>
          <strong>Grade honestly.</strong> Press Again on what you forgot. Overdue cards you still remember get credit for the
          extra time, so they jump further ahead.
        </li>
        <li>
          <strong>Bring new cards back gradually</strong> once your daily due count is back to normal.
        </li>
      </Steps>
      <p>
        Any day with at least one review keeps your streak alive, and a banked streak freeze covers a missed day (
        <DocLink slug="gamification" hash="streaks">
          Streaks and freezes
        </DocLink>
        ).
      </p>

      <H2 id="leeches">Leeches</H2>
      <p>
        A leech is a card you keep forgetting. Askesis counts lapses (Again on a review card; misses on new and learning cards
        don’t count) and handles leeches like this:
      </p>
      <ul>
        <li>
          When a card reaches the preset’s <strong>leech threshold</strong> (default 8 lapses), it gets the <C>leech</C> tag and
          the session shows a “Leech” notice.
        </li>
        <li>It’s flagged again every half-threshold after that: with the default, at 12, 16, 20 lapses and so on.</li>
        <li>
          If the preset’s <strong>leech action</strong> is <em>Suspend card</em>, it is also suspended. With <em>Tag only</em>{' '}
          (the default) it stays in your reviews.
        </li>
      </ul>
      <p>
        Find them with the <strong>leech</strong> filter in the card browser. A card at 8 lapses has been relearned 8 times, and
        more reviews rarely fix it. Changing the card usually does:
      </p>
      <ul>
        <li>
          Is it really one fact? Split it (
          <DocLink slug="writing-cards" hash="one-fact">
            One fact per card
          </DocLink>
          ).
        </li>
        <li>Is it confused with a similar card? Add a hint, or a contrast in the extra field (“not to be confused with …”).</li>
        <li>Add a mnemonic or an example to the extra field.</li>
        <li>If you don’t need it, suspend or delete it.</li>
      </ul>
      <p>
        Once it’s fixed, remove the <C>leech</C> tag (and unsuspend it if needed) with the card browser’s bulk actions. To learn
        it again from scratch, use <strong>Forget</strong>: the card goes back to new with its lapses reset, and its past answers
        stay in your stats.
      </p>

      <H2 id="bury-suspend">Bury, suspend or later</H2>
      <Table
        head={['Action', 'Key', 'Hides the card', 'Use it when']}
        rows={[
          [
            <strong>Later</strong>,
            <Kbd>L</Kbd>,
            'Until the end of this session',
            'You want to come back to it in a moment. Nothing about the card changes.',
          ],
          [
            <strong>Bury</strong>,
            <Kbd>B</Kbd>,
            'Until your next study day',
            'You can’t deal with it today, for example it needs a reference you don’t have at hand.',
          ],
          [
            <strong>Suspend</strong>,
            <Kbd>S</Kbd>,
            'Until you unsuspend it',
            'You don’t want to see it for now: it’s wrong, out of date, or a leech you’ll fix later.',
          ],
        ]}
      />
      <p>
        Suspended cards keep their progress but are left out of every session and mode (Cram too), of due counts and of the
        forecast. To bring them back, filter the card browser by <strong>suspended</strong>, select them and choose Unsuspend.
        Buried cards come back on their own.
      </p>

      <H2 id="extra">Studying extra</H2>
      <p>
        Done for the day and want more? The study page has modes for that (
        <DocLink slug="custom-study" hash="modes">
          Study modes
        </DocLink>
        ):
      </p>
      <ul>
        <li>
          <strong>Extra new cards</strong> introduces new cards beyond the limit. They count toward today’s new-card limit, so
          finish your regular session first, and remember each one adds future reviews.
        </li>
        <li>
          <strong>Review ahead</strong> shows review cards due in the next few days. Use it before a trip or an exam, not as a
          habit: an early review is easier and does less for your memory. With the default scheduler, an early Good still grows
          the interval as if the card were on time; FSRS takes into account how early you are.
        </li>
        <li>
          <strong>Cram</strong> lets you practice anything without touching the schedule. Answers aren’t saved, so they earn no
          XP.
        </li>
      </ul>

      <H2 id="fsrs">FSRS and desired retention</H2>
      <p>
        FSRS is an alternative scheduler you switch on per preset (
        <DocLink slug="scheduling" hash="fsrs">
          How scheduling works
        </DocLink>
        ). Instead of fixed multipliers, it models each card’s memory and brings the card back when your chance of recalling it
        falls to your <strong>desired retention</strong>.
      </p>
      <ul>
        <li>
          <strong>Consider FSRS</strong> if you want to set a recall target directly and trade reviews for retention, or if
          intervals feel off with the default scheduler: cards you know keep coming back, or hard ones drift too far out.
        </li>
        <li>
          <strong>Stay with the default</strong> if you’re used to the classic SM-2 timings and happy with them. Cards keep their
          progress whichever you use.
        </li>
      </ul>
      <p>
        Desired retention runs from 70% to 99% (default 90%). With FSRS’s default parameters, a card that comes back in 30 days at
        90% comes back in:
      </p>
      <Table
        head={['Desired retention', 'Next review', 'Forgotten when it comes due']}
        rows={[
          ['80%', 'about 99 days', '1 in 5'],
          ['85%', 'about 57 days', 'about 1 in 7'],
          ['90% (default)', '30 days', '1 in 10'],
          ['95%', 'about 12 days', '1 in 20'],
          ['97%', 'about 7 days', 'about 1 in 33'],
        ]}
      />
      <p>
        So going from 90% to 95% means reviewing that card well over twice as often to forget half as much, and above 95% the cost
        climbs steeply. Below 85% you save reviews but forget more, and relearning forgotten cards takes time too. 90% is a
        sensible default: go up for material you can’t afford to forget, such as an exam coming up; go down for a large collection
        you just want to keep alive.
      </p>
      <Callout tone="note">
        Askesis uses FSRS’s default parameters, which come from a large dataset of real reviews. It doesn’t yet fit them to your
        own review history.
      </Callout>
    </>
  ),
}

// ── Writing cards ─────────────────────────────────────────────────────────────

const writingCards: DocPage = {
  slug: 'writing-cards',
  title: 'Writing good cards',
  summary:
    'Cards that are quick to answer and easy to remember: one fact each, precise questions, no lists, and bad → better examples.',
  section: 'Your cards',
  icon: PenLine,
  headings: [
    { id: 'why', label: 'Why it matters' },
    { id: 'one-fact', label: 'One fact per card' },
    { id: 'precise', label: 'Ask a precise question' },
    { id: 'lists', label: 'Avoid lists and sets' },
    { id: 'cloze', label: 'Cloze deletions' },
    { id: 'directions', label: 'Both directions' },
    { id: 'fields', label: 'Hints and extras' },
    { id: 'media', label: 'Math, code and images' },
    { id: 'examples', label: 'Bad → better' },
  ],
  body: () => (
    <>
      <p>
        How you write a card matters as much as how it’s scheduled. A good card takes a few seconds to answer and leaves no doubt
        about whether you got it right. These guidelines are the ones long-time spaced repetition users rely on, best known from
        Piotr Woźniak’s “Twenty rules of formulating knowledge”.
      </p>

      <H2 id="why">Why it matters</H2>
      <p>
        A card is scheduled as a whole. If it holds four facts and you forget one, you press Again and relearn all four. Big cards
        also invite half-right answers that are hard to grade honestly. Small, sharp cards are faster to review and stick for
        longer, so even though you make more of them, you spend less time overall.
      </p>

      <H2 id="one-fact">One fact per card</H2>
      <p>
        This is the <em>minimum information principle</em>: make each card as simple as it can be. When an answer has several
        parts, check whether each part could be its own card.
      </p>
      <Table
        head={['', 'Front', 'Back']}
        rows={[
          [
            <strong>Too much</strong>,
            'What is the mitochondrion?',
            'An organelle with a double membrane and its own DNA that makes most of the cell’s ATP through cellular respiration.',
          ],
          [<strong>Better</strong>, 'Which organelle makes most of a cell’s ATP?', 'The mitochondrion'],
          ['', 'Mitochondria have their own …?', 'DNA'],
          ['', 'How many membranes does a mitochondrion have?', 'Two'],
        ]}
      />

      <H2 id="precise">Ask a precise question</H2>
      <ul>
        <li>
          <strong>Exactly one right answer.</strong> “Capital of Georgia?” could be Tbilisi or Atlanta. Say which, in the question
          or in the hint (“country”).
        </li>
        <li>
          <strong>Make it stand on its own.</strong> Cards from different decks come up mixed together, so the front needs enough
          context to make sense by itself.
        </li>
        <li>
          <strong>Ask for what you want to recall.</strong> “What does <C>git stash</C> do?” beats “Explain git stash”: you can
          answer it in a sentence and grade it at once.
        </li>
        <li>
          <strong>Keep it short.</strong> If you have to read the front twice, trim it.
        </li>
      </ul>

      <H2 id="lists">Avoid lists and sets</H2>
      <p>
        “Name the seven layers of the OSI model” is a classic hard card. It’s easy to get six out of seven, every review is slow,
        and it’s unclear whether a near miss counts. Lists, and sets where order doesn’t matter, are the hardest things to learn
        as a single card. Instead:
      </p>
      <ul>
        <li>
          <strong>Split it</strong> into one card per item, each with its own cue: “OSI layer 3?” → Network, “OSI layer that
          routes packets between networks?” → Network (layer 3).
        </li>
        <li>
          <strong>Use cloze deletions</strong> on an ordered list, one gap per card (see below).
        </li>
        <li>
          <strong>Add a mnemonic</strong> for the whole sequence in the extra field, and still test the items one by one.
        </li>
        <li>If you must learn a set as a whole, keep it to three or four items.</li>
      </ul>

      <H2 id="cloze">Cloze deletions</H2>
      <p>
        A cloze card hides part of a sentence: “[…] is the capital of Australia.” Askesis has no cloze editor yet, but files you
        import can use cloze syntax in the front column, and each numbered gap becomes its own card:
      </p>
      <Code
        label="cloze.csv"
        code={`#separator:comma
#html:false
#columns:deck,front,back,hint,extra,tags
#deck column:1
#tags column:6
Networking,"OSI layers, bottom up: {{c1::Physical}}, {{c2::Data link}}, {{c3::Network}}, {{c4::Transport}}",,,,osi
Geography,{{c1::Canberra::city}} is the capital of Australia.,,,,capitals`}
      />
      <p>
        The first row makes four cards, each hiding one layer and showing the others; the answer appears in bold on the back. A
        hint after a second <C>::</C> shows in the gap, so the second row asks “[city] is the capital of Australia.” Typed into
        the card editor, the braces stay as plain text. Keep cloze sentences short and hide only the key word.
      </p>

      <H2 id="directions">Both directions</H2>
      <p>
        Each card is tested one way. Knowing that <em>perro</em> means “dog” doesn’t mean you can come up with <em>perro</em> when
        you need the word. If you need both, make two cards:
      </p>
      <Table
        head={['Front', 'Back']}
        rows={[
          ['perro', 'dog'],
          ['dog (Spanish)', 'perro'],
        ]}
      />
      <p>
        Askesis doesn’t create reverse cards for you, so add the second card yourself; in a file it’s just another row. Give it a
        different front, so you can tell the two apart. Only add the reverse when you need it. Recognizing a word is often enough,
        and every card adds reviews.
      </p>

      <H2 id="fields">Hints and extras</H2>
      <Table
        head={['Field', 'Shown', 'Use it for']}
        rows={[
          ['Front', 'Before you answer', 'The question or cue.'],
          ['Hint', 'Under the front, before you answer', 'A nudge that removes doubt: a reading, a category, “country”, “verb”.'],
          ['Back', 'When you reveal', 'The answer, as short as it can be.'],
          ['Extra', 'Under the answer', 'Context, an example sentence, a mnemonic, a source. Not something you grade.'],
        ]}
      />
      <p>
        Keep the back to what you grade yourself on and put everything else in the extra. Then it’s easy to tell whether you got
        it.
      </p>

      <H2 id="media">Math, code and images</H2>
      <ul>
        <li>
          <strong>Math</strong>: write LaTeX between <C>{String.raw`\( … \)`}</C> for inline math or <C>{String.raw`\[ … \]`}</C>{' '}
          for display math. Ask about one step or one identity per card, not a whole derivation.
        </li>
        <li>
          <strong>Code</strong>: use a fenced block with a language name for highlighting. Keep snippets to a few lines and ask
          about one thing, such as what a line prints or which method to call.
        </li>
        <li>
          <strong>Images and audio aren’t supported yet.</strong> Media in imported files is dropped. Describe the picture in
          words, or ask about the parts of a diagram one card at a time.
        </li>
      </ul>
      <p>
        All the syntax: <DocLink slug="formatting">Card formatting</DocLink>.
      </p>

      <H2 id="examples">Bad → better</H2>
      <Table
        head={['Bad', 'Better', 'Why']}
        rows={[
          [
            'Name the 7 OSI layers.',
            '“OSI layer 3?” → Network, and one card like it per layer, or a cloze per layer.',
            'A list fails if any part is missing.',
          ],
          [
            'Who wrote Pride and Prejudice, and when?',
            '“Who wrote Pride and Prejudice?” → Jane Austen. “Pride and Prejudice was published in …?” → 1813.',
            'Two facts, two cards.',
          ],
          ['Capital of Georgia?', 'Capital of Georgia?, with the hint “country” → Tbilisi.', 'Two right answers.'],
          [
            'Explain how HTTPS works.',
            '“What does TLS add to HTTP?” → Encryption and server authentication.',
            'An essay can’t be graded in a few seconds.',
          ],
          [
            <>
              Derivatives of <C>sin</C>, <C>cos</C> and <C>tan</C>?
            </>,
            <>
              Three cards, e.g. “Derivative of <C>{String.raw`\(\sin x\)`}</C>?” → <C>{String.raw`\(\cos x\)`}</C>.
            </>,
            'Each formula on its own card.',
          ],
          [
            'el perro → the dog, and the dog → el perro, both in one card.',
            'Two cards, one per direction.',
            'Each card tests one direction.',
          ],
        ]}
      />
      <p>
        Spot a bad card during review? Press <Kbd>E</Kbd> to fix it on the spot. Cards you keep forgetting are tagged <C>leech</C>
        , and they are usually the best ones to rewrite (
        <DocLink slug="workload" hash="leeches">
          Leeches
        </DocLink>
        ).
      </p>
    </>
  ),
}

// ── Decks & tags ──────────────────────────────────────────────────────────────

const decksAndTags: DocPage = {
  slug: 'decks-and-tags',
  title: 'Decks, subdecks & tags',
  summary: 'Organize cards into nested decks, give each deck its own preset, and slice everything with tags.',
  section: 'Your cards',
  icon: FolderTree,
  headings: [
    { id: 'decks', label: 'Decks and subdecks' },
    { id: 'manage', label: 'Managing decks' },
    { id: 'browser', label: 'The card browser' },
    { id: 'tags', label: 'Tags' },
  ],
  body: () => (
    <>
      <H2 id="decks">Decks and subdecks</H2>
      <p>
        Decks can be nested. A deck’s full name is its path, with <C>::</C> between levels:
      </p>
      <Code code={'Japanese\nJapanese::Core Vocabulary\nJapanese::Kanji'} />
      <p>
        Studying or exporting a parent deck includes its subdecks, and a parent’s due counts add up its children. Each deck picks
        its own preset, so you can give a hard subdeck shorter intervals.
      </p>

      <H2 id="manage">Managing decks</H2>
      <p>On the Decks page you can:</p>
      <ul>
        <li>Create a deck with a name, an optional parent, an icon, a description and a preset.</li>
        <li>Rename it, move it under another deck, or change its preset.</li>
        <li>Delete it. This also deletes its subdecks and all their cards.</li>
      </ul>
      <Callout tone="tip">
        Importing a file never replaces a deck. Decks with the same name are merged. See{' '}
        <DocLink slug="import-export">Import & export</DocLink>.
      </Callout>

      <H2 id="browser">The card browser</H2>
      <p>Find cards across your collection and work on many at once.</p>
      <Table
        head={['Tool', 'Options']}
        rows={[
          ['Search', 'Text in the front or back.'],
          [
            'Filter',
            'By deck (with subdecks), by tag (with the tags below it), and by state: all, new, learning, review, due, suspended, leech.',
          ],
          ['Sort', 'Newest, due date, front (A–Z), most lapses.'],
          ['Edit', 'Change any field, tags or deck of a single card.'],
          ['Bulk actions', 'Suspend, unsuspend, move to a deck, add a tag, remove a tag, forget (reset to new), delete.'],
        ]}
      />

      <H2 id="tags">Tags</H2>
      <p>
        Tags are single words (no spaces, up to 200 characters) you attach to cards, like <C>verbs</C> or <C>chapter-3</C>. Use
        them to study a slice of several decks at once (
        <DocLink slug="custom-study" hash="tags">
          Filtering by tags
        </DocLink>
        ), or to filter the browser.
      </p>
      <p>
        Tags can nest with <C>::</C>, so <C>lpic1::chapter::01</C> sits under <C>lpic1::chapter</C>, which sits under <C>lpic1</C>
        . <strong>Decks → Tags</strong> shows them as a tree, with how many cards each covers.
      </p>
      <ul>
        <li>Click a tag to filter the card browser to it. A parent tag includes the tags below it.</li>
        <li>
          Rename a tag and it changes on every card that has it. Renaming a parent renames the tags below it too:{' '}
          <C>lpic1::batch</C> → <C>lpic1::imports</C> turns <C>lpic1::batch::x</C> into <C>lpic1::imports::x</C>.
        </li>
        <li>Delete a tag and it is removed from every card, along with the tags below it. The cards stay.</li>
        <li>
          <C>leech</C> is added automatically to cards you keep forgetting.
        </li>
      </ul>
    </>
  ),
}

// ── Import & export ───────────────────────────────────────────────────────────

const importExport: DocPage = {
  slug: 'import-export',
  title: 'Import & export',
  summary: 'Move cards in and out as CSV or TSV, merge decks by name, and keep full backups with progress and review history.',
  section: 'Your cards',
  icon: FileSpreadsheet,
  headings: [
    { id: 'format', label: 'File format' },
    { id: 'headers', label: 'Header lines' },
    { id: 'columns', label: 'Columns' },
    { id: 'identifiers', label: 'Card identifiers' },
    { id: 'importing', label: 'Importing' },
    { id: 'merge', label: 'How merging works' },
    { id: 'exporting', label: 'Exporting' },
    { id: 'progress', label: 'Progress columns' },
    { id: 'history', label: 'Review history' },
    { id: 'restoring', label: 'Restoring a backup' },
    { id: 'other-apps', label: 'Coming from another app' },
    { id: 'apkg', label: 'Flashcard packages (.apkg)' },
  ],
  body: () => (
    <>
      <Callout tone="tip" title="Generating cards with AI?">
        Give your agent the exact spec: <DocLink slug="for-ai-agents">For AI agents</DocLink>, also served raw at <C>/llms.txt</C>
        .
      </Callout>

      <H2 id="format">File format</H2>
      <p>
        Askesis reads and writes plain-text tables in UTF-8: comma-separated (CSV), tab-separated (TSV), semicolon or pipe. One
        row is one card. Fields with the separator, quotes or line breaks are wrapped in double quotes, with quotes doubled
        inside.
      </p>
      <Code
        label="cards.csv"
        code={`#separator:comma
#html:false
#columns:deck,front,back,hint,extra,tags
#deck column:1
#tags column:6
Japanese::Kanji,脳,brain,Kanji meaning,On: ノウ,kanji body
Spanish,aprovechar,to make the most of,,,verbs
Neuroscience,"Who coined the term ""engram""?","Richard Semon, in 1904",,,history`}
      />

      <H2 id="headers">Header lines</H2>
      <p>
        Optional lines at the top of the file describe it. They are the header lines common flashcard apps use for text import and
        export, so files move between apps.
      </p>
      <Table
        head={['Line', 'Meaning']}
        rows={[
          [
            <C>#separator:comma</C>,
            <>
              The separator: <C>comma</C>, <C>tab</C>, <C>semicolon</C> or <C>pipe</C>. Detected automatically if missing.
            </>,
          ],
          [<C>#html:true</C>, 'Fields contain HTML. It is converted to plain text on import (see below).'],
          [<C>#columns:deck,front,back</C>, 'A name for each column.'],
          [<C>#deck column:1</C>, 'Which column (counting from 1) holds the deck path.'],
          [<C>#tags column:6</C>, 'Which column holds space-separated tags.'],
        ]}
      />

      <H2 id="columns">Columns</H2>
      <Table
        head={['Column', 'Also accepted as', 'Notes']}
        rows={[
          [<C>front</C>, 'question, term, word', 'Required. Rows without a front are skipped.'],
          [<C>back</C>, 'answer, definition, meaning', ''],
          [
            <C>deck</C>,
            '',
            <>
              A path like <C>Parent::Child</C>. Missing decks are created.
            </>,
          ],
          [
            <C>tags</C>,
            'tag',
            <>
              Separated by spaces. Nest them with <C>::</C>, like <C>lang::spanish</C>.
            </>,
          ],
          [<C>hint</C>, 'reading', 'A small line under the front.'],
          [<C>extra</C>, 'notes, note', 'Shown under the answer.'],
          [
            <C>identifier</C>,
            'id',
            <>
              The card’s identifier, in exports. Leave it empty for new cards (see <a href="#identifiers">Card identifiers</a>).
            </>,
          ],
        ]}
      />
      <p>
        Column names can come from <C>#columns</C> or from a header row (detected when the first row is made of column names).
        With neither, the first column is the front and the second the back. You can change any mapping before importing. Files
        can also carry each card’s study progress and review history, see <a href="#progress">Progress columns</a>.
      </p>

      <H2 id="identifiers">Card identifiers</H2>
      <p>
        Every card has an identifier that never changes, a short code like <C>k7m2qp</C>. Exports put it in an <C>identifier</C>{' '}
        column after the tags, so you can edit a deck in a spreadsheet and import it back:
      </p>
      <ul>
        <li>
          <strong>A row with your card’s identifier updates that card’s text</strong>: front, back, hint and extra. A stray space
          or a fixed typo never creates a second card. The card keeps its progress, review history, tags and deck.
        </li>
        <li>
          <strong>A row with an empty identifier is a new card.</strong> Askesis makes one for it when you import.
        </li>
        <li>
          <strong>An identifier belongs to one row.</strong> If a row is copied with its identifier, only the first one updates
          the card; the copy becomes a new card, and the import dialog tells you how many rows repeat one.
        </li>
        <li>
          <strong>Deleting a row doesn’t delete the card.</strong> Importing never deletes anything; delete cards in the card
          browser.
        </li>
      </ul>
      <p>
        Identifiers are unique within your account, and an import only ever looks at your own cards. A row whose identifier you
        don’t have, from a deck someone shared or a backup of another account, becomes a new card with that same identifier, so
        importing the file again updates it instead of adding a copy. Another account with the same identifier is never affected,
        and an import never fails over one.
      </p>
      <p>
        Cards are matched by identifier only, never by their text. A file without identifiers (one you wrote, one an AI assistant
        made, or one from another app) adds all its cards each time you import it. After importing it, export the deck to get a
        file with identifiers for editing.
      </p>

      <H2 id="importing">Importing</H2>
      <Steps>
        <li>Choose a file. Askesis detects the separator, the header lines and the columns.</li>
        <li>
          Check the table of your first rows, one card per row. Each column’s header says what it holds (front, back, deck, tags,
          …); change it there if Askesis guessed wrong. The rendered cards below follow.
        </li>
        <li>Pick a default deck for rows that don’t name one. Type a new name to create it.</li>
        <li>Choose what to do with duplicates, then import.</li>
      </Steps>
      <p>
        You get a summary: decks created, decks merged, and cards added, updated, unchanged and skipped. For a file with progress,
        it also says “Progress kept for N cards” and “N past reviews restored”.
      </p>

      <H2 id="merge">How merging works</H2>
      <ul>
        <li>
          <strong>Decks are matched by full path</strong>, ignoring upper/lower case. Cards are added to an existing deck with the
          same path. Nothing is ever deleted, so you can import into a deck again and again.
        </li>
        <li>
          <strong>Cards that already exist</strong> are matched by <a href="#identifiers">identifier</a>. A row without one, or
          with one none of your cards has, is a new card. You choose what happens to a match:
        </li>
      </ul>
      <Table
        head={['Option', 'Result']}
        rows={[
          [
            <strong>Update</strong>,
            'Default. The front, back, hint and extra are replaced; the card keeps its progress, review history, tags and deck. Cards whose text already matches the file aren’t touched (they count as unchanged), and rows that match nothing are added, so importing an edited export updates what changed and adds what’s new.',
          ],
          [<strong>Skip</strong>, 'Existing cards are left alone.'],
          [<strong>Import as new</strong>, 'A second copy is added, with a new identifier.'],
        ]}
      />

      <H2 id="exporting">Exporting</H2>
      <p>
        Export everything or only the decks you select (subdecks are included), as CSV (optionally separated with semicolons, for
        spreadsheets set to a European locale), TSV, or plain text (.txt) for other flashcard apps. Under <strong>Include</strong>{' '}
        there are two tickboxes:
      </p>
      <Table
        head={['Tickbox', 'Default', 'Adds']}
        rows={[
          [
            <strong>Study progress</strong>,
            'On',
            'Each card’s state, due date, interval, ease, memory, learning step and suspended flag. New cards stay new.',
          ],
          [
            <strong>Review history</strong>,
            'On (needs Study progress)',
            'Every past answer, so your heatmap, streak, XP and stats come back when you import the file.',
          ],
        ]}
      />
      <p>
        Every export has the <C>identifier</C> column, so importing the file again updates the same cards. Your choice is
        remembered on this device. With both ticked, the file is a complete backup. To share cards so others start fresh, untick{' '}
        <strong>Study progress</strong>, which leaves out the history too. Other flashcard apps usually ignore these columns on
        import; Askesis restores them.
      </p>

      <H2 id="progress">Progress columns</H2>
      <p>With progress included, these columns follow the tags and the identifier, in this order:</p>
      <Code code="state, due, interval, ease, stability, difficulty, step, reps, lapses, last_review, suspended, history" />
      <Table
        head={['Column', 'Meaning']}
        rows={[
          [<C>state</C>, '0 new, 1 learning, 2 review, 3 relearning.'],
          [
            <C>due</C>,
            <>
              When the card is next due, in ISO 8601 (<C>2026-10-16T04:00:00.000Z</C>).
            </>,
          ],
          [<C>interval</C>, 'Current interval in days (0 while learning).'],
          [<C>ease</C>, 'Ease factor of the default scheduler: 2.5 means 250%.'],
          [
            <>
              <C>stability</C>, <C>difficulty</C>
            </>,
            'FSRS memory state, 0 when unknown.',
          ],
          [<C>step</C>, 'Position in the learning or relearning steps, counting from 0.'],
          [
            <>
              <C>reps</C>, <C>lapses</C>
            </>,
            'Times reviewed and times forgotten.',
          ],
          [<C>last_review</C>, 'Time of the last answer.'],
          [<C>suspended</C>, '1 if the card is suspended.'],
          [<C>history</C>, 'Every past answer (next section). Only with Review history ticked.'],
        ]}
      />
      <p>
        Leave them empty for cards that haven’t been studied. A row only counts as having progress when its state and due date are
        both valid.
      </p>

      <H2 id="history">Review history</H2>
      <p>
        The <C>history</C> column holds a card’s past answers, oldest first, separated by <C>;</C>. Each answer is up to eight
        values separated by spaces:
      </p>
      <Code code="<time> <rating> <ms> <state before> <state after> <interval before> <interval after> <ease after>" />
      <Table
        head={['Value', 'Meaning']}
        rows={[
          ['time', 'When you answered, in ISO 8601. Required.'],
          ['rating', '1 Again, 2 Hard, 3 Good, 4 Easy. Required.'],
          ['ms', 'Time spent on the card, in milliseconds.'],
          ['state before, state after', '0 new, 1 learning, 2 review, 3 relearning.'],
          ['interval before, interval after', 'In days.'],
          ['ease after', 'Ease factor after the answer, like 2.5.'],
        ]}
      />
      <p>
        Only time and rating are required. This card was learned with two Good answers about ten minutes apart, and graduated to a
        1-day interval:
      </p>
      <Code code="2026-03-01T09:12:00Z 3 5200 0 1 0 0 0;2026-03-01T09:22:40Z 3 3100 1 2 0 1 2.5" />

      <H2 id="restoring">Restoring a backup</H2>
      <ul>
        <li>
          <strong>Cards you don’t have yet</strong> are added with the file’s progress and review history. Cards that are new in
          the file stay new.
        </li>
        <li>
          <strong>Cards you already have</strong> (same identifier) keep their own progress and history. Restoring a backup never
          changes study you already have.
        </li>
        <li>
          <strong>Importing the same backup twice is safe</strong>: the cards it added keep the file’s identifiers, so the second
          import finds them and adds nothing.
        </li>
        <li>
          <strong>Imported history counts everywhere</strong>: the heatmap, streaks, XP, trophies and every chart (
          <DocLink slug="stats">Reading your stats</DocLink>).
        </li>
        <li>Imported answers can’t be undone in a study session.</li>
      </ul>
      <p>After the import, the summary says how many cards kept their progress and how many past reviews were restored.</p>

      <H2 id="other-apps">Coming from another app</H2>
      <ul>
        <li>
          A plain-text notes export (.txt) from another flashcard app imports directly. Its <C>#guid column</C> and{' '}
          <C>#notetype column</C> are skipped, a third field becomes the extra, and <strong>cloze notes</strong> (
          <C>{'{{c1::answer::hint}}'}</C>) become one card per deletion.
        </li>
        <li>
          HTML fields are converted: line breaks, lists, bold and italic are kept, and the <C>[latex]</C>, <C>[$]</C> and{' '}
          <C>[$$]</C> tags some apps use become Askesis math. Other HTML is dropped.
        </li>
        <li>
          To go the other way, export as <strong>Plain text (.txt)</strong>. Apps that read the header lines also import the
          Askesis CSV, including the deck and tags columns.
        </li>
        <li>
          <C>.apkg</C> and <C>.colpkg</C> packages can’t be imported directly yet; convert them with the prompt below. Media files
          aren’t imported.
        </li>
      </ul>

      <H2 id="apkg">Flashcard packages (.apkg, .colpkg)</H2>
      <p>
        Until Askesis reads flashcard packages itself, an AI assistant that can run code (ChatGPT, Claude or Gemini) can convert
        one for you, <strong>keeping your progress</strong>:
      </p>
      <Steps>
        <li>Copy the prompt below.</li>
        <li>Open your AI assistant, attach your .apkg or .colpkg file and paste the prompt.</li>
        <li>Download the CSV it creates and import it on the Decks page.</li>
      </Steps>
      <p>
        Every card keeps its state, due date, interval, ease, FSRS memory state, review count, lapses and suspended flag. Subdecks
        come through as <C>Parent::Child</C> paths and cloze notes become one card per deletion.
      </p>
      <p>
        Your review history comes along too: the package’s review log becomes the <C>history</C> column, so the heatmap, streaks
        and stats pick up where you left off. Manual reschedules aren’t answers and are skipped. The current learning step isn’t
        carried over, so cards in the middle of their learning steps start them again.
      </p>
      <Callout tone="tip" title="Prefer to run it yourself?">
        The prompt contains a complete Python script. Save it as <C>convert.py</C> and run <C>python convert.py your-deck.apkg</C>{' '}
        (newer packages are compressed and also need <C>zstandard</C>).
      </Callout>
      <PackagePrompt />
    </>
  ),
}

// ── Formatting ────────────────────────────────────────────────────────────────

const formatting: DocPage = {
  slug: 'formatting',
  title: 'Card formatting',
  summary: 'Math with LaTeX, highlighted code, and light text styling on your cards.',
  section: 'Your cards',
  icon: Sigma,
  headings: [
    { id: 'math', label: 'Math (LaTeX)' },
    { id: 'code', label: 'Code' },
    { id: 'text', label: 'Text styling' },
  ],
  body: () => (
    <>
      <p>
        Card fields are plain text with a little markup. Formatting works on the front, back and extra fields, and renders the
        same on every device.
      </p>

      <H2 id="math">Math (LaTeX)</H2>
      <p>Write LaTeX between delimiters. Math is rendered with KaTeX.</p>
      <Table
        head={['Write', 'For']}
        rows={[
          [<C>{String.raw`\( e^{i\pi} + 1 = 0 \)`}</C>, 'Inline math (the MathJax style)'],
          [<C>{String.raw`\[ \int_0^1 x^2\,dx = \tfrac{1}{3} \]`}</C>, 'Display math, centered on its own line'],
          [<C>{'$a^2 + b^2 = c^2$'}</C>, 'Inline math'],
          [<C>{'$$\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}$$'}</C>, 'Display math'],
        ]}
      />
      <Callout tone="note">
        Single dollars only count as math when there’s no space right inside them and no digit right after the closing one, so “$5
        and $10” stays text. If LaTeX has an error, the source is shown instead.
      </Callout>

      <H2 id="code">Code</H2>
      <p>Put code in a fenced block with a language name for syntax highlighting:</p>
      <Code code={'```rust\nfn main() {\n    println!("hello, askesis");\n}\n```'} />
      <p>
        Highlighted languages: Rust, TypeScript, JavaScript, Python, SQL, Bash, JSON, Go, Java, C, C++, CSS, HTML/XML, YAML and
        Markdown. Without a language name, Askesis guesses from that list. Long lines scroll sideways inside the card. For inline
        code, use single backticks: <C>`Vec&lt;T&gt;`</C>.
      </p>

      <H2 id="text">Text styling</H2>
      <Table
        head={['Write', 'Result']}
        rows={[
          [<C>**bold**</C>, <strong>bold</strong>],
          [<C>*italic*</C>, <em>italic</em>],
          [<C>_italic_</C>, <em>italic</em>],
          ['A line break', 'Kept as a line break'],
        ]}
      />
      <p>
        HTML isn’t rendered, so cards are safe to share. HTML in imported files is converted, see{' '}
        <DocLink slug="import-export" hash="other-apps">
          Coming from another app
        </DocLink>
        .
      </p>
    </>
  ),
}

// ── For AI agents ─────────────────────────────────────────────────────────────

const forAgents: DocPage = {
  slug: 'for-ai-agents',
  title: 'Make cards with AI',
  summary:
    'A copy-paste prompt that has ChatGPT, Claude or Gemini write a deck you can import, and the exact card file spec for agents and scripts (/llms.txt).',
  section: 'Your cards',
  icon: Bot,
  headings: [
    { id: 'prompt', label: 'Make a deck with a chat assistant' },
    { id: 'use', label: 'For agents and scripts' },
    { id: 'spec', label: 'The spec' },
  ],
  body: () => (
    <>
      <p>
        An AI assistant can turn a topic, your notes or a whole chapter into a deck in a minute. The prompt below tells it how to
        write good cards and exactly how to format the file, so it imports cleanly.
      </p>

      <H2 id="prompt">Make a deck with a chat assistant</H2>
      <Steps>
        <li>Copy the prompt and paste it into ChatGPT, Claude, Gemini or any assistant you use.</li>
        <li>
          Fill in the lines in square brackets: the topic (or attach your notes or a document), how many cards, your level, the
          deck name and the language.
        </li>
        <li>
          Download the <C>askesis-cards.csv</C> it gives you. If it only shows the text, copy it into a file with that name.
        </li>
        <li>
          On the Decks page, choose Import and pick the file. Check the table of cards, then import. Decks with the same name are
          merged, never wiped (
          <DocLink slug="import-export" hash="merge">
            how merging works
          </DocLink>
          ).
        </li>
      </Steps>
      <CardPrompt />
      <Callout tone="tip">
        Read through the cards before you study them. Assistants occasionally get a fact wrong or write a card that tests two
        things; fix or delete those in the card browser. Tips for good cards:{' '}
        <DocLink slug="writing-cards">Writing good cards</DocLink>.
      </Callout>

      <H2 id="use">For agents and scripts</H2>
      <p>
        The rest of this page is written for language models and scripts that create Askesis cards. It states every rule the
        importer and the card renderer follow, with limits and examples.
      </p>
      <ul>
        <li>
          Point an agent at <C>/llms.txt</C>: the same spec as raw Markdown.
        </li>
        <li>Or copy the spec below into your prompt.</li>
      </ul>
      <p>A short prompt for an agent that can read the web:</p>
      <Code
        label="agent-prompt.txt"
        code={`Follow the Askesis card file spec at <site>/llms.txt exactly.
Create 40 cards about <topic> for a <level> learner.
Use the deck path "<Subject>::<Topic>" and tag each card with <tags>.
One fact per card. Use \\( … \\) for math and fenced code blocks with a language for code.
Output only the CSV file, starting with the five header lines.`}
      />
      <p>
        To change cards you already have, export their deck and give the file to the agent. Each row’s <C>identifier</C> says
        which card it is, so importing the edited file with <strong>Update</strong> changes those cards instead of adding copies (
        <DocLink slug="import-export" hash="identifiers">
          card identifiers
        </DocLink>
        ):
      </p>
      <Code
        label="edit-prompt.txt"
        code={`Follow the Askesis card file spec at <site>/llms.txt exactly.
The attached file is an Askesis export. <What to change, e.g. fix typos and add an example sentence to each extra.>
Keep the header lines and the identifier column. Don't change or copy an identifier.
Add new cards as new rows with an empty identifier.
Output the whole CSV file.`}
      />

      <H2 id="spec">The spec</H2>
      <AgentSpec />
    </>
  ),
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const stats: DocPage = {
  slug: 'stats',
  title: 'Reading your stats',
  summary:
    'What every number on the dashboard means: due counts, streak, XP, the heatmap, forecast, retention, answer buttons and more.',
  section: 'More',
  icon: ChartLine,
  headings: [
    { id: 'today', label: 'Today' },
    { id: 'streak', label: 'Streak and freezes' },
    { id: 'level', label: 'XP and level' },
    { id: 'decks', label: 'The decks table' },
    { id: 'insights', label: 'Forecast, reviews, retention' },
    { id: 'activity', label: 'Activity heatmap' },
    { id: 'answers', label: 'Answer buttons' },
    { id: 'collection', label: 'Collection and recall' },
    { id: 'hours', label: 'Sharpest hour' },
    { id: 'trophies', label: 'Trophies and quests' },
    { id: 'healthy', label: 'What healthy looks like' },
  ],
  body: () => (
    <>
      <p>
        The numbers on your dashboard are worked out from your cards and your review log, the record of every answer you’ve saved.
        So the stats always agree with each other, and a backup with review history brings back your heatmap, streaks, retention
        and trophies (
        <DocLink slug="import-export" hash="history">
          Review history
        </DocLink>
        ). Cram answers aren’t saved, so they don’t show up anywhere.
      </p>

      <H2 id="today">Today</H2>
      <Table
        head={['Item', 'What it means']}
        rows={[
          [
            'Cards ready for review',
            'Everything due before your study day rolls over: learning cards, due reviews and new cards, within each deck’s daily limits.',
          ],
          [
            'New, Learning, Review',
            'The same total by kind. New cards are capped by the new-card limit and reviews by the review limit; learning cards are never capped.',
          ],
          [
            'About N minutes',
            'Your average time per answer over the last 30 days (8 seconds until there’s history), with new cards counted at 2.5 times that.',
          ],
          [
            'Daily goal ring',
            'Answers today out of your daily goal (default 100, in Settings → Study). Reaching it pays +50 XP.',
          ],
          ['XP today, streak boost', 'XP earned today, and the multiplier your streak adds to every answer (up to ×1.5).'],
        ]}
      />

      <H2 id="streak">Streak and freezes</H2>
      <ul>
        <li>
          <strong>Day streak</strong>: consecutive study days with at least one saved answer. Days follow your study day, so with
          the default 4 AM rollover a review at 1 AM counts for the day before. Today can’t break the streak until it’s over.
        </li>
        <li>
          <strong>This week</strong>: a check for days you studied, a snowflake for a day a freeze covered, a cross for a missed
          day.
        </li>
        <li>
          <strong>Snowflakes</strong> (top right): your banked streak freezes, up to 2. If you miss a day while a streak is
          running, a banked freeze covers it automatically and the streak survives.
        </li>
        <li>
          <strong>The line under the count</strong> says “Review today to keep it alive” until you’ve studied today, then
          “Personal best” or your longest streak so far.
        </li>
      </ul>

      <H2 id="level">XP and level</H2>
      <p>
        Most XP comes from answers (8 for Hard, Good or Easy, 4 for Again, +4 the first time you see a card), multiplied by your
        streak. Bonuses, such as +50 on days you reach your goal, add to it. Your level follows from your total XP: the bar shows
        progress to the next level, and your rank changes at set levels. Answer XP is recalculated from your review log, so
        imported history counts too. The full tables: <DocLink slug="gamification">XP, levels & streaks</DocLink>.
      </p>

      <H2 id="decks">The decks table</H2>
      <Table
        head={['Column', 'Meaning']}
        rows={[
          ['New, Learn, Due', 'Due today in this deck, within its limits. A parent adds up its subdecks.'],
          ['Recall', 'True retention over the last 30 days (see below), subdecks included. A dash means no review answers yet.'],
          ['Mature', 'The share of cards, subdecks included, with an interval of 21 days or more.'],
        ]}
      />

      <H2 id="insights">Forecast, reviews, retention</H2>
      <p>The Insights panel has three tabs. The grid button switches each chart to a table with the exact numbers.</p>
      <Table
        head={['Tab', 'Shows', 'Headline']}
        rows={[
          [
            'Forecast',
            'Review cards due on each of the next 30 days, split into young and mature. New and learning cards aren’t included, so real days run a bit busier.',
            'Due tomorrow, and the average per day.',
          ],
          [
            'Reviews',
            'Answers per day over the last 30 days, split into learning (new and learning cards), young and mature.',
            'The total, and the average per day.',
          ],
          [
            'Retention',
            'True retention for each of the last 26 weeks, against a dashed 90% target line.',
            'True retention over the last 4 weeks.',
          ],
        ]}
      />
      <p>
        <strong>True retention</strong> is the share of answers on review cards (young or mature) that weren’t Again. It leaves
        out new and learning cards, whose answers say little about long-term memory. Weeks without review answers are skipped.
      </p>

      <H2 id="activity">Activity heatmap</H2>
      <ul>
        <li>
          One square per day for the past year, darker for more answers. The shades are relative to you: they split your own study
          days into quarters, so a pale square is a light day by your standards.
        </li>
        <li>Point at a day, or focus the grid and move with the arrow keys, to see its answers, true retention and minutes.</li>
        <li>
          <strong>Daily average</strong> counts answers on the days you studied. <strong>Days learned</strong> is the share of
          days you studied since your first study day in that year. The streaks match the streak card.
        </li>
      </ul>

      <H2 id="answers">Answer buttons</H2>
      <p>
        How often you pressed each button over the last 30 days, with the share answered correctly (anything but Again) on top.
        This counts every answer, new and learning cards included, so it isn’t the same number as true retention.
      </p>
      <p>
        Most answers should be Good. A high share of Again usually points to cards that need rewriting; almost no Again at all can
        mean your intervals are shorter than they need to be.
      </p>

      <H2 id="collection">Collection and recall</H2>
      <Table
        head={['Bucket', 'Meaning']}
        rows={[
          ['New', 'Never studied.'],
          ['Learning', 'In learning or relearning steps.'],
          ['Young', 'Review cards with an interval under 21 days.'],
          ['Mature', 'Review cards with an interval of 21 days or more.'],
          ['Suspended', 'Suspended cards, whatever their state.'],
        ]}
      />
      <p>
        <strong>Average recall right now</strong> estimates your chance of recalling a review card if it were asked at this
        moment, averaged over all review cards. It uses the FSRS forgetting curve; for cards scheduled by the default scheduler,
        the interval stands in for memory stability. Overdue cards pull it down. It’s an estimate, not a test result.
      </p>

      <H2 id="hours">Sharpest hour</H2>
      <p>
        True retention by hour of day over the last 90 days, one dot per hour, sized by how many answers you gave at that hour.
        Hours with few answers (under 50, or under 3% of the total) are left out as noise. The highlighted dot is your best hour;
        the dashed line is the 90% target.
      </p>
      <p>Differences of a few percent between hours are normal variation. Treat it as a hint, not a rule.</p>

      <H2 id="trophies">Trophies and quests</H2>
      <p>
        <strong>Trophies</strong> mark milestones in four tiers, bronze to platinum: lifetime reviews, streaks, mature cards, big
        days and more. Locked ones show your progress. They’re worked out from your whole review history, so they can’t be lost,
        and imported history can unlock them. <strong>Daily quests</strong> are six small goals for the day, sized to what your
        queue holds and claimed for XP and coins. Details:{' '}
        <DocLink slug="gamification" hash="trophies">
          Trophies
        </DocLink>
        .
      </p>

      <H2 id="healthy">What healthy looks like</H2>
      <ul>
        <li>
          <strong>True retention around 85–95%.</strong> Much lower suggests cards that are too hard or intervals that are too
          long; check your leeches. Much higher means you could review less, for example with FSRS at a lower desired retention (
          <DocLink slug="workload" hash="fsrs">
            FSRS and desired retention
          </DocLink>
          ).
        </li>
        <li>
          <strong>A fairly even forecast.</strong> Spikes come from bursts of new cards and smooth out over time.
        </li>
        <li>
          <strong>A growing mature share</strong> in the collection bar.
        </li>
        <li>
          <strong>Regular days on the heatmap</strong>, which matter more than big ones.
        </li>
      </ul>
    </>
  ),
}

// ── Gamification ──────────────────────────────────────────────────────────────

const gamification: DocPage = {
  slug: 'gamification',
  title: 'XP, levels & streaks',
  summary:
    'How XP and coins are earned, the rank ladder, streaks and freezes, the daily chest, quests, lucky finds and trophies.',
  section: 'More',
  icon: Trophy,
  headings: [
    { id: 'xp', label: 'XP' },
    { id: 'levels', label: 'Levels and ranks' },
    { id: 'streaks', label: 'Streaks and freezes' },
    { id: 'coins', label: 'Coins and the daily chest' },
    { id: 'quests', label: 'Daily quests' },
    { id: 'trophies', label: 'Trophies' },
  ],
  body: () => (
    <>
      <H2 id="xp">XP</H2>
      <Table
        head={['For', 'XP']}
        rows={[
          [
            <>
              An answer of <Rating kind="hard">Hard</Rating>, <Rating kind="good">Good</Rating> or{' '}
              <Rating kind="easy">Easy</Rating>
            </>,
            '8',
          ],
          [
            <>
              An answer of <Rating kind="again">Again</Rating>
            </>,
            '4',
          ],
          ['Seeing a new card for the first time', '+4'],
          ['Reaching your daily goal', '+50'],
          ['Claiming a daily quest', '+25 to +40'],
          ['Claiming all of the day’s quests', '+50 bonus'],
          ['Opening the daily chest', '+20 to +160, by chest tier'],
        ]}
      />
      <p>
        Answer XP is multiplied by your streak: +1% per streak day, up to ×1.5 at 50 days. Again still earns XP because showing up
        is the habit; Hard, Good and Easy pay the same so grading stays honest.
      </p>

      <H2 id="levels">Levels and ranks</H2>
      <p>
        Reaching level <em>n</em> takes 250 × (<em>n</em> − 1)² XP in total, so each level takes a bit longer than the last. Ranks
        change at these levels:
      </p>
      <Table
        head={['Level', 'Rank']}
        rows={[
          ['1', 'Spark'],
          ['5', 'Neuron'],
          ['10', 'Dendrite'],
          ['15', 'Synapse'],
          ['20', 'Circuit'],
          ['30', 'Cortex'],
          ['40', 'Hippocampus'],
          ['50', 'Savant'],
          ['65', 'Polymath'],
          ['80', 'Engram'],
        ]}
      />

      <H2 id="streaks">Streaks and freezes</H2>
      <p>
        Your streak counts consecutive study days with at least one review. Days follow your study day (rolling over at 4 AM by
        default, in your time zone). Your streak is safe until today rolls over, even if you haven’t studied yet.
      </p>
      <p>
        A <strong>streak freeze</strong> covers one missed day. You can bank up to two. When you come back after missing days,
        banked freezes are spent on them automatically, as long as there are enough to cover every missed day; if the gap is
        longer than your bank, the streak resets and your freezes stay banked for next time. New accounts start with one freeze,
        and every weekly chest (below) banks another.
      </p>

      <H2 id="coins">Coins and the daily chest</H2>
      <p>
        <strong>Coins</strong> are earned by playing. Your balance shows on the dashboard’s chest card and in the top bar. There’s
        nothing to buy with them yet; they’re a score you collect.
      </p>
      <Table
        head={['For', 'Coins']}
        rows={[
          ['Reaching your daily goal', '+10'],
          ['Claiming a daily quest', '+10 to +20'],
          ['Claiming all of the day’s quests', '+30 bonus'],
          ['Opening the daily chest', '+10 to +90, by chest tier'],
          ['A lucky find while studying', '+5 to +20 (1 answer in 25, on average)'],
          ['Your welcome bonus (new accounts, once)', '+50, with +100 XP'],
        ]}
      />
      <p>
        The <strong>daily chest</strong> opens once per study day, and you don’t need to study first. It holds random XP and
        coins, and it gets better with your streak:
      </p>
      <Table
        head={['Chest', 'From a streak of', 'XP', 'Coins']}
        rows={[
          ['Bronze', '0 days', '20–40', '10–20'],
          ['Silver', '7 days', '40–70', '20–35'],
          ['Gold', '30 days', '60–100', '35–55'],
          ['Diamond', '100 days', '100–160', '60–90'],
        ]}
      />
      <p>
        Open a chest seven days in a row and the seventh is a <strong>weekly chest</strong>: double XP and coins, and a streak
        freeze if your bank has room. The chest card shows where you are in the run; missing a day starts it over, without taking
        anything away.
      </p>
      <p>
        <strong>Lucky finds</strong> are a small surprise: any answer has a 1-in-25 chance of turning up 5 to 20 coins. The roll
        happens on the server, cram answers don’t count, and the odds never change. Chest, quest and lucky-find rewards are saved
        as they happen, so they can’t be claimed twice.
      </p>
      <p>
        Sounds for rewards (chests, coins, quests and level-ups) are on by default; the study session’s settings switch them off
        or add sounds for revealing and grading cards too.
      </p>

      <p>
        More on <DocLink slug="daily-chest">the daily chest</DocLink> and <DocLink slug="levels">levels and XP</DocLink>.
      </p>

      <H2 id="quests">Daily quests</H2>
      <p>
        Six quests a day (details on <DocLink slug="daily-quests">daily quests</DocLink>), picked from a pool: review a number of
        cards (always one of them), learn new cards, study several decks, study for some minutes, answer cards right, earn XP from
        reviews, and review mature cards. Targets are capped at what your queue holds, so a small collection never gets an
        impossible quest, and they’re fixed the first time you see them that day. Finished quests are <strong>claimed</strong> by
        hand for their XP and coins; claim all of them for a bonus. Unclaimed rewards expire when the study day rolls over.
      </p>

      <H2 id="trophies">Trophies</H2>
      <p>
        36 trophies in four tiers (bronze, silver, gold, platinum) reward milestones: total reviews, reviews in one day, streak
        lengths, days studied, mature cards, new cards learned, early-morning and late-night reviews, accuracy on a busy day, long
        runs without an Again, forgotten cards brought back to mature, hours studied, and more. One is a secret until you earn it.
        Trophies are worked out from your review history, so they can’t be lost.
      </p>
    </>
  ),
}

// ── Daily chest ───────────────────────────────────────────────────────────────

const dailyChest: DocPage = {
  slug: 'daily-chest',
  title: 'The daily chest',
  summary:
    'What the daily chest is, how to open it, what each chest tier holds, and how the weekly chest and its streak freeze work.',
  section: 'More',
  icon: Gift,
  headings: [
    { id: 'what', label: 'What is the daily chest?' },
    { id: 'open', label: 'How to open it' },
    { id: 'tiers', label: 'Chest tiers' },
    { id: 'weekly', label: 'The weekly chest' },
    { id: 'coins', label: 'XP and coins' },
  ],
  body: () => (
    <>
      <H2 id="what">What is the daily chest?</H2>
      <p>
        The daily chest is a small reward you can open <strong>once per study day</strong> on your dashboard. Each chest holds a
        random amount of <strong>XP</strong>, which moves you towards your next level, and <strong>coins</strong>. It’s a reason
        to drop by every day, even on days you only have a few minutes.
      </p>

      <H2 id="open">How to open it</H2>
      <Steps>
        <li>Open your dashboard. The chest card sits next to your daily quests.</li>
        <li>
          Press <strong>Open chest</strong>. It rattles for a moment, then bursts open and shows what you got.
        </li>
        <li>Come back after your study day rolls over (4 AM in your time zone by default) for the next one.</li>
      </Steps>
      <p>
        You don’t have to study before opening it. The reward is decided on the server when you open it, so it’s the same on every
        device and can’t be opened twice.
      </p>

      <H2 id="tiers">Chest tiers</H2>
      <p>The longer your study streak, the better the chest:</p>
      <Table
        head={['Chest', 'From a streak of', 'XP inside', 'Coins inside']}
        rows={[
          ['Bronze', '0 days', '20–40', '10–20'],
          ['Silver', '7 days', '40–70', '20–35'],
          ['Gold', '30 days', '60–100', '35–55'],
          ['Diamond', '100 days', '100–160', '60–90'],
        ]}
      />
      <p>
        Your streak counts the days in a row you’ve reviewed at least one card; see{' '}
        <DocLink slug="gamification" hash="streaks">
          streaks and freezes
        </DocLink>
        .
      </p>

      <H2 id="weekly">The weekly chest</H2>
      <p>
        Open a chest <strong>seven days in a row</strong> and the seventh is a weekly chest: it holds{' '}
        <strong>double the XP and coins</strong> of its tier, and it banks a <strong>streak freeze</strong> if you have room (you
        can hold two). The chest card shows seven slots so you can see how far along the run you are. Missing a day starts the run
        over, but nothing you’ve earned is taken away.
      </p>
      <Callout tone="tip" title="Streak freezes">
        A freeze covers a day you miss, so your study streak survives. The weekly chest is how you earn more of them.
      </Callout>

      <H2 id="coins">XP and coins</H2>
      <p>
        XP from the chest counts towards your level just like XP from answering cards (see{' '}
        <DocLink slug="levels">levels and XP</DocLink>). Coins are a score you collect: you also earn them from{' '}
        <DocLink slug="daily-quests">daily quests</DocLink>, from reaching your daily goal and from the occasional lucky find
        while studying. There’s nothing to spend them on yet.
      </p>
    </>
  ),
  faq: [
    {
      q: 'What is the daily chest in Askesis?',
      a: 'A reward you can open once per study day on your dashboard. It holds random XP and coins, and its tier (bronze, silver, gold or diamond) grows with your study streak.',
    },
    {
      q: 'Do I have to study before opening the daily chest?',
      a: 'No. You can open it as soon as your study day starts; studying keeps your streak going, which makes future chests better.',
    },
    {
      q: 'When does the daily chest reset?',
      a: 'When your study day rolls over: 4 AM in your time zone by default, configurable in Settings.',
    },
    {
      q: 'What is a weekly chest?',
      a: 'The seventh chest in a row. It holds double the XP and coins of its tier and banks a streak freeze if you have room for one.',
    },
    {
      q: 'What happens if I miss a day?',
      a: 'Your run of chests starts over at day one, but you keep everything you have already earned.',
    },
    {
      q: 'What are coins for?',
      a: 'For now coins are a score you collect from chests, quests, daily goals and lucky finds. There is no shop.',
    },
  ],
}

// ── Daily quests ──────────────────────────────────────────────────────────────

const dailyQuests: DocPage = {
  slug: 'daily-quests',
  title: 'Daily quests',
  summary:
    'The six small goals you get each day: which quests exist, how targets are chosen, how to claim rewards and the all-quests bonus.',
  section: 'More',
  icon: Scroll,
  headings: [
    { id: 'what', label: 'What are daily quests?' },
    { id: 'pool', label: 'The quests' },
    { id: 'targets', label: 'How targets are chosen' },
    { id: 'claim', label: 'Claiming rewards' },
  ],
  body: () => (
    <>
      <H2 id="what">What are daily quests?</H2>
      <p>
        Every study day you get <strong>six small goals</strong>, such as reviewing a number of cards or studying for a few
        minutes. Finish one and claim it for <strong>XP and coins</strong>; claim all six for a bonus. They’re suggestions that
        fit into a normal session, never a grind.
      </p>

      <H2 id="pool">The quests</H2>
      <p>“Review cards” is always one of the six; the other five are picked from this pool:</p>
      <Table
        head={['Quest', 'Typical targets', 'Reward']}
        rows={[
          ['Review cards', '80, 100, 120 or 150 answers', '40 XP · 15 coins'],
          ['Learn new cards', '10, 15 or 20 new cards', '30 XP · 15 coins'],
          ['Study different decks', '2, 3 or 4 decks', '25 XP · 10 coins'],
          ['Study for some minutes', '10, 15 or 20 minutes', '35 XP · 15 coins'],
          ['Answer cards right', '40, 60 or 80 answers other than Again', '35 XP · 15 coins'],
          ['Earn XP from reviews', '300, 500 or 800 XP', '30 XP · 20 coins'],
          ['Review mature cards', '15, 25 or 40 cards with an interval of 21+ days', '30 XP · 15 coins'],
          ['Review young cards', '20, 30 or 50 cards with an interval under 21 days', '30 XP · 15 coins'],
          ['Answer in a row without Again', 'A run of 15, 25 or 40', '35 XP · 15 coins'],
          ['Answer right in under 5 seconds', '20, 40 or 60 quick correct answers', '30 XP · 15 coins'],
        ]}
      />
      <p>
        Claim all six in one day for a bonus of <strong>50 XP and 30 coins</strong>. On a wide screen the quest card scrolls, so
        all six fit beside your decks.
      </p>

      <H2 id="targets">How targets are chosen</H2>
      <p>
        The quests are picked from the date, so everyone’s mix changes daily, and each target is capped at what your cards allow
        today. A small collection with twelve cards due gets “Review 10 cards”, not an impossible 150. Once you’ve seen the day’s
        quests they’re saved, so the targets stay the same all day even as new learning steps add reviews.
      </p>

      <H2 id="claim">Claiming rewards</H2>
      <p>
        When a quest is done, its row shows a <strong>Claim</strong> button. Rewards are claimed by hand so you notice them; each
        quest can be claimed once, and unclaimed rewards expire when the study day rolls over (4 AM by default). Quest XP counts
        towards your <DocLink slug="levels">level</DocLink>; coins add to the balance on your{' '}
        <DocLink slug="daily-chest">daily chest</DocLink> card.
      </p>
    </>
  ),
  faq: [
    {
      q: 'What are daily quests in Askesis?',
      a: 'Six small study goals each day, like reviewing a number of cards or studying for some minutes. Each pays XP and coins when you claim it, and claiming all six pays a bonus.',
    },
    {
      q: 'How are quest targets decided?',
      a: 'Quests are picked from the date and every target is capped at what your cards allow that day, so a small collection never gets an impossible quest. The targets are fixed for the day once shown.',
    },
    {
      q: 'Do I have to claim quest rewards?',
      a: 'Yes. Finished quests show a Claim button; unclaimed rewards expire when the study day rolls over.',
    },
    { q: 'What is the all-quests bonus?', a: 'Claiming all six quests in one day adds 50 XP and 30 coins.' },
    { q: 'When do daily quests reset?', a: 'With your study day, at 4 AM in your time zone by default.' },
  ],
}

// ── Levels and XP ─────────────────────────────────────────────────────────────

const levels: DocPage = {
  slug: 'levels',
  title: 'Levels, XP and ranks',
  summary:
    'How you earn XP in Askesis, how much each level takes, the ten ranks from Spark to Engram, and how your streak boosts XP.',
  section: 'More',
  icon: TrendingUp,
  headings: [
    { id: 'what', label: 'What are levels?' },
    { id: 'xp', label: 'How to earn XP' },
    { id: 'curve', label: 'XP needed per level' },
    { id: 'ranks', label: 'Ranks' },
  ],
  body: () => (
    <>
      <H2 id="what">What are levels?</H2>
      <p>
        Your level measures how much studying you’ve put in. Every answer earns <strong>XP</strong> (experience points), and XP
        adds up into levels and ranks that never go down. It rewards showing up, not getting cards right: grading honestly is what
        makes spaced repetition work.
      </p>

      <H2 id="xp">How to earn XP</H2>
      <Table
        head={['For', 'XP']}
        rows={[
          [
            <>
              An answer of <Rating kind="hard">Hard</Rating>, <Rating kind="good">Good</Rating> or{' '}
              <Rating kind="easy">Easy</Rating>
            </>,
            '8',
          ],
          [
            <>
              An answer of <Rating kind="again">Again</Rating>
            </>,
            '4',
          ],
          ['Seeing a new card for the first time', '+4'],
          ['Reaching your daily goal', '+50'],
          ['Claiming a daily quest', '+25 to +40'],
          ['Claiming all of the day’s quests', '+50'],
          ['Opening the daily chest', '+20 to +160'],
        ]}
      />
      <p>
        Answer XP is multiplied by your <strong>streak</strong>: +1% per day in a row, up to ×1.5 at 50 days. Hard, Good and Easy
        pay the same, so there’s never a reason to grade generously.
      </p>

      <H2 id="curve">XP needed per level</H2>
      <p>
        Reaching level <em>n</em> takes 250 × (<em>n</em> − 1)² XP in total, so each level takes a little longer than the last:
      </p>
      <Table
        head={['Level', 'Total XP', 'Roughly']}
        rows={[
          ['2', '250', 'Your first session'],
          ['5', '4,000', 'A couple of weeks of daily study'],
          ['10', '20,250', 'A few months'],
          ['20', '90,250', 'About a year of steady reviews'],
          ['50', '600,250', 'Several years'],
          ['80', '1,560,250', 'The long haul'],
        ]}
      />

      <H2 id="ranks">Ranks</H2>
      <p>Your rank title changes at these levels, and the dashboard shows the next one to aim for:</p>
      <Table
        head={['From level', 'Rank']}
        rows={[
          ['1', 'Spark'],
          ['5', 'Neuron'],
          ['10', 'Dendrite'],
          ['15', 'Synapse'],
          ['20', 'Circuit'],
          ['30', 'Cortex'],
          ['40', 'Hippocampus'],
          ['50', 'Savant'],
          ['65', 'Polymath'],
          ['80', 'Engram'],
        ]}
      />
      <p>
        A level-up gets a short celebration. Trophies are a separate track for milestones; see{' '}
        <DocLink slug="gamification" hash="trophies">
          trophies
        </DocLink>
        .
      </p>
    </>
  ),
  faq: [
    {
      q: 'How do levels work in Askesis?',
      a: 'Every answer earns XP, and XP adds up into levels. Reaching level n takes 250 × (n − 1)² XP in total, and levels never go down.',
    },
    {
      q: 'How do I earn XP?',
      a: '8 XP for Hard, Good or Easy, 4 XP for Again, 4 extra the first time you see a card, plus bonuses for your daily goal, daily quests and the daily chest. Your streak multiplies answer XP by up to 1.5.',
    },
    { q: 'Does pressing Easy give more XP?', a: 'No. Hard, Good and Easy pay the same, so grading honestly never costs you XP.' },
    {
      q: 'What are the ranks?',
      a: 'Spark, Neuron, Dendrite, Synapse, Circuit, Cortex, Hippocampus, Savant, Polymath and Engram, reached at levels 1, 5, 10, 15, 20, 30, 40, 50, 65 and 80.',
    },
    { q: 'Can I lose levels?', a: 'No. XP only goes up; missing days can end your streak but never removes XP.' },
  ],
}

// ── Reminders ─────────────────────────────────────────────────────────────────

const reminders: DocPage = {
  slug: 'reminders',
  title: 'Reminders & installing the app',
  summary: 'Install Askesis on your phone or desktop and get one nudge a day, at the hour you choose.',
  section: 'More',
  icon: BellRing,
  headings: [
    { id: 'install', label: 'Install the app' },
    { id: 'reminders', label: 'Daily reminders' },
    { id: 'trouble', label: 'Troubleshooting' },
  ],
  body: () => (
    <>
      <H2 id="install">Install the app</H2>
      <p>Askesis is a progressive web app: install it and it opens in its own window, like a native app.</p>
      <Table
        head={['Device', 'How']}
        rows={[
          ['Chrome or Edge on desktop', 'Click the install icon in the address bar, or Settings → Reminders → Install app.'],
          ['Android (Chrome)', 'Menu → Install app (or Add to Home screen).'],
          ['iPhone and iPad (Safari)', 'Share → Add to Home Screen, then open Askesis from the home screen.'],
        ]}
      />

      <H2 id="reminders">Daily reminders</H2>
      <p>
        Turn reminders on in <strong>Settings → Reminders</strong>. Askesis then sends one push notification a day:
      </p>
      <ul>
        <li>
          At 6 AM by default. You can pick another hour, from 6 AM to 11 PM, or <strong>When my day resets</strong>: when your
          study day rolls over and new cards unlock (4 AM unless you changed it).
        </li>
        <li>In your time zone.</li>
        <li>With what’s due, an estimated time, and your streak.</li>
        <li>Only on days when something is due.</li>
      </ul>
      <p>
        Reminders are set per device: turn them on on each phone or browser you want nudged, and use <strong>Send a test</strong>{' '}
        to check one arrives. Tapping the notification opens your dashboard.
      </p>

      <H2 id="trouble">Troubleshooting</H2>
      <ul>
        <li>
          <strong>“Notifications are blocked”</strong>: allow notifications for the site in your browser settings, then reload.
        </li>
        <li>
          <strong>iPhone</strong>: push only works in the installed app (iOS 16.4 or later), not in a Safari tab.
        </li>
        <li>
          <strong>“Reminders aren’t configured on this server”</strong>: the server needs VAPID keys. See{' '}
          <DocLink slug="self-hosting" hash="push">
            Self-hosting
          </DocLink>
          .
        </li>
      </ul>
    </>
  ),
}

// ── Self-hosting ──────────────────────────────────────────────────────────────

const selfHosting: DocPage = {
  slug: 'self-hosting',
  title: 'Self-hosting & configuration',
  summary: 'Run Askesis yourself: setup, environment variables and push reminders.',
  section: 'More',
  icon: Server,
  headings: [
    { id: 'run', label: 'Run it locally' },
    { id: 'env', label: 'Environment variables' },
    { id: 'push', label: 'Push reminders' },
    { id: 'architecture', label: 'How it fits together' },
    { id: 'production', label: 'Production' },
  ],
  body: () => (
    <>
      <H2 id="run">Run it locally</H2>
      <Code
        code={`git clone https://github.com/Romflz/askesis-project.git
cd askesis-project
pnpm install
cp .env.example .env          # then set BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm db:up && pnpm db:push    # start Postgres in Docker, push the schema
pnpm dev                      # web on :3000, API on :4000`}
      />
      <p>
        You need pnpm 12 and Docker. Node is pinned in <C>package.json</C> and downloaded by pnpm. For local development,{' '}
        <C>pnpm db:push</C> applies schema changes straight to the database.
      </p>

      <H2 id="env">Environment variables</H2>
      <p>
        Everything lives in one <C>.env</C> at the repository root.
      </p>
      <Table
        head={['Variable', 'Purpose']}
        rows={[
          [<C>DATABASE_URL</C>, 'Postgres connection string.'],
          [<C>BETTER_AUTH_SECRET</C>, 'Secret for sessions, at least 32 characters.'],
          [<C>WEB_ORIGIN</C>, 'Public URL of the web app. Auth cookies are issued for it, so sign in on this origin.'],
          [
            <>
              <C>API_HOST</C>, <C>API_PORT</C>
            </>,
            'Where the API listens.',
          ],
          [<C>API_URL</C>, 'Where the web server reaches the API (server-side only).'],
          [
            <>
              <C>VAPID_PUBLIC_KEY</C>, <C>VAPID_PRIVATE_KEY</C>, <C>VAPID_SUBJECT</C>
            </>,
            'Optional. Enables daily push reminders.',
          ],
        ]}
      />

      <H2 id="push">Push reminders</H2>
      <Code code="pnpm --filter @askesis/api vapid   # prints a VAPID key pair for .env" />
      <p>
        Add the keys and a contact address (<C>VAPID_SUBJECT=mailto:you@example.com</C>) to <C>.env</C>, then restart the API. It
        checks every two minutes and sends each subscribed user one reminder per study day. Browsers only allow push and service
        workers over HTTPS (localhost is the exception).
      </p>

      <H2 id="architecture">How it fits together</H2>
      <Table
        head={['Part', 'Role']}
        rows={[
          [<C>apps/web</C>, 'TanStack Start: server-rendered pages, server functions, the PWA files.'],
          [<C>apps/api</C>, 'Fastify: REST endpoints, Better Auth, grading, imports and the reminder job.'],
          [<C>packages/core</C>, 'Scheduling (SM-2 and FSRS), dashboard stats, XP and trophies, CSV.'],
          [<C>packages/db</C>, 'Drizzle schema for Postgres.'],
          [<C>packages/contracts</C>, 'Zod schemas shared by web and API, including the default preset.'],
        ]}
      />
      <p>
        The browser only talks to the web app. Its server functions call the API with the user’s session cookie, and{' '}
        <C>/api/auth</C> is proxied to the API so cookies stay on one origin.
      </p>

      <H2 id="production">Production</H2>
      <ul>
        <li>
          Use versioned migrations instead of push: run <C>pnpm db:generate</C> with every schema change and commit the SQL in{' '}
          <C>packages/db/migrations</C>. The API applies pending migrations each time it starts, so a deploy updates the database
          by itself; <C>pnpm db:migrate</C> does the same on demand.
        </li>
        <li>
          <C>pnpm build</C> builds the web app with Nitro. Set <C>NITRO_PRESET</C> to target Node, Bun, Vercel, Netlify,
          Cloudflare and others.
        </li>
        <li>Serve both apps over HTTPS so sign-in cookies, the service worker and push work.</li>
      </ul>
    </>
  ),
}

// Reading order: prev/next links and the docs home follow it. Keep each section's pages together.
export const DOCS: DocPage[] = [
  gettingStarted,
  spacedRepetition,
  studying,
  customStudy,
  scheduling,
  workload,
  writingCards,
  formatting,
  decksAndTags,
  importExport,
  forAgents,
  stats,
  gamification,
  levels,
  dailyChest,
  dailyQuests,
  reminders,
  selfHosting,
]

export function findDoc(slug: string): DocPage | undefined {
  return DOCS.find((d) => d.slug === slug)
}
