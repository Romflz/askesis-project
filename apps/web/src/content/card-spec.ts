import { DEFAULT_PRESET, TAG_MAX } from '@askesis/contracts'
import { DECK_PATH_SEPARATOR, SCHEDULING_COLUMNS } from '@askesis/core'
import { PACKAGE_PROMPT } from './package-prompt.ts'

// The card file format and card syntax, written as one precise spec that AI
// agents (and people writing import scripts) can follow. It's served raw at
// /llms.txt and shown on /docs/for-ai-agents, so there's a single source.
// Limits mirror the zod contracts in @askesis/contracts (importRow / importInput).

const LIMITS = {
  front: 20_000,
  back: 20_000,
  hint: 2_000,
  extra: 20_000,
  tags: 50,
  tagLength: TAG_MAX,
  deckPath: 400,
  deckSegment: 80,
  rowsPerImport: 50_000,
  historyPerCard: 5_000,
}

const PROGRESS_COLUMNS = [...SCHEDULING_COLUMNS, 'history'].join(',')

// Fenced-code languages (and aliases) the card renderer highlights. Only list
// languages registered in components/askesis/CardText.tsx.
const LANGUAGES =
  'bash (sh, shell), c, cpp (c++), csharp (cs), css, dart, dockerfile (docker), elixir (ex, exs), go, graphql, haskell (hs), hcl, java, javascript (js), json, kotlin (kt), markdown (md), php, python (py), redis, ruby (rb), rust (rs), sql, swift, typescript (ts), vim, x86asm, xml/html, yaml (yml)'

// String.raw keeps the LaTeX and escaping examples' backslashes literal. A raw
// string can't hold a backtick, so those are spliced in as ${'`'}.
export const CARD_SPEC_MD =
  String.raw`# Askesis card files: a spec for AI agents

Askesis is an open-source spaced-repetition app with SM-2 and FSRS scheduling. This
document tells you exactly how to produce files that import cleanly and cards
that render correctly. Follow it literally.

## 1. Quick rules (checklist)

1. Output a UTF-8 CSV file. Start with these five header lines, exactly:

       #separator:comma
       #html:false
       #columns:deck,front,back,hint,extra,tags
       #deck column:1
       #tags column:6

2. Then one card per line with 6 fields: deck, front, back, hint, extra, tags.
3. Quote a field with double quotes if it contains a comma, a double quote, a
   line break, or leading/trailing spaces. Inside quotes, write a double quote
   as two double quotes (""). Quoting every field is always valid and is the
   safest choice. Watch out: LaTeX often contains commas (\, thin space,
   f(x, y), \{1, 2\}) and so do lists and code.
4. Deck = full path with "${DECK_PATH_SEPARATOR}" between levels, e.g. Medical${DECK_PATH_SEPARATOR}Cells.
5. Tags = space-separated words, no spaces inside a tag, e.g. "cell biology" is two tags.
   Nest tags with "${DECK_PATH_SEPARATOR}", e.g. biology${DECK_PATH_SEPARATOR}cells${DECK_PATH_SEPARATOR}organelles.
6. Front is required. Keep each card to one fact (minimum information principle).
7. Math: \( … \) inline, \[ … \] display. Code: fenced blocks with a language.
8. Backslashes are literal in CSV. Write \frac, not \\frac.
9. Never emit HTML. Use the light markup in section 6.

## 2. File structure

- Encoding: UTF-8. A leading byte-order mark is allowed and ignored.
- Line endings: LF or CRLF.
- Optional **header lines** come first, one per line, each "#key:value".
  Parsing of header lines stops at the first line that isn't one.
- Then data rows (RFC 4180 style): fields separated by the separator; a field
  may be wrapped in double quotes; inside a quoted field, "" is a literal
  quote and line breaks are allowed. Blank lines are ignored.

### Header lines

| Line | Values | Meaning |
|---|---|---|
| #separator:NAME | comma, tab, semicolon, pipe (or the literal character) | Field separator. If absent, it's detected from the first lines. |
| #html:BOOL | true, false | true = fields are HTML and get converted to plain text (section 8). Use false. |
| #columns:a,b,c | column names (section 3) | Names each column, in order. |
| #deck column:N | 1-based number | Column holding the deck path. |
| #tags column:N | 1-based number | Column holding space-separated tags. |

These are the header lines common flashcard apps use for text import and
export, so files move between those apps and Askesis.

Without #columns, a first data row made of known column names (e.g.
"Front,Back,Tags") is treated as a header row. With no names at all, column 1
is the front and column 2 is the back.

## 3. Columns

| Column | Accepted names | Required | Max length | Notes |
|---|---|---|---|---|
| deck | deck | no | ${LIMITS.deckPath} chars | Deck path, "Parent${DECK_PATH_SEPARATOR}Child${DECK_PATH_SEPARATOR}Grandchild". Empty = the import's default deck. |
| front | front, question, term, word | **yes** | ${LIMITS.front} | The prompt. Rows with an empty front are skipped. |
| back | back, answer, definition, meaning | no | ${LIMITS.back} | The answer. |
| hint | hint, reading | no | ${LIMITS.hint} | Small line under the front (e.g. a reading). |
| extra | extra, notes, note | no | ${LIMITS.extra} | Shown under the answer: context, mnemonics, sources. |
| tags | tags, tag | no | ${LIMITS.tags} tags × ${LIMITS.tagLength} chars | Separated by spaces. "parent${DECK_PATH_SEPARATOR}child" nests a tag under another. |

Column names are case-insensitive. Unknown columns are ignored.
Optional progress and history columns (for backups) are listed in section 7. Exports from other apps are covered in sections 8–9.

Tags nest: a card tagged "lang${DECK_PATH_SEPARATOR}spanish${DECK_PATH_SEPARATOR}verbs" is found when studying
or filtering by "lang" or "lang${DECK_PATH_SEPARATOR}spanish" (matching ignores case), and renaming or
deleting a parent tag also renames or removes the tags below it.

## 4. Decks and subdecks (grouping)

- Decks nest: "Medical${DECK_PATH_SEPARATOR}Cells", "Medical${DECK_PATH_SEPARATOR}Plants${DECK_PATH_SEPARATOR}Trees".
- Every level in a path is created if missing. Each level's name: 1–${LIMITS.deckSegment} chars, no "${DECK_PATH_SEPARATOR}".
- Matching is by full path, **case-insensitive**, with spaces around "${DECK_PATH_SEPARATOR}" and repeated
  spaces ignored: "medical :: cells" matches "Medical${DECK_PATH_SEPARATOR}Cells".
- Importing into an existing deck **merges**: cards are added; nothing is ever deleted.
- Studying a parent deck includes all its subdecks.

## 5. Duplicates and updates

A duplicate is a card in the **same deck** whose front matches after trimming
and collapsing whitespace (case-sensitive). The importer offers three modes:

| Mode | What happens to a duplicate |
|---|---|
| update (default) | back is replaced; hint and extra are replaced only if the file has those columns; tags are merged; review history is kept; progress and history from the file follow section 7 |
| skip | left alone (the file's progress and history are ignored too) |
| duplicate | imported as an additional card |

Rows inside one file that share a deck and front are treated the same way
(the later row updates the earlier one in update mode). To update a deck
safely, re-export it, edit, and re-import with mode "update".

## 6. Card text syntax

Fields are plain text with light markup. HTML is never rendered.

### Math (KaTeX, MathJax-style delimiters)

| Write | Renders as |
|---|---|
| \( e^{i\pi} + 1 = 0 \) | inline math |
| \[ \int_0^1 x^2\,dx = \tfrac{1}{3} \] | display math (own line, centered) |
| $a^2 + b^2 = c^2$ | inline math |
| $$\sum_{k=1}^{n} k = \frac{n(n+1)}{2}$$ | display math |

- Prefer \( … \) and \[ … \]. They're unambiguous and the most portable.
- A single $…$ is math only when there's no space just inside the dollars and
  the closing $ isn't followed by a digit, so "$5 and $10" stays text.
  Write \$ for a literal dollar sign.
- KaTeX supports most of LaTeX math mode: \frac, \sqrt, \sum, \int, \lim,
  \mathbf, \mathrm, \text, \begin{pmatrix}…\end{pmatrix}, \begin{aligned}…\end{aligned}.
- Not supported: chemistry packages (\ce, mhchem), \usepackage, text-mode
  environments, macros you define. For chemistry write \mathrm{H_2O},
  \mathrm{CO_2}, \rightarrow, \rightleftharpoons.
- Invalid LaTeX is shown as its source, so the card still imports.

### Code

Fenced block, with an optional language after the opening fence:

    ${'```'}python
    squares = [n * n for n in range(10)]
    ${'```'}

- Highlighted languages: ${LANGUAGES}.
  Without a language the renderer guesses from that list.
- Inline code: single backticks, e.g. ${'`'}Vec<T>${'`'}. Text inside backticks is
  literal (no math, no bold).
- Inside a CSV field, a fenced block needs real line breaks, so the field
  must be quoted (and code usually contains commas anyway).

### Text styling

| Write | Result |
|---|---|
| **bold** | bold |
| *italic* or _italic_ | italic |
| a line break | kept as a line break |

## 7. Progress and history columns (optional: for backups and migrations)

Append these columns, in this order, after tags: ${[...SCHEDULING_COLUMNS, 'history'].join(', ')}.
The #columns line then reads:

    #columns:deck,front,back,hint,extra,tags,${PROGRESS_COLUMNS}

Leave all of them empty (or leave the columns out) for a new, unstudied card.
When you generate new cards, don't add them at all.

| Column | Type | Meaning |
|---|---|---|
| state | 0, 1, 2 or 3 | 0 new, 1 learning, 2 review, 3 relearning |
| due | ISO 8601 date-time | when the card is next due, e.g. 2026-10-16T04:00:00.000Z |
| interval | integer days, 0–36500 | current interval (0 while learning) |
| ease | number, e.g. 2.5 | SM-2 ease factor (2.5 = 250%); 0 if never graduated |
| stability | number ≥ 0 | FSRS memory stability (days); 0 if unknown |
| difficulty | number 0–10 | FSRS difficulty; 0 if unknown |
| step | integer 0–100 or empty | position in the learning or relearning steps (0 = first step); empty = 0 |
| reps | integer ≥ 0 | times reviewed |
| lapses | integer ≥ 0 | times forgotten |
| last_review | ISO 8601 date-time or empty | last answer |
| suspended | 1 or empty | 1 = suspended (excluded from study) |
| history | text, see below | past answers, oldest first; empty = none |

A row is treated as scheduled only if state is 0–3 and due is a valid date.
The history column is read either way.

### History format

Past answers, oldest first, separated by ";". Each answer is up to eight
space-separated values. Only the first two (time and rating) are required:

    <time> <rating> <ms> <state before> <state after> <interval before> <interval after> <ease after>

| Value | Type | Meaning |
|---|---|---|
| time | ISO 8601 date-time | when the answer was given |
| rating | 1, 2, 3 or 4 | 1 Again, 2 Hard, 3 Good, 4 Easy |
| ms | integer 0–3600000 | time spent on the card, in milliseconds |
| state before, state after | 0, 1, 2 or 3 | the card's state before and after the answer (as in the state column) |
| interval before, interval after | integer days, 0–36500 | the card's interval before and after the answer |
| ease after | number 0–10 | ease factor after the answer (2.5 = 250%); 0 if unknown |

Missing values default to 0, except the two states, which default to 2
(review). An answer with an invalid time or rating is skipped. Up to
${LIMITS.historyPerCard.toLocaleString('en-US')} answers per card. Example: a new card answered Good twice,
ten minutes apart, graduating to a 1-day interval:

    2026-03-01T09:12:00Z 3 5200 0 1 0 0 0;2026-03-01T09:22:40Z 3 3100 1 2 0 1 2.5

The field contains no commas, so it needs no quotes in a comma-separated
file. In a semicolon-separated file it must be quoted.

### How progress and history import

- Cards that don't exist yet are added with the file's progress. Cards that
  are new in the file (state 0, or no progress) stay new.
- For an existing card (same deck and front, update mode), the file's
  progress is applied only when its last_review is newer than the card's own,
  so restoring an old backup never rolls back newer study.
- History is merged into the review log without duplicates: an answer for
  the same card at the same timestamp (to the millisecond) is skipped, so
  importing a backup twice is safe.
- Imported history restores the heatmap, streaks, XP, trophies and stats.
  Imported answers can't be undone in a study session.
- The import result reports "Progress kept for N cards" and "N past reviews
  restored".

## 8. Plain-text files from other apps (.txt)

A plain-text notes export (.txt) from another flashcard app is a tab-separated
file that imports directly. It may start with header lines like:

    #separator:tab
    #html:true
    #guid column:1
    #notetype column:2
    #deck column:3
    #tags column:6

- The GUID and note type columns are skipped. The first two remaining fields
  become front and back; a third field (e.g. Basic's "Back Extra") becomes extra.
- **Cloze notes** become one card per deletion: {{c1::answer}} or
  {{c1::answer::hint}}. The front hides that deletion as […] (or [hint]) and
  shows the others; the back shows the answer in bold. The note's second field
  goes to extra.
- To export for another app, choose "Plain text (.txt)" in Askesis: a
  tab-separated file with #columns, #deck column and #tags column, which apps
  that read these header lines can import.
- .apkg and .colpkg packages can't be imported directly yet. Convert them
  with the script in the appendix (keeps each card's progress, and turns
  the package's review log into the history column; step is left empty).

## 9. HTML input (from other apps' exports)

With #html:true, each field is converted to plain text: <br>, </div>, </p>
and </li> become line breaks; <li> becomes "• "; <b>/<strong> become **bold**;
<i>/<em> become *italic*; [sound:…] and <img> references are dropped
(media isn't imported); the [latex], [$] and [$$] tags some apps use become
math: [$]…[/$] becomes \( … \), and [$$]…[/$$] and [latex]…[/latex] become
\[ … \]; entities (&amp;, &#39;, …) are decoded; all other tags are removed.

## 10. Limits

- Up to ${LIMITS.rowsPerImport.toLocaleString('en-US')} cards per import request (the web importer splits bigger files).
- Field lengths as in section 3. Tags: up to ${LIMITS.tags} per card, ${LIMITS.tagLength} chars each.
- History: up to ${LIMITS.historyPerCard.toLocaleString('en-US')} past answers per card.

## 11. Writing good cards (what to generate)

- One fact per card; short fronts that have exactly one right answer.
- Put the cue on the front and the answer on the back; use hint for readings
  or categories and extra for context or a mnemonic.
- Prefer several small cards over one list card ("Name all 7 …").
- Use subdecks for topics (Medical${DECK_PATH_SEPARATOR}Cells) and tags for cross-cutting labels (exam-1, hard).
- Don't create duplicates of the same front inside one deck.

## 12. Examples

### Vocabulary with readings, nested decks and tags

    #separator:comma
    #html:false
    #columns:deck,front,back,hint,extra,tags
    #deck column:1
    #tags column:6
    Japanese::Kanji,脳,brain,のう,On: ノウ,kanji n3 body
    Japanese::Vocabulary,覚える,to remember; to memorize,おぼえる,,verbs n4
    Medical::Cells,What organelle makes most of a cell's ATP?,The mitochondrion,,,cell-biology
    Medical::Plants,Where does photosynthesis happen?,In the chloroplasts,,,plants

### Math, code and quoting

    #separator:comma
    #html:false
    #columns:deck,front,back,hint,extra,tags
    #deck column:1
    #tags column:6
    Math::Calculus,Derivative of \(\sin x\)?,\(\cos x\),,,derivatives
    Math::Calculus,State the power rule.,"\[\frac{d}{dx}x^n = n\,x^{n-1}\]",,Holds for any real n.,derivatives
    "Programming::Python","What does this print?
    ${'```'}python
    print([n * n for n in range(4)])
    ${'```'}","${'`'}[0, 1, 4, 9]${'`'}",,,comprehensions
    Physics,"Who said ""Imagination is more important than knowledge""?",Albert Einstein,,,quotes

### Tab-separated, no header lines (front, back)

    Mitochondrion	Powerhouse of the cell
    Ribosome	Builds proteins

### Backup with progress and history

Row 1 is a review card with its full history, row 2 is in its learning steps
(step 1), row 3 is new, and row 4 is a suspended FSRS card whose history only
gives time and rating.

    #separator:comma
    #html:false
    #columns:deck,front,back,hint,extra,tags,${PROGRESS_COLUMNS}
    #deck column:1
    #tags column:6
    Spanish::Verbs,aprovechar,to make the most of,,,verbs b2,2,2026-03-05T09:30:00.000Z,3,2.5,0,0,0,3,0,2026-03-02T09:30:00.000Z,,2026-03-01T09:12:00Z 3 5200 0 1 0 0 0;2026-03-01T09:22:40Z 3 3100 1 2 0 1 2.5;2026-03-02T09:30:00Z 3 2800 2 2 1 3 2.5
    Spanish::Verbs,acertar,to get right; to guess correctly,,,verbs,1,2026-03-02T09:50:00.000Z,0,0,0,0,1,1,0,2026-03-02T09:40:00.000Z,,2026-03-02T09:40:00Z 3 4100 0 1 0 0 0
    Spanish::Verbs,soler,to usually do something,,,verbs,,,,,,,,,,,,
    Medical::Cells,What organelle makes most of a cell's ATP?,The mitochondrion,,,cell-biology,2,2026-05-20T08:00:00.000Z,30,2.5,31.2,5.1,0,6,1,2026-04-20T08:00:00.000Z,1,2026-03-20T08:00:00Z 1;2026-04-20T08:00:00Z 3

## 13. Defaults you can rely on

New decks use the account's default preset, which starts with these standard
values: learning steps ${DEFAULT_PRESET.learningSteps.join(' ')}, graduating interval ${DEFAULT_PRESET.graduatingInterval} day,
easy interval ${DEFAULT_PRESET.easyInterval} days, ${DEFAULT_PRESET.newPerDay} new cards per day, ${DEFAULT_PRESET.reviewsPerDay} reviews per day.

## Appendix: converting flashcard packages (.apkg / .colpkg)

Askesis can't read these packages directly yet. To convert one, run the script
below with the package (or give this section and the file to an AI that can run
Python). It writes one row per card with progress and review history,
following the rules above.

` +
  PACKAGE_PROMPT +
  '\n'
