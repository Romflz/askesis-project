import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

// Keys are written as you type them in Normal mode; `Ctrl-r` means hold Ctrl and press r.

const CARDS: CardContent[] = [
  // Modes and inserting
  {
    front: 'Vim’s main modes',
    back: 'Normal mode for commands and moving around, Insert mode for typing text, Visual mode for selecting, and Command-line mode for `:` commands',
    extra: 'Vim starts in Normal mode.',
  },
  {
    front: 'How do you get back to Normal mode?',
    back: 'Press `Esc` (or `Ctrl-[`)',
  },
  {
    front: '`i` vs `a`',
    back: '`i` starts inserting before the cursor; `a` starts inserting (appending) after it',
  },
  {
    front: 'Start inserting at the beginning or the end of the line',
    back: '`I` inserts before the first non-blank character of the line; `A` appends at the end of the line',
  },
  {
    front: '`o` vs `O`',
    back: '`o` opens a new line below the cursor and enters Insert mode; `O` opens one above',
  },
  // Saving and quitting
  {
    front: '`:w`, `:q`, `:wq` and `:q!`',
    back: 'Write (save); quit; write and quit; quit and throw away unsaved changes',
    extra: '`ZZ` (like `:x`) saves only if there are changes, then quits.',
  },
  {
    front: 'Quit every window at once, discarding all changes',
    back: '`:qa!`',
    extra: '`:wqa` saves every changed buffer and quits instead.',
  },
  // Motions
  {
    front: '`h`, `j`, `k`, `l`',
    back: 'Move left, down, up and right',
  },
  {
    front: '`w`, `b`, `e`',
    back: '`w` moves to the start of the next word, `b` back to the start of the current or previous word, and `e` to the end of the current or next word',
  },
  {
    front: '`w` vs `W`',
    back: '`w` moves by words, where a run of punctuation counts as a separate word; `W` moves by WORDs, which are any characters up to the next whitespace',
    extra: 'On `foo.bar(x)`, `w` stops at `.`, then `bar`, then `(`, while `W` jumps past all of it.',
  },
  {
    front: '`0`, `^` and `$`',
    back: 'The first column of the line, the first non-blank character, and the end of the line',
  },
  {
    front: '`gg` and `G`',
    back: '`gg` goes to the first line and `G` to the last; `42G` or `:42` goes to line 42',
  },
  {
    front: '`f` vs `t`',
    back: '`fx` moves onto the next `x` on the line; `tx` stops just before it. `F` and `T` search backward',
    extra: '`;` repeats the last `f`/`t` search and `,` repeats it in the opposite direction.',
  },
  {
    front: 'What does `%` do?',
    back: 'Jumps to the matching bracket: `(` and `)`, `[` and `]`, or `{` and `}`',
  },
  {
    front: 'How do counts work with motions?',
    back: 'A number before a motion repeats it: `3w` moves three words and `5j` five lines down',
    extra: 'Counts work with operators too: `d3w` deletes three words.',
  },
  {
    front: '`Ctrl-d` and `Ctrl-u`',
    back: 'Scroll half a screen down and half a screen up',
    extra: '`Ctrl-f` and `Ctrl-b` scroll a full screen forward and back.',
  },
  // Operators
  {
    front: 'How do operators combine with motions?',
    back: 'An operator such as `d` (delete), `c` (change) or `y` (yank, which copies) followed by a motion acts on the text the motion covers: `dw` deletes to the next word, `c$` changes to the end of the line',
  },
  {
    front: '`dd`, `cc` and `yy`',
    back: 'Doubling an operator makes it act on the whole line: delete the line, change the line, copy the line',
  },
  {
    front: '`D` and `C`',
    back: 'Delete or change from the cursor to the end of the line, the same as `d$` and `c$`',
  },
  {
    front: '`x` vs `r`',
    back: '`x` deletes the character under the cursor; `r` followed by a character replaces it without leaving Normal mode',
  },
  {
    front: '`p` vs `P`',
    back: '`p` puts (pastes) after the cursor, or below the line for whole lines; `P` puts before the cursor, or above the line',
  },
  {
    front: 'Swap the current line with the one below',
    back: '`ddp`: delete the line, then put it below the next one',
  },
  {
    front: 'What does `dt,` do?',
    back: 'Deletes from the cursor up to, but not including, the next comma on the line',
  },
  {
    front: 'Undo and redo',
    back: '`u` undoes the last change; `Ctrl-r` redoes it',
  },
  {
    front: 'What does `.` do?',
    back: 'Repeats the last change, such as a `dw`, a `ciw` with what you typed, or an `A;`',
    extra: 'Combined with `n` it gives a quick search-and-change loop: change once, then `n.` to repeat.',
  },
  // Text objects
  {
    front: 'What are text objects?',
    back: 'Selections you use after an operator or in Visual mode: `i` (inner) takes just the contents, `a` (“a”) includes the surrounding whitespace, quotes or brackets',
  },
  {
    front: '`ciw` vs `caw`',
    back: '`ciw` changes the word under the cursor; `caw` also takes the whitespace around it, usually the space after the word',
    extra: 'Both work anywhere in the word, unlike `cw`, which starts at the cursor.',
  },
  {
    front: 'What does `ci"` do?',
    back: 'Changes the text between the double quotes and keeps the quotes; if the cursor is before them, it uses the next quoted string on the line',
  },
  {
    front: 'Delete everything inside the curly braces around the cursor',
    back: '`di{` (or `di}`)',
    extra: '`da{` deletes the braces too. The same works with `(`, `[` and `<`.',
  },
  {
    front: 'What does `cit` do?',
    back: 'Changes the text inside the HTML or XML tag around the cursor, keeping the tags',
  },
  {
    front: 'What does `dap` do?',
    back: 'Deletes the paragraph around the cursor, together with the blank lines after it',
  },
  // Search
  {
    front: '`/pattern` vs `?pattern`',
    back: '`/` searches forward and `?` backward; `n` jumps to the next match in the same direction, `N` in the opposite one',
  },
  {
    front: '`*` and `#`',
    back: 'Search forward or backward for the whole word under the cursor',
  },
  {
    front: 'Search without matching case',
    back: 'Add `\\c` to the pattern for one search, as in `/\\cerror`, or run `:set ignorecase smartcase` to ignore case unless the pattern contains a capital letter',
  },
  // Substitution
  {
    front: 'Replace every “foo” with “bar” in the whole file',
    back: '`:%s/foo/bar/g`',
    extra: '`%` is the range for every line; without `g` only the first match on each line is replaced.',
  },
  {
    front: 'The `g`, `c` and `i` flags of `:s`',
    back: '`g` replaces every match on a line, `c` asks you to confirm each one, `i` ignores case',
  },
  {
    front: 'Limit a substitution to some lines',
    back: "`:s/a/b/` changes only the current line, `:5,10s/a/b/g` lines 5 to 10, and `:'<,'>s/a/b/g` the lines of the last Visual selection",
    extra: "Pressing `:` in Visual mode types `:'<,'>` for you.",
  },
  // Registers and macros
  {
    front: 'What is the unnamed register `""`?',
    back: 'Where `d`, `c`, `y` and `x` put text by default, and where `p` puts it from',
  },
  {
    front: 'You yanked a word, then deleted a line. How do you paste the yanked word?',
    back: '`"0p`: register 0 holds the last yank, and deletes don’t overwrite it',
  },
  {
    front: 'Yank a line into register `a` and paste it',
    back: '`"ayy`, then `"ap`',
    extra: 'An uppercase name appends instead: `"Ayy` adds the line to register `a`.',
  },
  {
    front: 'Copy to the system clipboard',
    back: '`"+y`, for example `"+yy` for the current line; paste from it with `"+p`',
    extra: 'Needs a Vim built with clipboard support. On X11, `"*` is the primary selection.',
  },
  {
    front: 'Record and play a macro',
    back: '`qa` starts recording into register `a`, `q` stops, and `@a` plays it back',
    extra: '`@@` repeats the last macro you played and `10@a` runs it ten times.',
  },
  {
    front: 'List what’s in every register',
    back: '`:registers` (or `:reg`)',
  },
  // Visual mode
  {
    front: '`v`, `V` and `Ctrl-v`',
    back: 'Visual mode by character, by line, and by block (a rectangle of columns)',
  },
  {
    front: 'Add the same text at the start of several lines',
    back: 'Press `Ctrl-v`, extend down with `j`, press `I`, type the text, then `Esc`',
    extra: 'The text appears on every selected line once you press `Esc`.',
  },
  // Buffers and windows
  {
    front: 'Buffer vs window vs tab page',
    back: 'A buffer is a file loaded in memory, a window is a view onto a buffer, and a tab page is a layout of windows',
  },
  {
    front: 'Open another file and switch between buffers',
    back: '`:e file` opens a file, `:ls` lists buffers, `:b 2` switches to buffer 2, and `:bn` and `:bp` go to the next and previous buffer',
  },
  {
    front: 'Split the window and move between the splits',
    back: '`:split` (`Ctrl-w s`) splits horizontally and `:vsplit` (`Ctrl-w v`) vertically; `Ctrl-w w` cycles through windows and `Ctrl-w h`, `j`, `k`, `l` move in a direction',
  },
  // Help and settings
  {
    front: 'Get Vim’s built-in help on a command',
    back: '`:help` followed by the topic, for example `:help dd` or `:help :s`',
    extra: 'Run `vimtutor` from the shell for an interactive lesson.',
  },
  {
    front: 'Keep settings across sessions',
    back: 'Put them in `~/.vimrc` (or `~/.vim/vimrc`), one per line, usually without the leading colon',
    extra: code('vim', 'set number', 'set relativenumber', 'set ignorecase smartcase'),
  },
]

export const VIM: PublicDeck = {
  slug: 'vim-essentials',
  title: 'Vim essentials: 50 cards on modes, motions, operators and macros',
  shortTitle: 'Vim',
  category: 'devops',
  level: 'beginner',
  icon: 'code',
  description:
    'Learn Vim from the keyboard up: modes, motions, operators and text objects, search and :s substitutions, registers, macros, visual mode and windows.',
  intro:
    'Vim makes sense once you see it as a small language: operators such as d, c and y combine with motions and text objects, so a few dozen keys cover most editing. These fifty cards go from saving and quitting through motions, text objects, search and replace, registers, macros, visual block edits and split windows.',
  faq: [
    {
      q: 'Does this deck work for Neovim?',
      a: 'Yes. Neovim keeps Vim’s modes, motions, operators, registers and commands, so the keys on these cards work the same. Its config file lives in ~/.config/nvim/init.vim or init.lua instead of ~/.vimrc.',
    },
    {
      q: 'How do I get out of Vim?',
      a: 'Press Esc to get to Normal mode, then type :q and press Enter. Use :wq to save first, or :q! to throw your changes away.',
    },
    {
      q: 'How should I practice alongside the cards?',
      a: 'Run vimtutor, which comes with Vim, for a hands-on lesson of about half an hour. Then use one new motion or text object a day in real editing until it becomes a habit.',
    },
  ],
  cards: CARDS,
}
