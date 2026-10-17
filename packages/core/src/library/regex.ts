import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

// Patterns sit in `inline code` or fenced blocks so * and $ are never read as
// markdown or math by the card renderer.

const js = (...lines: string[]) => code('js', ...lines)

const CARDS: CardContent[] = [
  { front: 'What do `^` and `$` match?', back: 'The start and the end of the input (of each line with the `m` flag)' },
  {
    front: 'What does `\\b` match?',
    back: 'A word boundary: a position between a word character and a non-word character (or the edge)',
  },
  {
    front: '`\\d`, `\\w`, `\\s`',
    back: 'A digit, a word character (`[A-Za-z0-9_]`), whitespace',
    extra: 'Uppercase versions (`\\D`, `\\W`, `\\S`) match the opposite.',
  },
  {
    front: 'What does `.` match?',
    back: 'Any character except a line break',
    extra: 'With the `s` (dotAll) flag it matches line breaks too.',
  },
  { front: 'What does `[^abc]` match?', back: 'Any single character except `a`, `b` or `c`' },
  { front: 'Match one lowercase letter or a digit', back: '`[a-z0-9]`' },
  {
    front: 'How do you match a literal `-` inside a character class?',
    back: 'Put it first or last, or escape it: `[-a-z]`, `[a-z-]`, `[a-z\\-]`',
  },
  { front: '`*`, `+`, `?`', back: 'Zero or more, one or more, zero or one' },
  { front: '`{3}`, `{2,}`, `{2,5}`', back: 'Exactly 3, at least 2, between 2 and 5 (inclusive)' },
  { front: 'Greedy vs lazy quantifiers', back: 'Greedy (`.*`) matches as much as possible; lazy (`.*?`) as little as possible' },
  {
    front: 'What does `<.+>` match in `<b>bold</b>`, and how do you match just `<b>`?',
    back: 'The whole string `<b>bold</b>` (greedy). Use `<.+?>` or `<[^>]+>`',
  },
  { front: 'Capturing group vs non-capturing group', back: '`(abc)` captures the match for later use; `(?:abc)` only groups' },
  { front: 'Named capture group', back: '`(?<year>\\d{4})`, read as `match.groups.year` in JavaScript' },
  {
    front: 'What does `\\1` mean inside a pattern?',
    back: 'A backreference: the same text the first group matched',
    extra: '`(\\w)\\1` matches doubled letters like `ll` or `oo`.',
  },
  { front: 'Backreference to a named group', back: '`\\k<name>`, e.g. `(?<q>[\'"]).*?\\k<q>` matches a quoted string' },
  {
    front: 'What does `cat|dog` match?',
    back: 'Either `cat` or `dog`',
    extra: 'Alternation has the lowest precedence: `^cat|dog$` means `(^cat)|(dog$)`.',
  },
  { front: 'Positive lookahead', back: '`x(?=y)` matches `x` only if `y` follows, without consuming `y`' },
  { front: 'Negative lookahead', back: '`x(?!y)` matches `x` only if `y` does not follow' },
  { front: 'Lookbehind', back: '`(?<=\\$)\\d+` matches digits preceded by a dollar sign; `(?<!…)` is the negative form' },
  {
    front: 'Password check: at least one digit and 8+ characters, using lookahead',
    back: '`^(?=.*\\d).{8,}$`',
  },
  { front: 'The `g` flag', back: 'Global: find all matches instead of stopping at the first' },
  { front: 'The `i` flag', back: 'Case-insensitive matching' },
  { front: 'The `m` flag', back: 'Multiline: `^` and `$` match at line breaks, not only at the ends of the input' },
  { front: 'The `s` flag', back: 'dotAll: `.` also matches line breaks' },
  {
    front: 'The `u` and `v` flags',
    back: 'Unicode mode: correct handling of code points and `\\p{…}` property escapes; `v` adds set operations',
  },
  { front: 'The `y` flag', back: 'Sticky: the match must start exactly at `lastIndex`' },
  { front: 'Match any letter in any script', back: '`\\p{L}` with the `u` flag, e.g. `/\\p{L}+/u`' },
  {
    front: 'Which characters need escaping outside a class?',
    back: '`. * + ? ^ $ { } ( ) | [ ] \\ /` (the slash only in a `/…/` literal)',
  },
  {
    front: 'Escape user input for use in a RegExp',
    back: js("const escaped = input.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')", 'new RegExp(escaped)'),
    extra: 'Newer runtimes also have `RegExp.escape(input)`.',
  },
  {
    front: 'Trim leading and trailing whitespace',
    back: '`^\\s+|\\s+$` with the `g` flag, replaced by an empty string',
    extra: 'In JavaScript just use `str.trim()`.',
  },
  {
    front: 'Match an ISO date like 2026-10-15',
    back: '`^\\d{4}-\\d{2}-\\d{2}$`',
    extra: 'This checks the shape only; it accepts 2026-13-40.',
  },
  {
    front: 'A pragmatic email check',
    back: '`^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$`',
    extra: 'Fully validating email by regex is impractical; send a confirmation link instead.',
  },
  { front: 'Collapse runs of whitespace into one space', back: js("text.replace(/\\s+/g, ' ')") },
  {
    front: 'Get every match with its groups',
    back: js(
      'for (const m of text.matchAll(/(?<key>\\w+)=(?<value>\\w+)/g)) {',
      '  console.log(m.groups.key, m.groups.value)',
      '}',
    ),
    extra: '`matchAll` requires the `g` flag.',
  },
  {
    front: 'Reorder a date with capture groups in `replace`',
    back: js("'2026-10-15'.replace(/(\\d+)-(\\d+)-(\\d+)/, '$3/$2/$1') // '15/10/2026'"),
  },
  { front: 'Use a named group in a replacement string', back: "`$<name>`, e.g. `.replace(/(?<user>\\w+)@/, '$<user> at ')`" },
  { front: 'What does `$&` mean in a replacement?', back: 'The whole matched text' },
  {
    front: '`test` vs `match` vs `exec`',
    back: '`test` returns a boolean; `str.match` returns matches; `exec` returns one match with groups and advances `lastIndex` with `g`',
  },
  {
    front: 'Why does a `g` regex reused with `test()` alternate true and false?',
    back: 'It keeps `lastIndex` between calls, so the next search starts after the previous match',
    extra: 'Drop the `g` flag for yes/no checks, or reset `lastIndex = 0`.',
  },
  { front: 'Split on commas with optional spaces', back: js("'a, b,c'.split(/\\s*,\\s*/) // ['a', 'b', 'c']") },
  {
    front: 'What is catastrophic backtracking?',
    back: 'Exponential running time when nested quantifiers can match the same text in many ways, as in `(a+)+$` against `aaaa…b`',
  },
  {
    front: 'How do you avoid catastrophic backtracking?',
    back: 'Avoid nested quantifiers over overlapping text, make alternatives mutually exclusive, and prefer specific classes like `[^"]*` over `.*`',
  },
  {
    front: 'Atomic groups and possessive quantifiers',
    back: '`(?>…)` and `a++` never give back what they matched, preventing backtracking',
    extra: 'Supported by PCRE, Java and .NET; JavaScript has no possessive quantifiers.',
  },
  {
    front: 'What does `\\B` match?',
    back: 'A position that is not a word boundary',
    extra: '`\\Bcat\\B` finds `cat` inside `concatenate` but not the word `cat`.',
  },
  { front: 'Whole-word search for `cat`', back: '`\\bcat\\b`' },
  { front: 'Match a hex color like #1a2B3c', back: '`^#(?:[0-9a-fA-F]{3}){1,2}$`', extra: 'Accepts the 3- and 6-digit forms.' },
  { front: 'Match an empty line', back: '`^$` with the `m` flag' },
  {
    front: 'POSIX character class for digits',
    back: '`[[:digit:]]`',
    extra: 'Used by grep, sed and awk; JavaScript doesn’t support POSIX classes.',
  },
  {
    front: 'grep: basic vs extended regex',
    back: 'In basic (default) mode `+ ? | { } ( )` need backslashes; `grep -E` treats them as operators',
  },
  {
    front: 'Which regex flavors allow lookbehind of any length?',
    back: 'JavaScript and .NET; Python’s `re` needs a fixed length and PCRE a bounded one',
  },
]

export const REGEX: PublicDeck = {
  slug: 'regex',
  title: 'Regex flashcards: 50 patterns and concepts',
  shortTitle: 'Regex',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'Learn regular expressions for good: anchors, classes, greedy vs lazy quantifiers, groups, lookarounds, flags, replacements and the backtracking trap.',
  intro:
    'Fifty cards that take regular expressions from copy-paste to fluent: character classes and anchors, quantifiers, capture and named groups, lookarounds, every JavaScript flag, `matchAll` and replacement tokens, plus the patterns you reach for weekly and the backtracking trap to avoid. Examples use JavaScript syntax, with notes where grep and PCRE differ.',
  faq: [
    {
      q: 'Which regex flavor does this deck use?',
      a: 'JavaScript, which is close to PCRE. Cards point out where grep, PCRE and Python behave differently.',
    },
    {
      q: 'Do I need to know a programming language?',
      a: 'No for most cards. A few show JavaScript methods such as replace and matchAll.',
    },
    {
      q: 'Can regex validate an email address?',
      a: 'Only roughly. The deck includes a pragmatic pattern and explains why a confirmation email is the real test.',
    },
  ],
  cards: CARDS,
}
