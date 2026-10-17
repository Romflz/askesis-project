import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const kt = (...lines: string[]) => code('kotlin', ...lines)

const CARDS: CardContent[] = [
  // Null safety
  {
    front: '`String` vs `String?` in Kotlin',
    back: '`String` can never hold `null`; `String?` can. The compiler won’t let you assign `null` to a `String`, or call methods on a `String?` without handling the null case',
  },
  {
    front: 'What does `user?.address?.city` evaluate to if `address` is null?',
    back: '`null`: a safe call `?.` short-circuits to `null` instead of throwing',
  },
  {
    front: 'The Elvis operator `?:`',
    back: 'Returns the left side if it isn’t null, otherwise the right side',
    extra: kt('val name = input ?: "anonymous"', 'val user = findUser(id) ?: return  // early exit'),
  },
  {
    front: 'What does `!!` do?',
    back: 'Asserts that a value isn’t null and throws `NullPointerException` if it is. Treat every `!!` as a possible crash',
  },
  {
    front: `What does this print?\n${kt('val s: String? = null', 'println(s?.length ?: -1)')}`,
    back: '`-1`: `s?.length` is `null`, so the Elvis operator supplies `-1`',
  },
  {
    front: 'What is a smart cast?',
    back: 'After a check like `if (s != null)` or `if (x is String)`, the compiler treats the value as the narrower type, with no explicit cast',
    extra: 'It doesn’t work on a mutable `var` property, because the value could change between the check and the use.',
  },
  { front: 'Run a block only when a value isn’t null', back: kt('email?.let { sendWelcome(it) }') },
  {
    front: 'Cast without risking a `ClassCastException`',
    back: kt('val n = value as? Int ?: 0'),
    extra: '`as?` returns `null` when the cast fails; plain `as` throws.',
  },
  {
    front: 'What are platform types like `String!`?',
    back: 'Types coming from Java code without nullability annotations. Kotlin lets you treat them as nullable or not, so a wrong guess can throw `NullPointerException` at runtime',
  },
  // Basics
  {
    front: '`val` vs `var`',
    back: '`val` is a read-only reference that can’t be reassigned; `var` can be. Prefer `val`',
    extra: '`val` doesn’t make the object immutable: `val xs = mutableListOf(1)` can still `add`.',
  },
  {
    front: '`val` vs `const val`',
    back: '`const val` is a compile-time constant: a top-level or `object` member of a primitive type or `String`. A plain `val` can be computed at runtime',
  },
  {
    front: 'String templates',
    back: kt('println("Hello, $name! You have ${cart.size} items")'),
    extra: 'Use `${…}` for anything beyond a simple name.',
  },
  {
    front: 'Write a ternary in Kotlin',
    back: kt('val max = if (a > b) a else b'),
    extra: 'Kotlin has no `cond ? a : b` operator; `if` and `when` are expressions that return values.',
  },
  {
    front: 'A `when` expression',
    back: kt('val size = when (n) {', '    0 -> "none"', '    1, 2 -> "few"', '    in 3..9 -> "some"', '    else -> "many"', '}'),
  },
  {
    front: 'Ranges: `1..5`, `1..<5`, `5 downTo 1`',
    back: '`1..5` includes 5; `1..<5` (or `1 until 5`) stops before 5; `5 downTo 1` counts down. Add `step 2` to skip values',
    extra: 'The `..<` operator is stable since Kotlin 1.9.',
  },
  {
    front: '`==` vs `===` in Kotlin',
    back: '`==` compares structurally by calling `equals` (and handles null); `===` checks whether both references point to the same object',
  },
  {
    front: 'Default and named arguments',
    back: kt(
      'fun greet(name: String, greeting: String = "Hello") =',
      '    println("$greeting, $name")',
      '',
      'greet("Ada")',
      'greet(greeting = "Hi", name = "Ada")',
    ),
    extra: 'They replace most overloads and builder patterns.',
  },
  {
    front: 'A single-expression function',
    back: kt('fun square(x: Int) = x * x'),
    extra: 'The return type (`Int`) is inferred from the expression.',
  },
  {
    front: '`Unit` vs `Nothing`',
    back: '`Unit` is the return type of functions with no useful result (like `void`, but a real object); `Nothing` is the type of expressions that never complete, like `throw` and `TODO()`',
  },
  // Classes
  {
    front: 'What does `data class User(val name: String, val age: Int)` generate?',
    back: '`equals`, `hashCode`, `toString`, `copy`, and `component1()` and `component2()` for destructuring, all based on the primary constructor’s properties',
  },
  {
    front: `What does this print?\n${kt('data class User(val name: String, val age: Int)', 'println(User("Ada", 36))')}`,
    back: '`User(name=Ada, age=36)`',
    extra: 'A regular class would print something like `User@1b6d3586`.',
  },
  {
    front: 'Copy a data class with one property changed',
    back: kt('val older = user.copy(age = 37)'),
    extra: '`copy` is shallow: nested objects are shared, not cloned.',
  },
  {
    front: 'Destructure a data class',
    back: kt('val (name, age) = user'),
    extra: 'Destructuring is positional: it uses `component1()`, `component2()`… in constructor order, not property names.',
  },
  {
    front: 'Can you subclass any Kotlin class?',
    back: 'No. Classes and members are `final` by default: mark the class `open` to allow subclassing, and each method `open` to allow overriding it with `override`',
  },
  {
    front: 'Declare properties directly in the constructor',
    back: kt(
      'class Person(val name: String, var age: Int) {',
      '    init {',
      '        require(age >= 0) { "age must be >= 0" }',
      '    }',
      '}',
    ),
    extra: '`val` or `var` in the primary constructor creates a property; `init` blocks run as part of construction.',
  },
  {
    front: 'Kotlin’s replacement for `static` members',
    back: 'An `object` declaration is a singleton; a `companion object` inside a class holds members you call on the class, like `User.create()`',
    extra: kt(
      'class User private constructor(val name: String) {',
      '    companion object {',
      '        fun create(name: String) = User(name.trim())',
      '    }',
      '}',
    ),
  },
  {
    front: 'Model a closed set of results with a sealed interface',
    back: kt(
      'sealed interface Result',
      'data class Success(val data: String) : Result',
      'data class Failure(val error: Throwable) : Result',
      '',
      'fun render(r: Result) = when (r) {',
      '    is Success -> r.data',
      '    is Failure -> "Error: ${r.error.message}"',
      '}',
    ),
    extra: 'The compiler knows every subtype, so `when` needs no `else` and flags missing cases.',
  },
  {
    front: 'Sealed class vs enum class',
    back: 'Each enum constant is a single instance; a sealed type’s subclasses are ordinary classes that can have many instances, each with its own state',
  },
  {
    front: '`lateinit var` vs `by lazy`',
    back: '`lateinit var` is a non-null property you assign later (reading it first throws); `val x by lazy { … }` computes its value on first access and caches it',
    extra: '`lateinit` doesn’t work with primitive types like `Int`; `lazy` is thread-safe by default.',
  },
  {
    front: 'What does `internal` visibility mean?',
    back: 'Visible everywhere in the same module, such as one Gradle module, but not outside it',
    extra: 'Kotlin’s default visibility is `public`.',
  },
  // Extension functions
  {
    front: 'Add a function to `String` without subclassing it',
    back: kt('fun String.shout() = uppercase() + "!"', '', 'println("hi".shout()) // HI!'),
    extra: 'Inside an extension function, `this` is the receiver.',
  },
  {
    front: 'Are extension functions dispatched virtually?',
    back: 'No. They are resolved statically from the declared type, can’t access private members, and lose to a member function with the same signature',
  },
  // Collections and lambdas
  {
    front: '`listOf` vs `mutableListOf`',
    back: '`listOf` returns a read-only `List` (no `add`); `mutableListOf` returns a `MutableList`',
    extra: 'Read-only isn’t immutable: a `List` reference can point to a list that other code mutates.',
  },
  {
    front: 'Get the sorted names of all adults',
    back: kt('val names = users', '    .filter { it.age >= 18 }', '    .map { it.name }', '    .sorted()'),
    extra: '`it` is the implicit name of a lambda’s single parameter.',
  },
  {
    front: 'What is trailing lambda syntax?',
    back: 'When a function’s last parameter is a function, the lambda can go outside the parentheses, and the parentheses can be dropped if it is the only argument',
    extra: kt('repeat(3) { println("hi") }', 'names.forEach { println(it) }'),
  },
  {
    front: 'Group users by city',
    back: kt('val byCity: Map<String, List<User>> = users.groupBy { it.city }'),
    extra: '`associateBy { it.id }` builds a map with one value per key instead.',
  },
  {
    front: 'When should you use `asSequence()`?',
    back: 'For long chains over large collections: sequences process elements lazily, one at a time, instead of building an intermediate list after every step',
    extra: kt('val firstBig = numbers.asSequence()', '    .map { it * it }', '    .first { it > 1_000 }'),
  },
  {
    front: `What does this print?\n${kt('fun firstEven(xs: List<Int>): Int {', '    xs.forEach { if (it % 2 == 0) return it }', '    return -1', '}', '', 'println(firstEven(listOf(1, 4, 6)))')}`,
    back: '`4`: a bare `return` inside the lambda of an inline function like `forEach` returns from the enclosing function',
    extra: 'Use `return@forEach` to skip to the next element instead.',
  },
  // Scope functions
  {
    front: 'The five scope functions at a glance',
    back: '`let` (`it`, returns the lambda result), `run` (`this`, lambda result), `with` (`this`, lambda result, not an extension), `apply` (`this`, returns the object), `also` (`it`, returns the object)',
  },
  {
    front: 'Which scope function configures an object and returns it?',
    back: kt('val user = User().apply {', '    name = "Ada"', '    age = 36', '}'),
    extra: '`apply` runs the block with the object as `this` and returns the object itself.',
  },
  {
    front: 'Which scope function adds a side effect, like logging, in a chain?',
    back: kt('val user = repository.save(newUser)', '    .also { log.info("saved ${it.id}") }'),
    extra: '`also` receives the object as `it` and returns it unchanged.',
  },
  {
    front: `What are \`a\` and \`b\`?\n${kt('val a = "hello".let { it.length }', 'val b = "hello".also { it.length }')}`,
    back: '`a` is `5`, because `let` returns the lambda’s result; `b` is `"hello"`, because `also` returns the receiver',
  },
  // Coroutines
  {
    front: 'What is a `suspend` function?',
    back: 'A function that can pause without blocking its thread, e.g. while waiting for I/O, and resume later. It can only be called from a coroutine or another `suspend` function',
  },
  {
    front: '`launch` vs `async`',
    back: '`launch` starts a coroutine for its side effects and returns a `Job`; `async` starts one that produces a value and returns a `Deferred<T>`, read with `await()`',
  },
  {
    front: 'Fetch two things concurrently and combine them',
    back: kt(
      'suspend fun loadPage() = coroutineScope {',
      '    val user = async { api.fetchUser() }',
      '    val posts = async { api.fetchPosts() }',
      '    Page(user.await(), posts.await())',
      '}',
    ),
  },
  {
    front: 'What is structured concurrency?',
    back: 'Every coroutine runs inside a scope that waits for all its children; cancelling the scope cancels them, and a failing child cancels its siblings and parent, so nothing leaks',
    extra: 'A `supervisorScope` lets children fail independently.',
  },
  {
    front: 'Which dispatcher for which work?',
    back: '`Dispatchers.Main` for UI, `Dispatchers.IO` for blocking I/O, `Dispatchers.Default` for CPU-heavy work. Switch with `withContext`',
    extra: kt('val text = withContext(Dispatchers.IO) { file.readText() }'),
  },
  {
    front: '`delay()` vs `Thread.sleep()`',
    back: '`delay` suspends the coroutine and frees the thread for other work; `Thread.sleep` blocks the whole thread',
  },
  {
    front: 'When is `runBlocking` appropriate?',
    back: 'Only to bridge blocking code into coroutines, such as in `main` or tests. It blocks the current thread, so never use it inside coroutines or on a UI thread',
  },
  {
    front: 'What is a `Flow`?',
    back: 'A cold asynchronous stream: the `flow { … }` block runs again for each collector, sending values with `emit` that are received with `collect`',
    extra: kt('flow { for (i in 1..3) { delay(100); emit(i) } }', '    .collect { println(it) }'),
  },
]

export const KOTLIN: PublicDeck = {
  slug: 'kotlin-essentials',
  title: 'Kotlin essentials: 50 cards on null safety, data classes and coroutines',
  shortTitle: 'Kotlin',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'Kotlin fundamentals with short snippets: null safety, val vs var, data and sealed classes, extension functions, scope functions and coroutines.',
  intro:
    'Kotlin removes much of Java’s ceremony but adds its own vocabulary: safe calls and the Elvis operator, data and sealed classes, extension functions, five scope functions that look alike, and coroutines with structured concurrency. Each card is a precise rule or a short snippet, useful whether you write Android apps or backend services.',
  faq: [
    {
      q: 'Which Kotlin version does the deck use?',
      a: 'Current Kotlin 2.x. Nearly everything also applies to late 1.x releases; newer additions like the ..< range operator (1.9) are marked.',
    },
    {
      q: 'Do I need to know Java first?',
      a: 'No. A few cards compare Kotlin with Java, such as static members and platform types, but they make sense on their own.',
    },
    {
      q: 'Does it cover Android or Jetpack Compose?',
      a: 'No. It covers the language and the kotlinx.coroutines basics that Android, Compose and server-side Kotlin all build on.',
    },
  ],
  cards: CARDS,
}
