import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const py = (...lines: string[]) => code('python', ...lines)

const CARDS: CardContent[] = [
  { front: 'Squares of 0–4 with a list comprehension', back: py('[x * x for x in range(5)]  # [0, 1, 4, 9, 16]') },
  { front: 'Dict comprehension', back: py('{word: len(word) for word in words}') },
  {
    front: 'Generator expression',
    back: 'Like a list comprehension in parentheses, but lazy: values are produced on demand',
    extra: py('total = sum(x * x for x in nums)'),
  },
  { front: 'Format a float to 2 decimals with an f-string', back: py('f"{price:.2f}"  # "3.14"') },
  { front: 'What does `*args` collect?', back: 'Extra positional arguments, as a tuple' },
  { front: 'What does `**kwargs` collect?', back: 'Extra keyword arguments, as a dict' },
  {
    front: 'Why is `def f(items=[])` a bug?',
    back: 'The default list is created once and shared between calls; use `None` and create the list inside',
    extra: py('def f(items=None):', '    items = [] if items is None else items'),
  },
  { front: 'Reverse a list or string with slicing', back: py('s[::-1]') },
  { front: 'What is `seq[-1]`?', back: 'The last item' },
  { front: 'List vs tuple', back: 'Lists are mutable; tuples are immutable (and hashable if their items are)' },
  { front: '`is` vs `==`', back: '`is` checks identity (same object); `==` checks equality' },
  { front: 'Falsy values in Python', back: "`None`, `False`, `0`, `0.0`, `''`, and empty containers like `[]`, `{}`, `set()`" },
  {
    front: 'What does a `with` block guarantee?',
    back: 'The context manager’s cleanup runs even if an exception is raised',
    extra: py('with open("notes.txt") as f:', '    text = f.read()  # file closed afterwards'),
  },
  { front: 'The context manager protocol', back: '`__enter__` and `__exit__` methods (or `contextlib.contextmanager`)' },
  {
    front: 'What is a decorator?',
    back: 'A function that takes a function and returns a wrapped version, applied with `@`',
    extra: py(
      'def logged(fn):',
      '    def wrapper(*args, **kwargs):',
      '        print("calling", fn.__name__)',
      '        return fn(*args, **kwargs)',
      '    return wrapper',
    ),
  },
  { front: 'Why use `functools.wraps`?', back: 'It copies the wrapped function’s name, docstring and metadata onto the wrapper' },
  {
    front: 'What does `yield` do?',
    back: 'Turns a function into a generator that produces values one at a time, pausing between them',
  },
  { front: '`yield from`', back: 'Delegates to another iterable or generator, yielding all its values' },
  { front: 'Loop with index and value', back: py('for i, item in enumerate(items, start=1):', '    print(i, item)') },
  {
    front: 'What does `zip` do with uneven lengths?',
    back: 'Stops at the shortest iterable',
    extra: 'Since Python 3.10, `zip(a, b, strict=True)` raises instead.',
  },
  { front: 'Read a dict key with a fallback', back: py('d.get("key", default)') },
  {
    front: '`collections.defaultdict`',
    back: 'A dict that creates a default value for missing keys',
    extra: py('groups = defaultdict(list)', 'groups[key].append(item)'),
  },
  {
    front: '`collections.Counter`',
    back: 'Counts hashable items',
    extra: py('Counter("banana").most_common(1)  # [(\'a\', 3)]'),
  },
  { front: '`sorted(x)` vs `x.sort()`', back: '`sorted` returns a new list; `.sort()` sorts in place and returns `None`' },
  { front: 'Sort words by length', back: py('sorted(words, key=len)') },
  {
    front: 'What is a `lambda`?',
    back: 'An anonymous function limited to a single expression',
    extra: py('square = lambda x: x * x'),
  },
  { front: 'Extended unpacking', back: py('first, *rest = [1, 2, 3]  # first = 1, rest = [2, 3]') },
  {
    front: 'The walrus operator `:=`',
    back: 'Assigns a value inside an expression (Python 3.8+)',
    extra: py('while (line := f.readline()):', '    process(line)'),
  },
  {
    front: 'When does the `else` of a `try` run?',
    back: 'Only if no exception was raised in the `try` block',
    extra: '`finally` always runs.',
  },
  { front: 'Raise an exception', back: py('raise ValueError("deck name is empty")') },
  { front: 'What is `__init__`?', back: 'The method that initializes a new instance' },
  { front: 'What is `self`?', back: 'The instance a method is called on, passed explicitly as the first parameter' },
  {
    front: '`@classmethod` vs `@staticmethod`',
    back: 'A classmethod receives the class (`cls`); a staticmethod receives neither the class nor the instance',
  },
  {
    front: 'What does `@property` do?',
    back: 'Lets a method be read like an attribute',
    extra: py('class Card:', '    @property', '    def is_new(self):', '        return self.reps == 0'),
  },
  { front: 'What does `@dataclass` generate?', back: '`__init__`, `__repr__` and `__eq__` from the class’s annotated fields' },
  {
    front: 'What is `if __name__ == "__main__":` for?',
    back: 'Code under it runs when the file is executed directly, not when it is imported',
  },
  { front: 'Create a virtual environment', back: code('bash', 'python -m venv .venv', 'source .venv/bin/activate') },
  {
    front: 'The GIL',
    back: 'In standard CPython, the global interpreter lock lets only one thread run Python bytecode at a time',
    extra:
      'Threads still help for I/O-bound work; use processes for CPU-bound work. Python 3.13 adds an optional free-threaded build.',
  },
  { front: 'Is the stop value of `range(start, stop)` included?', back: 'No, `stop` is exclusive: `range(1, 4)` gives 1, 2, 3' },
  { front: '`7 // 2` and `-7 // 2`', back: '`3` and `-4`: floor division rounds toward negative infinity' },
  {
    front: 'Shallow vs deep copy of a list',
    back: '`items[:]` or `list(items)` copy one level; `copy.deepcopy` copies nested objects too',
  },
  { front: 'Join a list of strings', back: py('", ".join(words)') },
  { front: 'Split a string on commas', back: py("\"a,b,c\".split(\",\")  # ['a', 'b', 'c']") },
  {
    front: 'Type hints',
    back: py('def add(a: int, b: int) -> int:', '    return a + b'),
    extra: 'Hints are not enforced at runtime; tools like mypy check them.',
  },
  {
    front: '`any` and `all`',
    back: '`any` is true if at least one item is truthy; `all` is true if every item is (and for an empty iterable)',
  },
  { front: 'What do `map` and `filter` return in Python 3?', back: 'Lazy iterators, not lists' },
  { front: 'Are dicts ordered?', back: 'Yes. Since Python 3.7, dicts keep insertion order as a language guarantee' },
  { front: 'Set operations', back: py('a | b   # union', 'a & b   # intersection', 'a - b   # difference') },
  { front: 'Check if a key is in a dict', back: py('if "key" in d:', '    ...') },
  { front: 'Unpack a dict into keyword arguments', back: py('connect(**config)') },
]

export const PYTHON: PublicDeck = {
  slug: 'python-essentials',
  title: 'Python essentials: 50 core concepts',
  shortTitle: 'Python',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'Learn idiomatic Python fast: comprehensions, f-strings, args and kwargs, generators, decorators, context managers and the standard library.',
  intro:
    'Fifty cards on the Python features that make code idiomatic: comprehensions, unpacking, generators, decorators, context managers and the collections module. Each answer is a one-liner or a short snippet you can type into a REPL.',
  faq: [
    {
      q: 'Which Python version does this deck use?',
      a: 'Python 3. Version-specific features, like the walrus operator (3.8) and zip(strict=True) (3.10), are marked.',
    },
    {
      q: 'Is this deck for complete beginners?',
      a: 'It suits anyone who has written a few Python scripts and wants the idioms to become automatic.',
    },
    {
      q: 'Can I add my own code cards?',
      a: 'Yes. Add the deck to your collection; cards support fenced code blocks with syntax highlighting.',
    },
  ],
  cards: CARDS,
}
