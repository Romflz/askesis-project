import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const jv = (...lines: string[]) => code('java', ...lines)

const CARDS: CardContent[] = [
  // Types and basics
  {
    front: 'Java’s eight primitive types',
    back: '`byte`, `short`, `int`, `long`, `float`, `double`, `char` and `boolean`; everything else, including `String` and arrays, is a reference type',
  },
  {
    front: `What does this print?\n${jv('System.out.println(7 / 2);', 'System.out.println(7 / 2.0);')}`,
    back: '`3`, then `3.5`: dividing two `int`s is integer division, which truncates toward zero',
  },
  {
    front: '`==` vs `.equals()` on strings',
    back: '`==` checks whether two references point to the same object; `.equals()` compares the characters. Use `.equals()` for content',
    extra: '`"a" == "a"` can be true because literals are interned, which hides the bug until a string comes from user input.',
  },
  {
    front: `What does this print?\n${jv('Integer a = 127, b = 127;', 'Integer c = 128, d = 128;', 'System.out.println(a == b);', 'System.out.println(c == d);')}`,
    back: '`true`, then `false`: autoboxing reuses cached `Integer` objects from -128 to 127, but larger values are separate objects. Compare boxed numbers with `.equals()`',
  },
  {
    front: `What does this print?\n${jv('String s = "hello";', 's.toUpperCase();', 'System.out.println(s);')}`,
    back: '`hello`: strings are immutable, so `toUpperCase()` returns a new string, which is thrown away here',
    extra: 'Write `s = s.toUpperCase();` to keep the result.',
  },
  {
    front: 'Why use `StringBuilder` to build a string in a loop?',
    back: 'Each `s += x` copies the whole string into a new object, which is quadratic over a loop; `StringBuilder` appends into a growable buffer',
    extra: jv(
      'var sb = new StringBuilder();',
      "for (String w : words) sb.append(w).append(' ');",
      'String result = sb.toString();',
    ),
  },
  {
    front: 'What does `var` do in Java?',
    back: 'Infers a local variable’s type from its initializer at compile time (Java 10+); the variable is still statically typed',
    extra: 'Only for local variables with an initializer (and loop variables), not fields, parameters or return types.',
  },
  {
    front: 'What is `Integer.MAX_VALUE + 1`?',
    back: '`-2147483648` (`Integer.MIN_VALUE`): `int` arithmetic overflows silently and wraps around',
    extra: '`Math.addExact` and friends throw `ArithmeticException` on overflow instead.',
  },
  {
    front: 'Is Java pass-by-value or pass-by-reference?',
    back: 'Always pass-by-value. For objects the value copied is the reference, so a method can mutate the object, but reassigning the parameter doesn’t affect the caller',
  },
  {
    front: 'A `switch` expression with arrow labels',
    back: jv('String size = switch (n) {', '    case 0 -> "none";', '    case 1, 2 -> "few";', '    default -> "many";', '};'),
    extra: 'Java 14+. Arrow cases never fall through, and a switch expression must cover every possible value.',
  },
  {
    front: 'A multi-line string literal',
    back: jv('String json = """', '    {', '      "name": "Ada"', '    }', '    """;'),
    extra: 'Text blocks (Java 15+) strip the common indentation; the position of the closing `"""` counts too.',
  },
  // Classes and objects
  {
    front: 'Java’s four access levels',
    back: '`private` (the class only), package-private (no modifier: the same package), `protected` (the package plus subclasses) and `public` (everywhere)',
  },
  {
    front: 'What does `static` mean on a field or method?',
    back: 'It belongs to the class, not to an instance: there is one shared copy, accessed as `ClassName.member`. Static methods have no `this`',
  },
  {
    front: '`final` on a variable, a method and a class',
    back: 'A `final` variable can’t be reassigned, a `final` method can’t be overridden, and a `final` class can’t be subclassed',
    extra: 'A `final List<String>` can still be modified with `add`; only the reference is fixed.',
  },
  {
    front: 'Abstract class vs interface',
    back: 'A class can extend only one class, which may have fields and constructors; it can implement many interfaces, which hold no instance state but can have `default`, `static` and `private` methods',
  },
  {
    front: 'Overloading vs overriding',
    back: 'Overloading: same name, different parameter lists, picked at compile time. Overriding: a subclass redefines an inherited method with the same signature, picked at runtime from the object’s actual class',
  },
  {
    front: `What does this print?\n${jv('class Animal { String sound() { return "..."; } }', 'class Dog extends Animal { String sound() { return "Woof"; } }', '', 'Animal a = new Dog();', 'System.out.println(a.sound());')}`,
    back: '`Woof`: instance methods are dispatched on the object’s runtime class, not the variable’s declared type',
    extra: 'Annotate overriding methods with `@Override` so the compiler catches signature typos.',
  },
  {
    front: 'If you override `equals`, what else must you override?',
    back: '`hashCode`: objects that are equal must return the same hash code, or `HashMap` and `HashSet` won’t find them',
    extra: 'Records generate both methods for you.',
  },
  // Records, sealed types and pattern matching
  {
    front: 'What does `record Point(int x, int y) {}` give you?',
    back: 'An immutable data class (Java 16+): private final fields, a constructor, accessors `x()` and `y()`, and `equals`, `hashCode` and `toString`',
    extra: 'Accessors are `p.x()`, not `p.getX()`. Records are implicitly final and can’t extend another class.',
  },
  {
    front: 'Validate a record’s fields',
    back: jv(
      'record Range(int lo, int hi) {',
      '    Range {',
      '        if (lo > hi) throw new IllegalArgumentException("lo > hi");',
      '    }',
      '}',
    ),
    extra: 'A compact constructor has no parameter list; the fields are assigned automatically after its body runs.',
  },
  {
    front: 'What does `sealed` do?',
    back: 'Limits which classes may extend or implement a type (Java 17+), so the compiler knows every subtype',
    extra: jv(
      'sealed interface Shape permits Circle, Square {}',
      'record Circle(double r) implements Shape {}',
      'record Square(double side) implements Shape {}',
    ),
  },
  {
    front: 'Check a type and cast it in one step',
    back: jv('if (obj instanceof String s && !s.isBlank()) {', '    System.out.println(s.length());', '}'),
    extra: 'Pattern matching for `instanceof`, Java 16+.',
  },
  {
    front: 'Switch over a sealed type without a `default`',
    back: jv(
      'double area = switch (shape) {',
      '    case Circle c -> Math.PI * c.r() * c.r();',
      '    case Square s -> s.side() * s.side();',
      '};',
    ),
    extra:
      'Pattern matching for `switch` (Java 21+). Because `Shape` is sealed, the compiler can check that the cases are exhaustive.',
  },
  {
    front: 'Destructure a record in a pattern',
    back: jv('if (obj instanceof Point(int x, int y)) {', '    System.out.println(x + y);', '}'),
    extra: 'Record patterns, Java 21+. They work in `switch` cases too.',
  },
  // Collections
  {
    front: 'The core collection interfaces and their usual implementations',
    back: '`List` (ordered, allows duplicates): `ArrayList`. `Set` (no duplicates): `HashSet`. `Map` (keys to values): `HashMap`. `Deque` (queue or stack): `ArrayDeque`',
  },
  {
    front: '`ArrayList` vs `LinkedList`',
    back: '`ArrayList` has O(1) indexed access and fast appends; `LinkedList` has O(n) indexed access and poor memory locality, so `ArrayList` (or `ArrayDeque` for queues) is almost always the better choice',
  },
  {
    front: '`HashMap` vs `LinkedHashMap` vs `TreeMap`',
    back: 'Iteration order: unspecified, insertion order, and sorted by key. The hash maps are O(1) on average; `TreeMap` is O(log n)',
  },
  {
    front: `What happens here?\n${jv('List<String> xs = List.of("a", "b");', 'xs.add("c");')}`,
    back: 'An `UnsupportedOperationException`: `List.of` (Java 9+) returns an unmodifiable list',
    extra: 'It also rejects `null` elements. Use `new ArrayList<>(List.of("a", "b"))` for a mutable copy.',
  },
  {
    front: 'What goes wrong when you remove items from a list inside a for-each loop?',
    back: 'It usually throws `ConcurrentModificationException`. Use `list.removeIf(x -> …)`, or an explicit `Iterator` and its `remove()`',
  },
  {
    front: 'Count words in a `Map<String, Integer>`',
    back: jv('counts.merge(word, 1, Integer::sum);'),
    extra: 'Stores 1 for a new key; otherwise adds 1 to the existing count.',
  },
  {
    front: 'Add to a `Map<String, List<String>>`, creating each list on first use',
    back: jv('byCity.computeIfAbsent(city, k -> new ArrayList<>()).add(name);'),
  },
  {
    front: 'Sort people by age, then by name',
    back: jv('people.sort(Comparator.comparing(Person::age)', '        .thenComparing(Person::name));'),
    extra: 'Add `.reversed()` to flip an order.',
  },
  {
    front: 'The `Arrays.asList(array)` gotcha',
    back: 'The list is fixed-size and backed by the array: `set` writes through to the array, but `add` and `remove` throw `UnsupportedOperationException`',
  },
  // Generics
  {
    front: 'Why doesn’t `List<int>` compile?',
    back: 'Type arguments must be reference types. Use `List<Integer>`; autoboxing converts between `int` and `Integer`',
    extra: 'Unboxing a `null` `Integer` into an `int` throws `NullPointerException`.',
  },
  {
    front: 'What is type erasure?',
    back: 'Generic type arguments exist only at compile time; at runtime `List<String>` and `List<Integer>` are both plain `List`. So `new T()`, `T.class` and `x instanceof List<String>` aren’t allowed',
  },
  {
    front: 'Is a `List<Integer>` a `List<Number>`?',
    back: 'No. Generics are invariant; otherwise you could add a `Double` to a list of integers. Accept `List<? extends Number>` to take both',
    extra: 'Arrays are covariant instead, so `Object[] a = new String[1]; a[0] = 1;` compiles and throws `ArrayStoreException`.',
  },
  {
    front: '`? extends T` vs `? super T`',
    back: '“Producer extends, consumer super” (PECS): you can read `T`s out of a `List<? extends T>` and add `T`s to a `List<? super T>`',
    extra: jv(
      'static void addOnes(List<? super Integer> xs) {',
      '    xs.add(1); // works for List<Integer>, List<Number>, List<Object>',
      '}',
    ),
  },
  // Exceptions
  {
    front: 'Checked vs unchecked exceptions',
    back: 'Checked exceptions (subclasses of `Exception` other than `RuntimeException`) must be caught or declared with `throws`; unchecked ones (`RuntimeException`, `Error` and their subclasses) needn’t be',
    extra: '`IOException` is checked; `NullPointerException` and `IllegalArgumentException` are unchecked.',
  },
  {
    front: 'Read a file and make sure it gets closed',
    back: jv('try (var reader = Files.newBufferedReader(path)) {', '    return reader.readLine();', '}'),
    extra: 'try-with-resources closes any `AutoCloseable` when the block exits, even when it throws.',
  },
  {
    front: `What does \`f()\` return?\n${jv('static int f() {', '    try { return 1; }', '    finally { return 2; }', '}')}`,
    back: '`2`: `finally` runs even after `return`, and a `return` inside it replaces the earlier one',
    extra: 'Never return from `finally`: it also silently discards exceptions.',
  },
  {
    front: 'Handle two exception types in one `catch`',
    back: jv('try {', '    load();', '} catch (IOException | SQLException e) {', '    log.error("load failed", e);', '}'),
  },
  // Lambdas and streams
  {
    front: 'Get the sorted names of all adults with a stream',
    back: jv(
      'List<String> names = people.stream()',
      '        .filter(p -> p.age() >= 18)',
      '        .map(Person::name)',
      '        .sorted()',
      '        .toList();',
    ),
    extra: '`Stream.toList()` (Java 16+) returns an unmodifiable list; before that, use `collect(Collectors.toList())`.',
  },
  {
    front: 'When do stream operations actually run?',
    back: 'Lazily: intermediate operations like `filter` and `map` do nothing until a terminal operation such as `toList`, `forEach` or `count` runs',
    extra: 'A stream can be consumed only once; reusing it throws `IllegalStateException`.',
  },
  {
    front: 'How should you use the `Optional` returned by `findFirst()`?',
    back: 'Unwrap it with `orElse(default)`, `orElseThrow()`, `map(…)` or `ifPresent(…)` instead of calling `get()` blindly',
    extra: jv(
      'String name = users.stream()',
      '        .filter(User::isAdmin)',
      '        .map(User::name)',
      '        .findFirst()',
      '        .orElse("nobody");',
    ),
  },
  {
    front: 'Group people by city',
    back: jv('Map<String, List<Person>> byCity = people.stream()', '        .collect(Collectors.groupingBy(Person::city));'),
    extra: '`groupingBy(Person::city, Collectors.counting())` counts per city instead.',
  },
  {
    front: 'What is a functional interface?',
    back: 'An interface with a single abstract method, which a lambda or method reference can implement: `Function<T, R>`, `Predicate<T>`, `Supplier<T>`, `Consumer<T>`, `Runnable`…',
  },
  {
    front: `Why doesn’t this compile?\n${jv('int count = 0;', 'list.forEach(x -> count++);')}`,
    back: 'Lambdas can only capture local variables that are effectively final, i.e. never reassigned',
    extra: 'Use `list.size()` or a stream’s `count()` instead.',
  },
  // The JVM
  {
    front: 'What happens between `javac` and running a Java program?',
    back: '`javac` compiles `.java` source into platform-independent bytecode (`.class` files); the JVM loads it, interprets it, and JIT-compiles hot code to native machine code',
    extra: 'Since Java 11, `java Main.java` compiles and runs a single source file in one step.',
  },
  {
    front: 'Stack vs heap in the JVM',
    back: 'Each thread’s stack holds method frames with local variables and references; objects live on the shared heap, where the garbage collector frees them once they’re unreachable',
    extra: 'Deep recursion throws `StackOverflowError`; running out of heap throws `OutOfMemoryError`.',
  },
  {
    front: 'What are virtual threads?',
    back: 'Lightweight threads scheduled by the JVM rather than the OS (Java 21+), so you can afford one thread per task for blocking I/O, even millions of them',
    extra: jv(
      'try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {',
      '    urls.forEach(url -> executor.submit(() -> fetch(url)));',
      '} // close() waits for the tasks',
    ),
  },
]

export const JAVA: PublicDeck = {
  slug: 'java-essentials',
  title: 'Java essentials: 50 cards on OOP, collections, generics and streams',
  shortTitle: 'Java',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'Core Java with short snippets: equals vs ==, records, sealed types, collections, generics, exceptions, streams, lambdas and JVM basics.',
  intro:
    'Java rewards knowing its rules precisely: why `==` fails on strings, which `Integer`s autoboxing caches, which lists are unmodifiable and when a stream actually runs. These cards cover classes and interfaces, collections, generics and exceptions, modern features like records, sealed types and pattern matching, and enough of the JVM to reason about memory and threads.',
  faq: [
    {
      q: 'Which Java version do the cards use?',
      a: 'Modern Java: everything works on the current LTS releases (21 and 25). Newer features are marked with the version that introduced them, such as records (16), sealed classes (17) and virtual threads (21).',
    },
    {
      q: 'Is this deck useful for Java interviews?',
      a: 'Yes. It covers the classic questions (equals and hashCode, checked vs unchecked exceptions, ArrayList vs LinkedList, pass-by-value) alongside modern Java.',
    },
    {
      q: 'Does it cover Spring or other frameworks?',
      a: 'No. It sticks to the language, the standard library and the JVM, which every Java framework builds on.',
    },
  ],
  cards: CARDS,
}
