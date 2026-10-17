import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

// Math is LaTeX inside String.raw templates. Cards that mix math with `inline code`
// use plain strings with doubled backslashes, since String.raw would keep \` as is.
const r = String.raw
const c = (...lines: string[]) => code('c', ...lines)
const java = (...lines: string[]) => code('java', ...lines)
const py = (...lines: string[]) => code('python', ...lines)

const CARDS: CardContent[] = [
  // Numbers and bits
  {
    front: 'Convert binary `1011` to decimal',
    back: '11',
    extra: '8 + 0 + 2 + 1: each bit is worth twice the bit to its right.',
  },
  {
    front: 'Hex `0xFF` in decimal and in binary',
    back: '255, or `1111 1111`',
    extra:
      'One hex digit is exactly four bits (a nibble), so a byte is always two hex digits. That’s why hex is used for bytes, colors and memory addresses.',
  },
  { front: r`Range of an \(n\)-bit unsigned integer`, back: r`\(0\) to \(2^n - 1\), so a byte holds 0–255` },
  {
    front: 'Negate a number in two’s complement',
    back: 'Invert every bit, then add 1',
    extra: '5 is `0000 0101`; inverting gives `1111 1010`; adding 1 gives `1111 1011`, which is −5.',
  },
  {
    front: 'Range of an 8-bit two’s complement integer',
    back: r`−128 to 127; in general \(-2^{n-1}\) to \(2^{n-1} - 1\)`,
    extra:
      'Two’s complement has a single zero, and the CPU adds and subtracts signed numbers with the same circuits as unsigned ones. That’s why every modern CPU uses it.',
  },
  {
    front: 'What happens on integer overflow?',
    back: 'The result doesn’t fit the type. With wrapping arithmetic it wraps around: 127 + 1 in an 8-bit signed integer becomes −128',
    extra:
      'Languages differ: in C, signed overflow is undefined behavior (unsigned values wrap), Java wraps silently, Rust panics in debug builds, and Python integers simply grow.',
  },
  {
    front: 'What do `x << k` and `x >> k` do to a non-negative integer?',
    back: 'Multiply by \\(2^k\\) and divide by \\(2^k\\), rounding down',
    extra: '`5 << 3` is 40, and `40 >> 2` is 10.',
  },
  {
    front: 'Test whether a positive integer is a power of two',
    back: '`(x & (x - 1)) == 0`',
    extra:
      'A power of two has exactly one 1 bit. Subtracting 1 clears that bit and sets all the bits below it, so the AND is zero.',
  },
  {
    front: 'Big-endian vs little-endian',
    back: 'The byte order of multi-byte values: big-endian stores the most significant byte first, little-endian the least significant byte first',
    extra:
      'x86 and nearly all ARM systems are little-endian, so `0x12345678` is stored as `78 56 34 12`. Network protocols use big-endian (“network byte order”).',
  },
  // Big-O
  {
    front: 'What does Big-O notation describe?',
    back: 'How an algorithm’s running time or memory grows with the input size, as an upper bound that ignores constant factors and lower-order terms',
  },
  {
    front: r`Order by growth: \(O(n^2)\), \(O(1)\), \(O(n \log n)\), \(O(2^n)\), \(O(\log n)\), \(O(n)\)`,
    back: r`\(O(1) < O(\log n) < O(n) < O(n \log n) < O(n^2) < O(2^n)\)`,
  },
  {
    front: r`Simplify \(O(3n^2 + 5n + 100)\)`,
    back: r`\(O(n^2)\): drop constant factors and keep only the fastest-growing term`,
  },
  {
    front: `Time complexity of this loop?\n${py('i = 1', 'while i < n:', '    i *= 2')}`,
    back: r`\(O(\log n)\): \(i\) doubles on every pass, so the loop runs about \(\log_2 n\) times`,
  },
  {
    front: 'Time–space trade-off',
    back: r`Spending memory to save time, or the reverse: a hash set uses \(O(n)\) extra space so each lookup is \(O(1)\) instead of an \(O(n)\) scan`,
  },
  {
    front: 'P vs NP',
    back: 'P: problems solvable in polynomial time. NP: problems whose solutions can be checked in polynomial time. Whether P = NP is the most famous open question in computer science',
    extra:
      'NP-complete problems, such as SAT and the decision version of the traveling salesman problem, are the hardest in NP: a polynomial-time algorithm for any one of them would solve them all.',
  },
  // Memory
  {
    front: 'Stack vs heap',
    back: 'The stack holds function call frames and local variables, freed automatically when a function returns; it’s fast but small. The heap holds dynamically allocated data that can outlive a call; it’s larger but slower to manage',
    extra: 'Each thread has its own stack, while the heap is shared by all threads of a process.',
  },
  {
    front: 'What causes a stack overflow?',
    back: 'Using more stack than its fixed limit, usually through recursion that is too deep or never stops',
    extra: 'Default stack sizes are typically 1–8 MB, e.g. 8 MB for the main thread on Linux and 1 MB on Windows.',
  },
  {
    front: 'Memory leak',
    back: 'Memory that stays allocated after it’s no longer needed, so usage keeps growing',
    extra:
      'Garbage-collected languages leak too, through references you forgot about: ever-growing caches, global lists, event listeners that are never removed.',
  },
  {
    front: 'How does a tracing garbage collector decide what to free?',
    back: 'It frees objects that can no longer be reached from the roots: stack variables, globals and registers',
    extra:
      'Reference counting (used by CPython and Swift) frees an object when its count drops to zero, but can’t reclaim reference cycles on its own; CPython adds a cycle collector.',
  },
  {
    front: 'Dangling pointer (use-after-free)',
    back: 'A pointer to memory that has already been freed; reading or writing through it is undefined behavior and a classic security bug',
  },
  {
    front: 'Virtual memory',
    back: 'Each process gets its own private address space, which the OS and the CPU’s memory management unit (MMU) map onto physical memory in fixed-size pages',
    extra:
      'Pages are commonly 4 KiB. Virtual memory isolates processes from each other and lets the OS move rarely used pages to disk.',
  },
  {
    front: 'Page fault',
    back: 'An access to a virtual page that isn’t currently in physical memory. The OS loads or allocates the page, or kills the process if the address is invalid (a segmentation fault)',
  },
  // Processes, threads and concurrency
  {
    front: 'Process vs thread',
    back: 'A process is a running program with its own address space and resources. Threads run inside a process and share its memory, but each has its own stack and registers',
    extra: 'Threads are cheaper to create and switch between, but a bug in one thread can corrupt memory for all of them.',
  },
  {
    front: 'Context switch',
    back: 'The CPU saves the state (registers, program counter) of the running thread or process and restores another’s',
    extra: 'Besides the direct cost, the next thread starts with caches full of someone else’s data.',
  },
  {
    front: 'Concurrency vs parallelism',
    back: 'Concurrency is structuring a program to make progress on several tasks at once, possibly by interleaving them on one core. Parallelism is executing tasks at the same instant on multiple cores',
    extra:
      'Rob Pike: “Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of things at once.”',
  },
  {
    front: `Why can this lose updates when two threads run it?\n${java('// each thread runs this 1,000,000 times', 'count++;')}`,
    back: '`count++` is a read, an add and a write. Two threads can read the same old value and both write back that value + 1, so increments are lost. This is a race condition',
    extra: 'Fix it with a lock (`synchronized`) or an atomic counter (`AtomicInteger.incrementAndGet()`).',
  },
  {
    front: 'Mutex',
    back: 'A lock that lets only one thread at a time into a critical section; other threads block until it’s released',
  },
  {
    front: 'Semaphore vs mutex',
    back: 'A semaphore is a counter that lets up to N threads in at once, e.g. to share a pool of 10 connections. A mutex allows exactly one holder, and the thread that locked it must unlock it',
  },
  {
    front: 'Deadlock',
    back: 'Two or more threads each wait for a resource another one holds, so none of them can ever proceed',
    extra: 'Thread A holds lock 1 and waits for lock 2, while thread B holds lock 2 and waits for lock 1.',
  },
  {
    front: 'The four Coffman conditions for deadlock',
    back: 'Mutual exclusion, hold and wait, no preemption, circular wait',
    extra: 'Deadlock needs all four at once, so breaking any one of them prevents it.',
  },
  {
    front: 'Simplest practical way to prevent deadlocks between locks',
    back: 'Always acquire locks in the same global order, which makes circular wait impossible',
    extra: 'Timeouts are another option: `tryLock` with a deadline gives up and retries instead of waiting forever.',
  },
  {
    front: 'Livelock vs starvation',
    back: 'Livelock: threads keep reacting to each other and changing state, but none makes progress. Starvation: a thread waits indefinitely because others keep getting the resource first',
  },
  {
    front: 'Atomic operation',
    back: 'An operation that other threads see as all or nothing; no thread can observe it half done',
    extra:
      'Compare-and-swap (CAS) is the hardware building block of lock-free code: write the new value only if the current value is still the one you expect.',
  },
  // CPU caches
  {
    front: 'Why do CPUs have caches?',
    back: 'Main memory takes about 100 ns to respond, roughly 100 times longer than the nearest cache, so small, fast caches keep recently used data close to the cores',
  },
  {
    front: 'L1, L2 and L3 caches',
    back: 'L1 is the smallest and fastest, private to each core; L2 is larger and slower; L3 is the largest and slowest, usually shared by all cores, yet still much faster than RAM',
    extra: 'Typical sizes: tens of KB for L1, hundreds of KB to a few MB for L2, and many MB for L3.',
  },
  {
    front: 'Temporal vs spatial locality',
    back: 'Temporal: data used recently is likely to be used again soon. Spatial: data near recently used data is likely to be used soon',
    extra: 'Caches exploit spatial locality by loading whole cache lines, typically 64 bytes, rather than single bytes.',
  },
  {
    front: `Why is this loop faster in C than the same loop summing \`a[j][i]\`?\n${c('for (int i = 0; i < N; i++)', '    for (int j = 0; j < N; j++)', '        sum += a[i][j];')}`,
    back: 'C stores 2D arrays row by row (row-major), so `a[i][j]` walks memory sequentially and uses every byte of each cache line. `a[j][i]` jumps a whole row on each step and misses the cache far more often',
  },
  // Compilers and interpreters
  {
    front: 'Compiler vs interpreter',
    back: 'A compiler translates the whole program ahead of time into machine code (or another language). An interpreter executes the program directly at runtime, from source or bytecode',
    extra:
      'Real implementations mix both: Java compiles to bytecode that the JVM interprets and JIT-compiles, and CPython compiles to bytecode that it then interprets.',
  },
  {
    front: 'JIT (just-in-time) compilation',
    back: 'Compiling frequently run (“hot”) code to machine code while the program runs, using what it observes at runtime to optimize it',
    extra: 'Used by the JVM’s HotSpot, JavaScript engines such as V8, and .NET.',
  },
  {
    front: 'Main phases of a compiler',
    back: 'Lexing (characters → tokens), parsing (tokens → syntax tree), semantic analysis (types and scopes), optimization of an intermediate representation, and code generation',
  },
  {
    front: 'Static vs dynamic typing',
    back: 'Static: types are checked at compile time (Java, Rust, TypeScript). Dynamic: values carry their types, which are checked at runtime (Python, JavaScript, Ruby)',
  },
  // Character encodings
  {
    front: 'ASCII',
    back: 'A 7-bit character encoding with 128 codes: English letters, digits, punctuation and control characters',
    extra: '`A` is 65, `a` is 97 and `0` is 48.',
  },
  {
    front: 'Unicode vs UTF-8',
    back: 'Unicode gives every character a number, its code point (U+0000 to U+10FFFF). UTF-8 is one way of encoding those code points as bytes',
  },
  {
    front: 'How many bytes does UTF-8 use per character?',
    back: '1 to 4. ASCII characters take 1 byte (so ASCII text is already valid UTF-8), `é` takes 2, `€` takes 3 and most emoji take 4',
  },
  {
    front: 'Why is `"😀".length` 2 in JavaScript?',
    back: 'JavaScript strings are UTF-16, and `length` counts 16-bit code units. Characters above U+FFFF, like most emoji, need two of them (a surrogate pair)',
    extra: 'Java and the Windows APIs use UTF-16 too. `[..."😀"].length` counts code points and gives 1.',
  },
  // Floating point
  {
    front: 'Why is `0.1 + 0.2 == 0.3` false?',
    back: 'Binary floating point can’t represent 0.1 or 0.2 exactly, so the sum comes out as `0.30000000000000004`',
    extra: 'Just as 1/3 never ends in decimal, 1/10 is a repeating fraction in binary.',
  },
  {
    front: 'Layout of an IEEE 754 double (64-bit float)',
    back: '1 sign bit, 11 exponent bits and 52 fraction bits, giving about 15–17 significant decimal digits',
    extra:
      'A 32-bit float has 1, 8 and 23 bits (about 7 digits). Every integer up to \\(2^{53}\\) is exact in a double, which is why JavaScript’s `Number.MAX_SAFE_INTEGER` is \\(2^{53} - 1\\).',
  },
  {
    front: 'How should you compare two floats for equality?',
    back: 'Check whether they are within a small tolerance of each other instead of using `==`',
    extra: py('import math', 'math.isclose(0.1 + 0.2, 0.3)  # True'),
  },
  {
    front: 'Why not store money in floats?',
    back: 'Rounding errors creep in and accumulate; store whole cents as integers or use a decimal type',
  },
  {
    front: 'What is special about NaN?',
    back: 'It means “not a number”, the result of invalid operations like `0 / 0` in JavaScript, and it compares unequal to everything, including itself',
    extra: 'Test for it with `Number.isNaN(x)` or `math.isnan(x)`; `x != x` is true only when `x` is NaN.',
  },
]

export const COMPUTER_SCIENCE: PublicDeck = {
  slug: 'computer-science',
  title: 'Computer science basics: 50 cards on bits, memory and concurrency',
  shortTitle: 'Computer science',
  category: 'cs',
  level: 'beginner',
  icon: 'brain',
  description:
    'CS fundamentals: binary and hex, two’s complement, Big-O, stack vs heap, threads and deadlocks, CPU caches, compilers, UTF-8 and floating point.',
  intro:
    'The fundamentals a computer science degree covers early on, in fifty cards: how numbers live in bits, how running time grows with input, where memory comes from, what goes wrong when threads share it, why caches and compilers matter for speed, and why text encodings and floating point surprise so many programmers.',
  faq: [
    {
      q: 'Do I need a computer science degree to use this deck?',
      a: 'No. The cards assume you can read a little code and explain each concept from scratch, with short examples in C, Java and Python.',
    },
    {
      q: 'How is this different from the data structures and algorithms deck?',
      a: 'That deck goes deep on the complexity of specific data structures and algorithms. This one covers what sits underneath: bits, memory, processes and threads, caches, compilers and number formats.',
    },
    {
      q: 'Why does 0.1 + 0.2 not equal 0.3?',
      a: 'Computers store floating-point numbers in binary, where 0.1 is a repeating fraction, like 1/3 in decimal. The stored values are slightly off, and the error shows up in the sum.',
    },
  ],
  cards: CARDS,
}
