import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const go = (...lines: string[]) => code('go', ...lines)

const CARDS: CardContent[] = [
  // Basics
  {
    front: 'What does `x := 42` do?',
    back: 'Declares `x` and initializes it, inferring the type (`int`); short declarations only work inside functions',
    extra: 'At package level, write `var x = 42`.',
  },
  {
    front: 'Zero values in Go',
    back: '`0` for numbers, `""` for strings, `false` for booleans, and `nil` for pointers, slices, maps, channels, functions and interfaces',
  },
  {
    front: 'Go’s loop forms',
    back: 'Only `for`: three-clause `for i := 0; i < n; i++`, condition-only `for x < 10`, infinite `for {}`, and `for i, v := range xs`',
  },
  {
    front: 'Loop over 0, 1, 2 without a three-clause `for`',
    back: go('for i := range 3 {', '\tfmt.Println(i)', '}'),
    extra: 'Ranging over an integer was added in Go 1.22.',
  },
  {
    front: 'Loop variables since Go 1.22',
    back: 'Each iteration gets a fresh variable, so closures and goroutines started in the loop see different values',
    extra: 'Before 1.22 all iterations shared one variable, a classic bug.',
  },
  {
    front: 'Does `switch` fall through to the next case?',
    back: 'No. Each case ends automatically; use the `fallthrough` keyword to continue into the next one',
    extra: 'A `switch` with no expression is a tidy replacement for an if-else chain.',
  },
  {
    front: 'How is a name exported from a package?',
    back: 'By starting it with an uppercase letter: `Parse` is exported, `parse` is not',
  },
  {
    front: '`new` vs `make`',
    back: '`new(T)` returns a pointer to a zeroed `T`; `make` initializes a slice, map or channel and returns it directly',
  },
  // Slices, maps and strings
  {
    front: 'Array vs slice',
    back: 'An array has a fixed length that is part of its type (`[3]int`) and is copied on assignment; a slice is a view (pointer, length, capacity) onto an underlying array',
  },
  {
    front: '`len` vs `cap` of a slice',
    back: '`len` is how many elements the slice holds; `cap` is how many fit in the underlying array from the slice’s start',
  },
  {
    front: 'Why do you write `s = append(s, x)`?',
    back: 'When capacity runs out, `append` allocates a bigger array, copies the elements and returns a new slice header; the old `s` still points at the old array',
  },
  {
    front: `What does this print?\n${go('a := []int{1, 2, 3}', 'b := a[:2]', 'b[0] = 99', 'fmt.Println(a)')}`,
    back: '`[99 2 3]`: slicing doesn’t copy, so `b` shares `a`’s underlying array',
    extra: 'Use `slices.Clone(a)` or `copy` when you need an independent slice.',
  },
  {
    front: 'Make an empty slice with room for 10 elements',
    back: go('s := make([]int, 0, 10)'),
    extra: 'Preallocating avoids repeated reallocations when you know the size.',
  },
  {
    front: 'Read a map key and tell “missing” from a zero value',
    back: go('v, ok := m["key"]'),
    extra: 'A missing key returns the value type’s zero value; `ok` is false.',
  },
  {
    front: 'What happens when you write to a nil map?',
    back: 'A panic. Create the map first with `make(map[string]int)` or a literal',
    extra: 'Reading from a nil map is fine and returns zero values.',
  },
  {
    front: 'In what order does `range` visit a map?',
    back: 'An unspecified order that is deliberately randomized; sort the keys when you need a stable order',
    extra: '`slices.Sorted(maps.Keys(m))` gives sorted keys (Go 1.23+).',
  },
  {
    front: 'What is `len("héllo")`?',
    back: '6: `len` counts bytes, and é takes two bytes in UTF-8',
    extra: '`utf8.RuneCountInString` counts characters (runes) instead.',
  },
  {
    front: 'What is a `rune`?',
    back: 'An alias for `int32` that holds a Unicode code point; `byte` is an alias for `uint8`',
    extra: 'Ranging over a string yields runes: `for i, r := range s`.',
  },
  // Functions, defer and errors
  {
    front: 'What does `defer` do?',
    back: 'Schedules a function call to run when the surrounding function returns, even if it panics',
    extra: 'Typical uses: closing files, unlocking mutexes.',
  },
  {
    front: `What does this print?\n${go('for i := 0; i < 3; i++ {', '\tdefer fmt.Print(i)', '}')}`,
    back: '`210`: deferred calls run last-in, first-out',
  },
  {
    front: 'When are a deferred call’s arguments evaluated?',
    back: 'Immediately, at the `defer` statement, not when the call finally runs',
    extra: go('x := 1', 'defer fmt.Println(x) // prints 1', 'x = 2'),
  },
  {
    front: 'How do you recover from a panic?',
    back: 'Call `recover()` inside a deferred function; it stops the panic and returns the value passed to `panic`',
    extra: 'Called anywhere else, `recover` returns nil.',
  },
  {
    front: 'The idiomatic error check after opening a file',
    back: go(
      'f, err := os.Open(name)',
      'if err != nil {',
      '\treturn fmt.Errorf("open %s: %w", name, err)',
      '}',
      'defer f.Close()',
    ),
  },
  { front: 'The `error` interface', back: go('type error interface {', '\tError() string', '}') },
  {
    front: '`%w` vs `%v` in `fmt.Errorf`',
    back: '`%w` wraps the error, keeping it in the chain for `errors.Is` and `errors.As`; `%v` only copies its text',
  },
  {
    front: '`errors.Is` vs `errors.As`',
    back: '`errors.Is` checks whether any error in the chain matches a target value like `io.EOF`; `errors.As` finds one of a given type and assigns it to a variable',
  },
  // Types and interfaces
  {
    front: 'How does a type implement an interface?',
    back: 'Implicitly, by having all of its methods; there is no `implements` keyword',
  },
  { front: 'What is `any`?', back: 'An alias for `interface{}` (Go 1.18+): the interface every type satisfies' },
  {
    front: 'Type assertion with a safe check',
    back: go('s, ok := v.(string)'),
    extra: 'Without `ok`, a failed assertion panics.',
  },
  {
    front: 'Branch on the dynamic type of an interface value',
    back: go(
      'switch x := v.(type) {',
      'case int:',
      '\tfmt.Println("int", x)',
      'case string:',
      '\tfmt.Println("string", x)',
      'default:',
      '\tfmt.Println("something else")',
      '}',
    ),
  },
  {
    front: 'Why can `err != nil` be true when the function returned a nil pointer?',
    back: 'An interface is nil only if both its type and value are nil; a nil `*MyError` stored in an `error` still has a type',
    extra: 'Return a literal `nil` when there is no error.',
  },
  {
    front: 'Value vs pointer receivers',
    back: 'A pointer receiver can modify the value and avoids copying it; a value receiver works on a copy',
    extra: 'If any method needs a pointer receiver, give all of the type’s methods pointer receivers.',
  },
  {
    front: 'Struct embedding',
    back: 'Embedding a type promotes its fields and methods to the outer struct: composition, not inheritance',
    extra: go('type Admin struct {', '\tUser // Admin gets User’s fields and methods', '\tLevel int', '}'),
  },
  {
    front: 'A generic Map function',
    back: go(
      'func Map[T, U any](s []T, f func(T) U) []U {',
      '\tout := make([]U, 0, len(s))',
      '\tfor _, v := range s {',
      '\t\tout = append(out, f(v))',
      '\t}',
      '\treturn out',
      '}',
    ),
    extra: 'Type parameters arrived in Go 1.18.',
  },
  // Goroutines and channels
  {
    front: 'Start a function concurrently',
    back: go('go process(item)'),
    extra: 'Goroutines are lightweight threads managed by the Go runtime and multiplexed onto OS threads.',
  },
  {
    front: 'What happens to running goroutines when `main` returns?',
    back: 'The program exits and they stop immediately, finished or not',
  },
  {
    front: 'Wait for a group of goroutines to finish',
    back: go(
      'var wg sync.WaitGroup',
      'for _, url := range urls {',
      '\twg.Add(1)',
      '\tgo func() {',
      '\t\tdefer wg.Done()',
      '\t\tfetch(url)',
      '\t}()',
      '}',
      'wg.Wait()',
    ),
    extra: 'Go 1.25 adds `wg.Go(func() { … })`, which does the `Add` and `Done` for you.',
  },
  { front: 'Send and receive a value on a channel', back: go('ch := make(chan int)', 'go func() { ch <- 42 }()', 'v := <-ch') },
  {
    front: 'Unbuffered vs buffered channels',
    back: 'An unbuffered send blocks until a receiver takes the value; on a buffered channel (`make(chan int, 10)`) sends block only when the buffer is full',
  },
  {
    front: 'How do you signal that no more values are coming?',
    back: 'The sender calls `close(ch)`; a `for v := range ch` loop then ends once the channel is drained',
    extra: 'Receiving from a closed channel returns the zero value at once; `v, ok := <-ch` sets `ok` to false.',
  },
  {
    front: 'What happens when you send on a closed channel?',
    back: 'A panic',
    extra: 'Closing a nil or already-closed channel panics too, so only the sender should close.',
  },
  {
    front: 'What happens when you send or receive on a nil channel?',
    back: 'It blocks forever',
    extra: 'Setting a channel to nil is a way to disable its case in a `select`.',
  },
  {
    front: 'What does `select` do?',
    back: 'Waits on several channel operations and runs whichever is ready, picking one at random if several are; a `default` case makes it non-blocking',
  },
  {
    front: 'Give up on a channel receive after two seconds',
    back: go(
      'select {',
      'case v := <-results:',
      '\tfmt.Println(v)',
      'case <-time.After(2 * time.Second):',
      '\tfmt.Println("timeout")',
      '}',
    ),
  },
  {
    front: '`chan<- int` vs `<-chan int`',
    back: '`chan<- int` is send-only; `<-chan int` is receive-only',
    extra: 'Used in function signatures to document and enforce how a channel is used.',
  },
  {
    front: '“fatal error: all goroutines are asleep - deadlock!”',
    back: 'Every goroutine is blocked, e.g. sending on an unbuffered channel that nothing will ever receive from',
  },
  // Synchronization and tooling
  {
    front: 'Protect a shared counter with a mutex',
    back: go('mu.Lock()', 'defer mu.Unlock()', 'counter++'),
    extra: '`mu` is a `sync.Mutex`; for a single integer, `sync/atomic` also works.',
  },
  {
    front: 'Detect data races',
    back: code('bash', 'go test -race ./...'),
    extra: 'The race detector also works with `go run -race` and `go build -race`.',
  },
  {
    front: 'Cancel an HTTP request that takes longer than two seconds',
    back: go(
      'ctx, cancel := context.WithTimeout(ctx, 2*time.Second)',
      'defer cancel()',
      'req, err := http.NewRequestWithContext(ctx, "GET", url, nil)',
    ),
    extra: 'Always call `cancel`, even when the work finishes early, to release resources.',
  },
  {
    front: 'Start a module and tidy its dependencies',
    back: code('bash', 'go mod init example.com/app', 'go mod tidy'),
    extra: '`go mod tidy` adds missing requirements to `go.mod` and removes unused ones.',
  },
]

export const GO: PublicDeck = {
  slug: 'go-essentials',
  title: 'Go essentials: 50 cards on slices, errors, interfaces and goroutines',
  shortTitle: 'Go',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'Go (Golang) fundamentals with short, idiomatic snippets: slices vs arrays, maps, defer, error wrapping, interfaces, goroutines, channels, select and context.',
  intro:
    'Go is a small language, but its details matter: when append reallocates, why a nil pointer inside an interface isn’t nil, what order deferred calls run in, and what blocks on a channel. Each card is a precise rule or a short snippet in idiomatic, gofmt-style Go.',
  faq: [
    {
      q: 'Do the cards use modern Go?',
      a: 'Yes. They reflect current Go, including generics (1.18), per-iteration loop variables and range over integers (1.22), and WaitGroup.Go (1.25).',
    },
    {
      q: 'What is the difference between an array and a slice in Go?',
      a: 'An array has a fixed length that is part of its type and is copied when assigned. A slice is a lightweight view onto an array, with a length and a capacity, and is what Go code uses almost everywhere.',
    },
    {
      q: 'Should I use channels or a mutex?',
      a: 'Channels to pass data between goroutines or coordinate them; a mutex to protect a small piece of shared state. Both are idiomatic Go.',
    },
  ],
  cards: CARDS,
}
