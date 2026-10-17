import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const sh = (...lines: string[]) => code('bash', ...lines)

const CARDS: CardContent[] = [
  // Running scripts
  {
    front: 'What does `#!/usr/bin/env bash` on the first line do?',
    back: 'This shebang tells the kernel which interpreter runs the script; `env` finds `bash` on the `PATH`, which is more portable than a fixed `#!/bin/bash`',
    extra: 'It only applies when you run the file directly (`./script.sh`), which also needs execute permission.',
  },
  {
    front: '`#!/bin/sh` vs `#!/usr/bin/env bash`',
    back: '`sh` is a POSIX shell (dash on Debian and Ubuntu) without Bash features such as `[[ ]]`, arrays and `${var//a/b}`; use a Bash shebang whenever a script relies on them',
  },
  {
    front: 'Running `./script.sh` vs `source script.sh`',
    back: 'Running starts a child process, so its variables and `cd` vanish when it ends; `source` (or `.`) runs the file in the current shell, so its changes persist',
    extra: 'Source files that set environment variables or define functions for your current shell.',
  },
  // Variables and quoting
  {
    front: 'What’s wrong with `name = "Ada"`?',
    back: 'The spaces make Bash run a command called `name` with the arguments `=` and `Ada`. Assignments take no spaces: `name="Ada"`',
  },
  {
    front: 'Single vs double quotes',
    back: 'Single quotes keep everything literal; double quotes still expand `$var`, `$(command)` and `$((arithmetic))` but prevent word splitting and globbing',
    extra: sh('name="Ada"', "echo 'Hi $name'   # Hi $name", 'echo "Hi $name"   # Hi Ada'),
  },
  {
    front: 'Why quote variables, as in `rm "$file"`?',
    back: 'Unquoted expansions are split on whitespace and glob-expanded: with `file="my report.txt"`, `rm $file` tries to delete `my` and `report.txt`',
    extra: 'Quote every expansion unless you specifically want splitting. ShellCheck flags missing quotes.',
  },
  {
    front: 'Store a command’s output in a variable',
    back: sh('today=$(date +%F)', 'lines=$(wc -l < access.log)'),
    extra: 'Prefer `$(...)` to backticks: it nests and reads more clearly. Trailing newlines are stripped.',
  },
  {
    front: 'Integer arithmetic in Bash',
    back: sh('total=$(( price * qty ))', '(( count++ ))', 'echo $(( 7 / 2 ))   # 3'),
    extra: 'Bash arithmetic is integer-only; use `bc` or `awk` for decimals.',
  },
  // Arguments
  {
    front: '`$0`, `$1` and `$#`',
    back: 'The script’s name, its first argument, and the number of arguments',
    extra: 'From the tenth argument on, use braces: `${10}`.',
  },
  {
    front: '`"$@"` vs `"$*"`',
    back: '`"$@"` expands to each argument as a separate word, keeping spaces inside arguments intact; `"$*"` joins them all into one string',
    extra: 'To pass arguments on to another command, you almost always want `"$@"`.',
  },
  {
    front: 'What does `shift` do?',
    back: 'Drops `$1`, moves the remaining arguments down by one (`$2` becomes `$1`) and decreases `$#`',
    extra: '`shift 2` drops two. It is common in argument-parsing loops.',
  },
  {
    front: 'Parse short options such as `-v` and `-f file`',
    back: sh(
      'while getopts "vf:" opt; do',
      '  case $opt in',
      '    v) verbose=1 ;;',
      '    f) file="$OPTARG" ;;',
      '    *) usage; exit 2 ;;',
      '  esac',
      'done',
      'shift $((OPTIND - 1))',
    ),
    extra: 'A colon after a letter means the option takes a value. `getopts` only handles short options.',
  },
  {
    front: 'Exit with a usage message when the first argument is missing',
    back: sh('env="${1:?usage: deploy.sh <env>}"'),
    extra: '`${var:?message}` prints the message to stderr and exits with a non-zero status if the variable is unset or empty.',
  },
  // Exit codes and conditions
  {
    front: 'Exit status conventions',
    back: '0 means success and 1–255 failure; 2 often signals misuse, 126 a command that isn’t executable, 127 command not found, and 128 + N death by signal N (130 after Ctrl+C)',
    extra: 'A script exits with `exit N`, or else with the status of its last command.',
  },
  {
    front: 'Why save `$?` right away?',
    back: 'Every command, even `echo` or `[`, overwrites it, so store it immediately: `cmd; status=$?`',
    extra: 'Often you don’t need `$?` at all: test the command directly with `if`.',
  },
  {
    front: 'Run a block only if `grep` finds a match',
    back: sh('if grep -q "ERROR" app.log; then', '  echo "errors found"', 'fi'),
    extra: '`if` tests a command’s exit status, so there is no need for `[ $? -eq 0 ]`.',
  },
  {
    front: 'Fail early when a required tool is missing',
    back: sh('command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }'),
    extra: '`command -v` is built in and portable, unlike `which`.',
  },
  {
    front: '`[ ]` vs `[[ ]]`',
    back: '`[` is an ordinary command (POSIX `test`), so unquoted variables inside it are split and globbed. `[[ ]]` is Bash syntax: no splitting, plus `&&`, `||`, glob patterns and regex matching with `=~`',
  },
  {
    front: 'Why is `[[ 10 < 9 ]]` true?',
    back: 'Inside `[[ ]]`, `<` and `>` compare strings alphabetically, and “10” sorts before “9”. For numbers use `-lt`, `-gt` and friends, or `(( 10 < 9 ))`',
    extra: 'The numeric operators are `-eq`, `-ne`, `-lt`, `-le`, `-gt` and `-ge`.',
  },
  {
    front: 'Common file tests',
    back: '`-e` exists, `-f` regular file, `-d` directory, `-s` non-empty file, and `-r`, `-w`, `-x` readable, writable, executable',
    extra: sh('[[ -f .env ]] && source .env'),
  },
  { front: '`-z` vs `-n`', back: '`[[ -z $var ]]` is true when the string is empty; `[[ -n $var ]]` is true when it is not' },
  {
    front: 'Match a regex and extract its groups',
    back: sh(
      "re='^([0-9]+)\\.([0-9]+)$'",
      'if [[ $version =~ $re ]]; then',
      '  major=${BASH_REMATCH[1]} minor=${BASH_REMATCH[2]}',
      'fi',
    ),
    extra: 'Keep the regex in a variable and don’t quote it after `=~`: a quoted pattern is matched as a literal string.',
  },
  {
    front: 'Branch on a value with `case`',
    back: sh(
      'case "$1" in',
      '  start)      start_app ;;',
      '  stop)       stop_app ;;',
      '  -h|--help)  usage ;;',
      '  *)          echo "unknown command: $1" >&2; exit 2 ;;',
      'esac',
    ),
    extra: 'Patterns are globs, `|` separates alternatives and `*)` is the default branch.',
  },
  // Loops
  {
    front: 'Loop over all `.log` files in a directory',
    back: sh('for f in *.log; do', '  gzip "$f"', 'done'),
    extra:
      'If nothing matches, the loop runs once with the literal string `*.log`; `shopt -s nullglob` makes it run zero times instead.',
  },
  {
    front: 'Count from 1 to n when n is a variable',
    back: sh('for (( i = 1; i <= n; i++ )); do', '  echo "$i"', 'done'),
    extra: 'Brace expansion like `{1..5}` happens before variables are expanded, so `{1..$n}` doesn’t work.',
  },
  {
    front: 'Read a file line by line',
    back: sh('while IFS= read -r line; do', '  printf \'%s\\n\' "$line"', 'done < input.txt'),
    extra: '`IFS=` keeps leading and trailing whitespace and `-r` keeps backslashes. Don’t loop over `$(cat file)`.',
  },
  {
    front: 'A counter set inside `cmd | while read …` is 0 afterwards. Why?',
    back: 'Each part of a pipeline runs in a subshell, so the loop’s variables disappear with it. Feed the loop with process substitution instead: `done < <(cmd)`',
    extra:
      'Alternatively, `shopt -s lastpipe` runs the last part of a pipeline in the current shell (in scripts, where job control is off).',
  },
  {
    front: 'Wait until a service is healthy',
    back: sh('until curl -fsS http://localhost:8080/health >/dev/null; do', '  sleep 2', 'done'),
    extra: '`until` loops as long as the command fails. Add a retry limit in real scripts.',
  },
  {
    front: 'Run two jobs in parallel and wait for both',
    back: sh('build_frontend &', 'build_backend &', 'wait'),
    extra:
      'Plain `wait` returns 0 even if a job failed. Save each PID from `$!` and run `wait "$pid"` to get that job’s exit status.',
  },
  // Functions and arrays
  {
    front: 'Define a function with a local variable',
    back: sh('greet() {', '  local name="$1"', '  echo "Hello, $name"', '}', '', 'greet "Ada"'),
    extra:
      'Without `local`, variables set in a function are global. Inside a function, `$1`, `$2` and `$@` are the function’s own arguments.',
  },
  {
    front: 'How does a Bash function return data?',
    back: 'It prints the data and the caller captures it: `result=$(get_version)`. `return` only sets an exit status from 0 to 255',
    extra: 'Larger values wrap around: `return 300` gives a status of 44.',
  },
  {
    front: 'Indexed arrays',
    back: sh(
      'files=(a.txt "b c.txt")',
      'files+=(d.txt)',
      'echo "${files[0]}"    # a.txt',
      'echo "${#files[@]}"   # 3',
      'for f in "${files[@]}"; do echo "$f"; done',
    ),
    extra: 'Quote `"${files[@]}"` so elements containing spaces stay whole.',
  },
  {
    front: 'Associative arrays',
    back: sh(
      'declare -A port=([web]=80 [db]=5432)',
      'echo "${port[db]}"   # 5432',
      'for name in "${!port[@]}"; do echo "$name"; done',
    ),
    extra: 'They need Bash 4 or newer; macOS still ships Bash 3.2 as `/bin/bash`.',
  },
  // Parameter expansion
  {
    front: '`${var:-default}` vs `${var:=default}`',
    back: 'Both give `default` when `var` is unset or empty; `:=` also assigns it to `var`',
    extra: 'Without the colon, as in `${var-default}`, only an unset variable triggers the default, not an empty one.',
  },
  {
    front: 'Get the file name, directory and extension from a path',
    back: sh(
      'path=/var/log/app/error.log',
      'echo "${path##*/}"   # error.log',
      'echo "${path%/*}"    # /var/log/app',
      'echo "${path%.*}"    # /var/log/app/error',
      'echo "${path##*.}"   # log',
    ),
    extra: '`#` removes the shortest matching prefix and `##` the longest; `%` and `%%` do the same for suffixes.',
  },
  {
    front: 'Replace text inside a variable',
    back: '`${var/old/new}` replaces the first match; `${var//old/new}` replaces all of them',
    extra: sh('f="annual report.txt"', 'echo "${f// /_}"   # annual_report.txt'),
  },
  {
    front: 'String length and substrings',
    back: '`${#var}` is the length; `${var:offset:length}` extracts a substring, as in `${commit:0:7}`',
  },
  // Redirection and input
  {
    front: 'Print an error message to stderr',
    back: sh('echo "config file not found" >&2'),
    extra: 'Keep stdout for real output, so `script | other-tool` isn’t polluted by messages.',
  },
  {
    front: '`cmd > out.log 2>&1` vs `cmd 2>&1 > out.log`',
    back: 'Redirections apply left to right. The first sends both streams to the file; the second points stderr at the terminal (where stdout was at that moment) and only then moves stdout to the file',
    extra: 'To pipe errors along with output: `cmd 2>&1 | grep -i error`.',
  },
  {
    front: 'What does `&>` do?',
    back: 'Redirects both stdout and stderr, so `cmd &> /dev/null` silences a command completely',
    extra: 'It is Bash shorthand for `> file 2>&1`; `&>>` appends.',
  },
  {
    front: 'Write a multi-line file with a here-document',
    back: sh('cat > app.conf <<EOF', 'host=$HOST', 'port=8080', 'EOF'),
    extra:
      "Variables expand inside it. Quote the delimiter (`<<'EOF'`) to keep the text literal, or use `<<-EOF` to strip leading tabs.",
  },
  {
    front: 'Compare the sorted contents of two files without temp files',
    back: sh('diff <(sort a.txt) <(sort b.txt)'),
    extra: 'Process substitution, `<(cmd)`, exposes a command’s output as a file path.',
  },
  {
    front: 'Send everything a script prints to a log file and the screen',
    back: sh('exec > >(tee -a deploy.log) 2>&1'),
    extra: 'Placed near the top, it applies to all later output of the script.',
  },
  // Errors, traps and debugging
  {
    front: 'What does `set -euo pipefail` do?',
    back: '`-e` exits on the first failing command, `-u` makes expanding an unset variable an error, and `pipefail` makes a pipeline fail if any command in it fails',
    extra: 'A common first line after the shebang in scripts that should stop on errors.',
  },
  {
    front: 'When doesn’t `set -e` stop a script on a failing command?',
    back: 'When the command is an `if`, `while` or `until` condition, part of an `&&` or `||` list (except the last), negated with `!`, or masked by `local`, as in `local out=$(cmd)`',
    extra: 'Declare and assign separately so failures count: `local out; out=$(cmd)`.',
  },
  {
    front: 'Without `pipefail`, what is the status of `false | true`?',
    back: '0, because a pipeline returns the status of its last command. With `set -o pipefail` it returns the status of the rightmost command that failed',
    extra: '`${PIPESTATUS[@]}` lists the status of every command in the last pipeline.',
  },
  {
    front: 'Always delete a temp file when the script exits',
    back: sh('tmp=$(mktemp)', 'trap \'rm -f "$tmp"\' EXIT'),
    extra: 'The `EXIT` trap runs on a normal end, an `exit`, a `set -e` failure or Ctrl+C. Nothing can trap `kill -9` (SIGKILL).',
  },
  {
    front: 'Report the line number where a script failed',
    back: sh('trap \'echo "Error on line $LINENO" >&2\' ERR'),
    extra: 'Single quotes delay expansion until the trap runs. Add `set -E` so functions inherit the trap.',
  },
  {
    front: 'Trace a script while it runs',
    back: sh(
      'bash -x deploy.sh   # trace the whole script',
      'set -x              # trace from here on',
      'set +x              # stop tracing',
    ),
    extra:
      'Each command is printed after expansion, prefixed with `+`. ShellCheck catches many quoting and logic bugs before you run anything.',
  },
  {
    front: 'Get the directory the script lives in',
    back: sh('script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"'),
    extra: 'Use it to load files that sit next to the script, wherever it is run from.',
  },
]

export const BASH_SCRIPTING: PublicDeck = {
  slug: 'bash-scripting',
  title: 'Bash scripting: 50 cards on quoting, tests, loops and error handling',
  shortTitle: 'Bash scripting',
  category: 'devops',
  level: 'beginner',
  icon: 'code',
  description:
    'Bash scripting flashcards: shebangs, quoting, exit codes, tests, loops, functions, arrays, parameter expansion, redirection, set -euo pipefail and traps.',
  intro:
    'Fifty cards for writing shell scripts that don’t break on the first file name with a space: shebangs and quoting, arguments and exit codes, conditionals with [[ ]] and case, loops that read files safely, functions and arrays, parameter expansion, redirection, here-documents and process substitution, and the error handling with set -euo pipefail and trap that turns a quick hack into a reliable script.',
  faq: [
    {
      q: 'How is this different from the Linux and Git & terminal decks?',
      a: 'Those cover commands such as find, grep, pipes and permissions. This deck is about the Bash language itself: variables, quoting, control flow, functions and error handling in scripts.',
    },
    {
      q: 'Will these scripts work in sh or zsh?',
      a: 'Not always. Features such as [[ ]], arrays, pattern substitution in variables and process substitution are Bash-specific, so use a Bash shebang or stick to POSIX features when a script must run under sh.',
    },
    {
      q: 'Does it work on macOS?',
      a: 'Mostly. macOS ships the old Bash 3.2 and uses zsh as its default shell; associative arrays and a few other features need Bash 4 or newer, which you can install with Homebrew.',
    },
  ],
  cards: CARDS,
}
