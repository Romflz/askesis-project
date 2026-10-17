import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const ex = (...lines: string[]) => code('elixir', ...lines)

const CARDS: CardContent[] = [
  // Data and immutability
  {
    front: 'Can you change a list or map in place in Elixir?',
    back: 'No. Data is immutable: functions return new values, and `x = x + 1` rebinds the name `x` to a new value without changing the old one',
  },
  {
    front: 'What does `=` do in Elixir?',
    back: 'It’s the match operator: it matches the right side against the pattern on the left, binding any variables, and raises `MatchError` if they don’t match',
    extra: ex('{:ok, body} = {:ok, "hello"}  # body is "hello"', '{:ok, body} = {:error, :enoent}  # ** (MatchError)'),
  },
  {
    front: 'What does the pin operator `^` do?',
    back: 'Matches against a variable’s current value instead of rebinding the variable',
    extra: ex('x = 1', 'x = 2   # rebinds x', '^x = 3  # ** (MatchError), because x is 2'),
  },
  {
    front: 'What are atoms?',
    back: 'Constants whose name is their value, such as `:ok` and `:error`; `true`, `false` and `nil` are atoms too',
    extra: 'Atoms are never garbage collected, so don’t create them from user input with `String.to_atom/1`.',
  },
  {
    front: 'Lists vs tuples',
    back: 'Lists are linked lists: prepending with `[x | list]` is fast, but length and index access are linear. Tuples are stored contiguously: index access is fast, but any update copies the whole tuple',
  },
  {
    front: 'Keyword list vs map',
    back: 'A keyword list (`[name: "Ada", role: :admin]`) is a list of `{atom, value}` tuples that keeps order and allows duplicate keys, typical for options; a map (`%{name: "Ada"}`) has unique keys of any type and fast lookup',
  },
  {
    front: '`map.key` vs `map[:key]`',
    back: 'For an atom key, `map.key` raises `KeyError` when the key is missing, while `map[:key]` returns `nil`',
  },
  {
    front: 'Update an existing key in a map',
    back: ex('user = %{user | age: 37}'),
    extra: 'This syntax raises `KeyError` if `:age` isn’t already in the map; `Map.put/3` adds or replaces.',
  },
  {
    front: 'Define a struct with a default value',
    back: ex('defmodule User do', '  defstruct [:name, age: 0]', 'end', '', '%User{name: "Ada"}  # age defaults to 0'),
    extra: 'Unknown keys are a compile-time error, and structs don’t support `user[:name]` access.',
  },
  {
    front: '`"abc"` vs `~c"abc"`',
    back: '`"abc"` is a string, a UTF-8 encoded binary; `~c"abc"` is a charlist, a list of code points used mainly with Erlang libraries',
    extra: "Older code writes charlists with single quotes: `'abc'`.",
  },
  {
    front: 'What do `String.length("héllo")` and `byte_size("héllo")` return?',
    back: '5 and 6: `String.length/1` counts graphemes, while `byte_size/1` counts bytes, and é takes two bytes in UTF-8',
  },
  {
    front: 'Which values are falsy in Elixir?',
    back: 'Only `false` and `nil`; everything else, including `0`, `""` and `[]`, is truthy',
  },
  // Pattern matching and control flow
  {
    front: 'Define a function with several clauses and a guard',
    back: ex('defmodule Math do', '  def fact(0), do: 1', '  def fact(n) when n > 0, do: n * fact(n - 1)', 'end'),
    extra: 'Clauses are tried from top to bottom; the first one whose pattern and guard match runs.',
  },
  {
    front: 'What can you call in a guard?',
    back: 'Only a fixed set of expressions: comparisons, boolean operators, arithmetic, type checks like `is_integer/1` and a few `Kernel` functions such as `length/1`',
    extra: 'Your own functions aren’t allowed; build reusable guards with `defguard`.',
  },
  {
    front: 'What does `[head | tail] = [1, 2, 3]` bind?',
    back: '`head` to `1` and `tail` to `[2, 3]`',
    extra: 'Matching `[head | tail]` against `[]` raises a `MatchError`.',
  },
  {
    front: 'Branch on an `{:ok, _}` or `{:error, _}` result',
    back: ex('case File.read("config.json") do', '  {:ok, body} -> parse(body)', '  {:error, reason} -> {:error, reason}', 'end'),
  },
  {
    front: 'What is `with` for?',
    back: 'Chaining pattern matches: each `<-` clause must match to continue, and the first value that doesn’t match is returned (or handled in `else`)',
    extra: ex('with {:ok, body} <- File.read(path),', '     {:ok, data} <- Jason.decode(body) do', '  {:ok, data}', 'end'),
  },
  {
    front: 'When do you use `cond`?',
    back: 'For a chain of conditions that aren’t patterns: the first truthy one wins, so end with `true ->` as a catch-all',
    extra: 'If no condition is truthy, `cond` raises a `CondClauseError`.',
  },
  {
    front: 'Give a function parameter a default value',
    back: ex('def greet(name, greeting \\\\ "Hello"), do: "#{greeting}, #{name}"'),
  },
  {
    front: '`File.read/1` vs `File.read!/1`',
    back: '`File.read/1` returns `{:ok, contents}` or `{:error, reason}`; the `!` version returns the contents directly and raises on failure',
    extra: 'Many standard library functions come in this pair.',
  },
  // Functions and the pipe
  {
    front: 'What does `|>` do?',
    back: 'Passes the result of the expression on its left as the first argument of the function call on its right',
    extra: ex('"hello world"', '|> String.split()', '|> Enum.map(&String.capitalize/1)', '|> Enum.join(" ")', '# "Hello World"'),
  },
  {
    front: 'What do `&String.upcase/1` and `&(&1 * 2)` mean?',
    back: 'Both use the capture operator: the first refers to a named function by name and arity, the second is shorthand for `fn x -> x * 2 end`',
  },
  {
    front: 'Why is an anonymous function called with a dot, as in `add.(1, 2)`?',
    back: 'The dot marks a call to a function stored in a variable, so it can’t be confused with a call to a named function `add(1, 2)`',
  },
  {
    front: 'What does `/2` mean in `Enum.map/2`?',
    back: 'The arity: the number of arguments. Functions with the same name and different arities are separate functions',
  },
  {
    front: 'Why can `IO.inspect/2` sit in the middle of a pipeline?',
    back: 'It prints its argument and returns it unchanged',
    extra: ex('orders', '|> Enum.filter(&paid?/1)', '|> IO.inspect(label: "paid")', '|> Enum.map(& &1.total)'),
  },
  // Enum and Stream
  {
    front: '`Enum` vs `Stream`',
    back: '`Enum` functions are eager and build a full result at each step; `Stream` functions are lazy and compose into a single pass that runs only when something like an `Enum` function consumes it',
  },
  {
    front: `What does this return?\n${ex('1..1_000_000', '|> Stream.map(&(&1 * 3))', '|> Stream.filter(&(rem(&1, 2) == 0))', '|> Enum.take(5)')}`,
    back: '`[6, 12, 18, 24, 30]`, after processing only the first ten numbers of the range',
  },
  {
    front: 'Sum a list with `Enum.reduce/3`',
    back: ex('Enum.reduce([1, 2, 3], 0, fn x, acc -> x + acc end)  # 6'),
    extra: 'The function receives the element first and the accumulator second.',
  },
  {
    front: 'What does `for x <- 1..5, rem(x, 2) == 1, do: x * x` return?',
    back: '`[1, 9, 25]`: a comprehension with a generator and a filter',
  },
  {
    front: 'Count the lines containing `ERROR` in a large file without loading it all',
    back: ex('File.stream!("app.log")', '|> Stream.filter(&String.contains?(&1, "ERROR"))', '|> Enum.count()'),
    extra: '`File.stream!/1` reads the file lazily, line by line.',
  },
  // Processes
  {
    front: 'What is an Elixir process?',
    back: 'A lightweight process run by the BEAM virtual machine, with its own memory and mailbox; it isn’t an OS thread, and one system can run millions of them',
  },
  {
    front: 'Spawn a process and send it a message',
    back: ex(
      'pid = spawn(fn ->',
      '  receive do',
      '    {:ping, from} -> send(from, :pong)',
      '  end',
      'end)',
      '',
      'send(pid, {:ping, self()})',
    ),
  },
  {
    front: 'Does `send/2` wait for the receiver?',
    back: 'No. It puts the message in the receiver’s mailbox and returns at once; `receive` is what blocks, until a matching message arrives',
  },
  {
    front: 'Stop waiting in `receive` after five seconds',
    back: ex('receive do', '  {:result, value} -> value', 'after', '  5_000 -> :timeout', 'end'),
  },
  {
    front: 'What happens to messages that match no `receive` clause?',
    back: 'They stay in the mailbox, and `receive` keeps waiting for one that matches; unmatched messages pile up',
  },
  {
    front: 'Link vs monitor',
    back: 'A link is two-way: when one linked process crashes, the other gets an exit signal and crashes too unless it traps exits. A monitor is one-way: the watcher just receives a `{:DOWN, ref, :process, pid, reason}` message',
    extra: '`spawn_link/1` and `Process.monitor/1` set them up.',
  },
  {
    front: 'Run work concurrently and wait for its result',
    back: ex('task = Task.async(fn -> fetch_report() end)', 'report = Task.await(task)'),
    extra: '`Task.await/2` exits the caller if the task takes longer than 5 seconds, unless you pass a timeout.',
  },
  // GenServer and OTP
  {
    front: 'What is a GenServer?',
    back: 'An OTP behaviour for a process that keeps state and handles requests in a loop; you implement callbacks such as `init/1`, `handle_call/3` and `handle_cast/2`',
  },
  {
    front: '`GenServer.call` vs `GenServer.cast`',
    back: '`call` is synchronous and waits for a reply, for up to 5 seconds by default; `cast` is asynchronous and returns `:ok` immediately',
  },
  {
    front: 'A minimal counter GenServer',
    back: ex(
      'defmodule Counter do',
      '  use GenServer',
      '',
      '  def start_link(n), do: GenServer.start_link(__MODULE__, n, name: __MODULE__)',
      '  def increment, do: GenServer.cast(__MODULE__, :inc)',
      '  def value, do: GenServer.call(__MODULE__, :value)',
      '',
      '  @impl true',
      '  def init(n), do: {:ok, n}',
      '',
      '  @impl true',
      '  def handle_cast(:inc, n), do: {:noreply, n + 1}',
      '',
      '  @impl true',
      '  def handle_call(:value, _from, n), do: {:reply, n, n}',
      'end',
    ),
  },
  {
    front: 'What is `handle_info/2` for?',
    back: 'Messages that arrive by plain `send` rather than through `call` or `cast`, such as timer messages and monitor `:DOWN` messages',
  },
  {
    front: 'What does a supervisor do?',
    back: 'Starts child processes and restarts them, following a strategy, when they crash',
  },
  {
    front: 'Supervisor strategies `:one_for_one`, `:one_for_all` and `:rest_for_one`',
    back: 'Restart only the crashed child; restart every child; restart the crashed child and the children started after it',
  },
  {
    front: 'Start children under a supervisor',
    back: ex(
      'children = [',
      '  {Counter, 0},',
      '  {Task.Supervisor, name: MyApp.TaskSupervisor}',
      ']',
      '',
      'Supervisor.start_link(children, strategy: :one_for_one)',
    ),
    extra: '`{Counter, 0}` works because `use GenServer` defines `child_spec/1`, which calls `Counter.start_link(0)`.',
  },
  {
    front: 'Child restart values `:permanent`, `:transient` and `:temporary`',
    back: '`:permanent` children are always restarted (the default); `:transient` ones only after an abnormal exit; `:temporary` ones never',
  },
  {
    front: 'What does “let it crash” mean?',
    back: 'Don’t write defensive code for every unexpected error: let the process crash and have its supervisor restart it in a known good state',
  },
  // Mix
  {
    front: 'Create a new project with a supervision tree',
    back: code('bash', 'mix new my_app --sup'),
    extra: '`--sup` generates an application module that starts a supervisor.',
  },
  {
    front: 'Fetch dependencies, run the tests and open a shell with the project loaded',
    back: code('bash', 'mix deps.get', 'mix test', 'iex -S mix'),
  },
  {
    front: 'Where do you declare a project’s dependencies?',
    back: 'In the `deps/0` function of `mix.exs`',
    extra: ex('defp deps do', '  [{:jason, "~> 1.4"}]', 'end'),
  },
  {
    front: 'What does the requirement `"~> 1.4"` allow?',
    back: 'Any version from 1.4.0 up to, but not including, 2.0.0',
    extra: '`"~> 1.4.2"` is stricter: from 1.4.2 up to, but not including, 1.5.0.',
  },
]

export const ELIXIR: PublicDeck = {
  slug: 'elixir-essentials',
  title: 'Elixir essentials: 50 cards on pattern matching, processes and OTP',
  shortTitle: 'Elixir',
  category: 'programming',
  level: 'intermediate',
  icon: 'code',
  description:
    'Elixir fundamentals with short snippets: immutability, pattern matching, the pipe operator, Enum vs Stream, processes, GenServer, supervisors and mix.',
  intro:
    'Fifty cards on the Elixir you write every day and the OTP ideas that set it apart: matching with = and the pin operator, function clauses and guards, case, cond and with, pipes and captures, Enum versus Stream, processes and mailboxes, GenServer callbacks, supervision strategies and the mix commands that hold a project together.',
  faq: [
    {
      q: 'Do I need to know Erlang?',
      a: 'No. Every card uses Elixir syntax. Erlang and the BEAM virtual machine only come up where they explain how processes behave.',
    },
    {
      q: 'Which Elixir version do the cards target?',
      a: 'Current stable Elixir. Details that changed between versions, such as how charlists are written, are noted on the card.',
    },
    {
      q: 'Does it cover Phoenix?',
      a: 'No. It covers the language, processes and OTP that Phoenix is built on, which makes Phoenix code much easier to follow.',
    },
  ],
  cards: CARDS,
}
