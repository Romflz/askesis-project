import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const sh = (...lines: string[]) => code('bash', ...lines)

const CARDS: CardContent[] = [
  { front: 'Start a new repository in the current folder', back: sh('git init') },
  { front: 'Stage changes hunk by hunk', back: sh('git add -p') },
  {
    front: 'Fix the last commit’s message or contents',
    back: sh('git commit --amend'),
    extra: 'This rewrites the commit; avoid it on commits you’ve already pushed and shared.',
  },
  { front: 'Compact history graph', back: sh('git log --oneline --graph --all') },
  {
    front: '`git diff` vs `git diff --staged`',
    back: '`git diff` shows unstaged changes; `--staged` shows what will go into the next commit',
  },
  { front: 'Create a branch and switch to it', back: sh('git switch -c feature/login') },
  {
    front: 'What does `git merge` do?',
    back: 'Combines another branch into the current one, with a merge commit unless it can fast-forward',
  },
  { front: 'What does `git rebase main` do?', back: 'Replays your branch’s commits on top of `main`, giving a linear history' },
  {
    front: 'Merge vs rebase',
    back: 'Merge keeps history as it happened; rebase rewrites it to be linear. Don’t rebase commits others already have',
  },
  {
    front: 'Fast-forward merge',
    back: 'When the target hasn’t diverged, Git just moves the branch pointer forward; no merge commit',
  },
  { front: 'Set work aside and get it back', back: sh('git stash', 'git stash pop') },
  { front: '`git reset --soft HEAD~1`', back: 'Undo the last commit, keeping its changes staged' },
  {
    front: '`git reset HEAD~1` (mixed, the default)',
    back: 'Undo the last commit, keeping its changes in the working tree, unstaged',
  },
  {
    front: '`git reset --hard HEAD~1`',
    back: 'Undo the last commit and discard its changes entirely',
    extra: 'Destructive. `git reflog` can still find the commit for a while.',
  },
  {
    front: 'Undo a pushed commit safely',
    back: sh('git revert <commit>'),
    extra: 'Creates a new commit that reverses it, without rewriting history.',
  },
  {
    front: 'Find a commit you “lost” after a reset or rebase',
    back: sh('git reflog'),
    extra: 'The reflog records every position HEAD has been at.',
  },
  { front: 'Apply one commit from another branch', back: sh('git cherry-pick <commit>') },
  {
    front: '`git fetch` vs `git pull`',
    back: '`fetch` downloads remote changes; `pull` fetches and then merges (or rebases) them',
  },
  { front: 'Push a new branch and track it', back: sh('git push -u origin feature/login') },
  {
    front: 'Safer force push',
    back: sh('git push --force-with-lease'),
    extra: 'Refuses if the remote moved since your last fetch, so you don’t overwrite others’ work.',
  },
  { front: 'What is `.gitignore` for?', back: 'Patterns of untracked files Git should ignore, like build output and secrets' },
  { front: 'Discard local changes to a file', back: sh('git restore notes.md') },
  { front: 'Unstage a file but keep its changes', back: sh('git restore --staged notes.md') },
  {
    front: 'Detached HEAD',
    back: 'HEAD points directly at a commit instead of a branch; new commits are easy to lose unless you create a branch',
  },
  {
    front: 'Find the commit that introduced a bug',
    back: sh('git bisect start', 'git bisect bad', 'git bisect good v1.0'),
    extra: 'Git binary-searches history while you mark commits good or bad.',
  },
  { front: 'Create an annotated tag', back: sh('git tag -a v1.0 -m "First release"') },
  { front: 'Who last changed each line of a file?', back: sh('git blame app.ts') },
  { front: 'List remotes with their URLs', back: sh('git remote -v') },
  { front: '`HEAD~1` vs `HEAD^2`', back: '`HEAD~1` is the first parent; `HEAD^2` is the second parent of a merge commit' },
  { front: 'Show files changed in the last commit', back: sh('git show --stat') },
  { front: 'Print the current directory', back: sh('pwd') },
  { front: 'List all files, including hidden ones, with details', back: sh('ls -la') },
  { front: 'Go back to the previous directory', back: sh('cd -') },
  { front: 'Search files recursively, with line numbers', back: sh('grep -rn "TODO" src/') },
  { front: 'Find .log files modified more than 7 days ago', back: sh('find . -name "*.log" -mtime +7') },
  { front: 'What does a pipe `|` do?', back: 'Sends one command’s standard output into the next command’s standard input' },
  { front: '`>` vs `>>`', back: '`>` overwrites the file; `>>` appends to it' },
  { front: 'Send errors to the same place as output', back: sh('command > out.log 2>&1') },
  { front: 'Make a script executable', back: sh('chmod +x deploy.sh') },
  { front: 'What does `chmod 755` mean?', back: 'Owner can read, write and execute; group and others can read and execute' },
  { front: 'What does `chmod 644` mean?', back: 'Owner can read and write; group and others can only read' },
  { front: 'Find running node processes', back: sh('ps aux | grep node') },
  {
    front: '`kill` vs `kill -9`',
    back: '`kill` sends SIGTERM (asks the process to exit); `kill -9` sends SIGKILL, which can’t be caught',
  },
  {
    front: 'Delete files found by `find`',
    back: sh('find . -name "*.tmp" -print0 | xargs -0 rm'),
    extra: '`-print0`/`-0` handle file names with spaces.',
  },
  { front: 'Show the exit status of the last command', back: sh('echo $?'), extra: '0 means success.' },
  { front: '`&&` vs `||` between commands', back: '`a && b` runs b only if a succeeded; `a || b` runs b only if a failed' },
  { front: 'Follow a log file as it grows', back: sh('tail -f app.log') },
  { front: 'Count lines in a file', back: sh('wc -l data.csv') },
  {
    front: 'Count how often each line occurs',
    back: sh('sort access.log | uniq -c | sort -rn'),
    extra: '`uniq` only merges adjacent lines, so sort first.',
  },
  { front: 'Generate an SSH key', back: sh('ssh-keygen -t ed25519 -C "you@example.com"') },
]

export const GIT: PublicDeck = {
  slug: 'git-and-terminal',
  title: 'Git and the command line: 50 essentials',
  shortTitle: 'Git & terminal',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'The Git commands and shell skills developers use every day: branching, rebasing, undoing mistakes, pipes, redirects, permissions and processes.',
  intro:
    'Half of this deck is Git, from staging hunks to recovering “lost” commits with the reflog; the other half is the shell: finding files, piping commands together, redirects, permissions and processes. Each answer is the command itself, so you can use it right away.',
  faq: [
    {
      q: 'Which is safer, reset or revert?',
      a: 'For commits that are already pushed, revert: it adds a new commit instead of rewriting shared history.',
    },
    {
      q: 'Do the shell commands work on macOS?',
      a: 'Yes. They work in bash and zsh on Linux and macOS, and in WSL or Git Bash on Windows.',
    },
    {
      q: 'Can I recover a commit after git reset --hard?',
      a: 'Usually, yes: find it with git reflog and reset or branch to it, before Git garbage-collects it.',
    },
  ],
  cards: CARDS,
}
