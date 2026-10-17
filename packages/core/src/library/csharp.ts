import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const cs = (...lines: string[]) => code('csharp', ...lines)

const CARDS: CardContent[] = [
  // Types
  {
    front: 'Value types vs reference types in C#',
    back: 'Value types (`int`, `double`, `bool`, `decimal`, enums and `struct`s) hold their data directly and are copied on assignment; variables of reference types (classes, `string`, arrays, delegates) hold a reference to a shared object',
  },
  {
    front: `What does this print?\n${cs('struct Point { public int X; }', '', 'var a = new Point { X = 1 };', 'var b = a;', 'b.X = 2;', 'Console.WriteLine(a.X);')}`,
    back: '`1`: assigning a struct copies it, so `b` is independent',
    extra: 'If `Point` were a class, both variables would refer to one object and it would print `2`.',
  },
  {
    front: 'Does `==` compare string contents in C#?',
    back: 'Yes. `string` overloads `==` to compare characters, unlike Java. For most other classes, `==` compares references unless the type overloads it',
    extra: 'If both sides are typed as `object`, `==` falls back to comparing references, even for strings.',
  },
  {
    front: '`decimal` vs `double`',
    back: '`double` is binary floating point, fast but inexact (`0.1 + 0.2 != 0.3`); `decimal` is base-10 with 28–29 significant digits, the right choice for money',
    extra: 'Decimal literals need the `m` suffix: `19.99m`.',
  },
  {
    front: 'Format values inside a string',
    back: cs('var msg = $"Hi {name}, you owe {amount:C} ({ratio:P1})";'),
    extra:
      'Interpolated strings take format specifiers after a colon: `C` currency, `P1` percent with one decimal, `F2` two decimals.',
  },
  {
    front: 'What is `int?`?',
    back: 'A nullable value type, short for `Nullable<int>`: an `int` that can also be `null`. Check `HasValue`, or use `??` to supply a default',
  },
  {
    front: '`??` and `??=`',
    back: cs('string display = name ?? "anonymous";', 'cache ??= new Dictionary<string, int>();'),
    extra: '`??` returns the right side when the left is null; `??=` assigns only when the variable is null.',
  },
  {
    front: 'What does `order?.Customer?.Name` evaluate to if `Customer` is null?',
    back: '`null`: the null-conditional operator `?.` short-circuits the rest of the chain instead of throwing `NullReferenceException`',
  },
  {
    front: '`const` vs `readonly` fields',
    back: '`const` is a compile-time constant baked into every caller; `readonly` is assigned once, at its declaration or in a constructor, and can hold a value computed at runtime',
    extra: 'Changing a public `const` requires recompiling the assemblies that use it.',
  },
  // Nullable reference types
  {
    front: 'What are nullable reference types?',
    back: 'With `<Nullable>enable</Nullable>` (C# 8+), `string` means “never null” and `string?` means “may be null”, and the compiler warns when you might dereference or assign null',
    extra: 'New project templates enable it by default since .NET 6.',
  },
  {
    front: 'What does the `!` in `user!.Name` do?',
    back: 'It is the null-forgiving operator: it silences the compiler’s nullability warning and does nothing at runtime',
    extra: 'If `user` really is null, you still get a `NullReferenceException`.',
  },
  {
    front: 'With nullable reference types on, can a `string` parameter still receive null?',
    back: 'Yes. The annotations only produce compile-time warnings; callers can ignore them or have nullability disabled, so validate public inputs',
    extra: cs('ArgumentNullException.ThrowIfNull(name);'),
  },
  // Properties
  {
    front: 'Declare a property with a compiler-generated backing field',
    back: cs('public string Name { get; set; }'),
    extra: 'This auto-property can later get custom logic without changing the class’s public API, which a public field can’t.',
  },
  {
    front: 'A property that can only be set while the object is being created',
    back: cs(
      'public string Name { get; init; }',
      '',
      'var user = new User { Name = "Ada" }; // OK',
      'user.Name = "Bob";                   // compile error',
    ),
    extra: '`init` accessors arrived in C# 9.',
  },
  {
    front: 'What does the `required` modifier do?',
    back: 'Forces callers to set the property in an object initializer, or the code doesn’t compile (C# 11+)',
    extra: cs('public required string Email { get; init; }'),
  },
  {
    front: 'A read-only property computed from other properties',
    back: cs('public string FullName => $"{First} {Last}";'),
    extra: 'An expression-bodied property has no backing field; it is recomputed on every read.',
  },
  {
    front: 'Trim a value in a property setter without declaring a backing field',
    back: cs('public string Name', '{', '    get;', '    set => field = value.Trim();', '}'),
    extra: 'The `field` keyword (C# 14, .NET 10) refers to the compiler-generated backing field.',
  },
  // Records
  {
    front: 'What does `public record Person(string Name, int Age);` declare?',
    back: 'A class with init-only properties `Name` and `Age`, a constructor, value-based equality, a readable `ToString()` and deconstruction (C# 9+)',
    extra: '`record struct` (C# 10) is the value-type version.',
  },
  {
    front: `What does this print?\n${cs('var a = new Person("Ada", 36);', 'var b = new Person("Ada", 36);', 'Console.WriteLine(a == b);')}`,
    back: '`True`: records compare by value. With an ordinary class, two separate instances aren’t equal, so it would print `False`',
  },
  {
    front: 'Copy a record with one property changed',
    back: cs('var older = ada with { Age = 37 };'),
    extra: 'A `with` expression creates a new record; the original is unchanged.',
  },
  // Classes and interfaces
  {
    front: 'C# access modifiers',
    back: '`public` (everywhere), `private` (the containing type), `protected` (plus derived types), `internal` (the same assembly)',
    extra: 'Members are `private` by default; top-level types are `internal` by default.',
  },
  {
    front: 'Interfaces in C#',
    back: 'A contract a class or struct promises to implement; a type can implement many interfaces but inherit from only one class',
    extra: 'Since C# 8, interface members can have default implementations.',
  },
  {
    front: 'How do you let a subclass override a method?',
    back: 'Mark it `virtual` (or `abstract`) in the base class and `override` in the derived class; methods aren’t virtual by default',
    extra: 'Mark a class `sealed` to forbid inheriting from it.',
  },
  {
    front: `What does this print?\n${cs('class A { public virtual string Hi() => "A"; }', 'class B : A { public new string Hi() => "B"; }', '', 'A x = new B();', 'Console.WriteLine(x.Hi());')}`,
    back: '`A`: `new` hides the base method instead of overriding it, so the call is resolved through the variable’s type `A`',
    extra: 'With `override` instead of `new`, it would print `B`.',
  },
  {
    front: 'What is a primary constructor on a class?',
    back: 'Parameters declared on the class itself (C# 12+), in scope in every member; unlike a record’s, they don’t become public properties',
    extra: cs('public class OrderService(IOrderRepo repo)', '{', '    public Order Get(int id) => repo.Find(id);', '}'),
  },
  {
    front: 'Add a method to `string` without modifying it',
    back: cs(
      'public static class StringExtensions',
      '{',
      '    public static bool IsBlank(this string s) =>',
      '        string.IsNullOrWhiteSpace(s);',
      '}',
      '',
      'bool blank = "  ".IsBlank(); // true',
    ),
    extra: 'An extension method is a static method whose first parameter is marked `this`; LINQ is built from them.',
  },
  // LINQ
  {
    front: 'Get the sorted names of all adults with LINQ',
    back: cs(
      'var names = people',
      '    .Where(p => p.Age >= 18)',
      '    .OrderBy(p => p.Name)',
      '    .Select(p => p.Name)',
      '    .ToList();',
    ),
  },
  {
    front: `What does this print?\n${cs('var nums = new List<int> { 1, 2, 3 };', 'var big = nums.Where(n => n > 1);', 'nums.Add(4);', 'Console.WriteLine(big.Count());')}`,
    back: '`3`: LINQ queries are deferred, so the `Where` runs when `Count()` enumerates it, after `4` was added',
  },
  {
    front: 'Why call `ToList()` on a LINQ query you use several times?',
    back: 'A deferred query reruns its whole pipeline every time it is enumerated; `ToList()` or `ToArray()` runs it once and stores the results',
    extra: 'With Entity Framework, each enumeration of an unmaterialized query can be another database round trip.',
  },
  {
    front: '`First()` vs `FirstOrDefault()` vs `Single()`',
    back: '`First` throws if the sequence is empty; `FirstOrDefault` returns `default` (null, 0…) instead; `Single` throws unless there is exactly one element',
  },
  {
    front: '`Select` vs `SelectMany`',
    back: '`Select` maps each element to one result; `SelectMany` maps each element to a sequence and flattens them into one',
    extra: cs('var allTags = posts.SelectMany(p => p.Tags);'),
  },
  {
    front: 'Count people per city with LINQ',
    back: cs('var perCity = people', '    .GroupBy(p => p.City)', '    .Select(g => new { City = g.Key, Count = g.Count() });'),
  },
  {
    front: 'Why prefer `Any()` over `Count() > 0`?',
    back: '`Any()` stops at the first element, while `Count()` may have to enumerate the whole sequence',
  },
  {
    front: 'Write `people.Where(p => p.Age >= 18).Select(p => p.Name)` in query syntax',
    back: cs('var names = from p in people', '            where p.Age >= 18', '            select p.Name;'),
    extra: 'The compiler translates query syntax into the same method calls.',
  },
  {
    front: '`IEnumerable<T>` vs `IQueryable<T>`',
    back: 'LINQ on `IEnumerable` runs as C# code in memory; on `IQueryable` it builds an expression tree that a provider such as Entity Framework Core translates, e.g. into SQL',
  },
  // async/await
  {
    front: 'What does `await` do?',
    back: 'Pauses the `async` method until the awaited task completes, without blocking the thread, then resumes it with the result',
    extra: cs(
      'public async Task<User> GetUserAsync(int id)',
      '{',
      '    var json = await _http.GetStringAsync($"/users/{id}");',
      '    return JsonSerializer.Deserialize<User>(json)!;',
      '}',
    ),
  },
  {
    front: 'Why avoid `async void`?',
    back: 'The caller can’t await it or catch its exceptions, which typically crash the process instead. Return `Task` or `Task<T>`; `async void` is only for event handlers',
  },
  {
    front: 'Run two independent async calls concurrently',
    back: cs(
      'var userTask = GetUserAsync(id);',
      'var ordersTask = GetOrdersAsync(id);',
      'await Task.WhenAll(userTask, ordersTask);',
      '',
      'var user = await userTask;   // already complete',
      'var orders = await ordersTask;',
    ),
    extra: 'Both tasks start before either is awaited, so they overlap.',
  },
  {
    front: 'Why is calling `.Result` or `.Wait()` on a task risky?',
    back: 'It blocks the thread until the task finishes, and can deadlock where a synchronization context needs that same thread to continue (UI apps, classic ASP.NET)',
    extra: 'Prefer `await` all the way up the call chain.',
  },
  {
    front: 'Give up on an async operation after five seconds',
    back: cs(
      'using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));',
      'var data = await http.GetStringAsync(url, cts.Token);',
    ),
    extra: 'Pass a `CancellationToken` down through async methods; cancellation surfaces as an `OperationCanceledException`.',
  },
  {
    front: 'What happens if you call an async method without awaiting it?',
    back: 'It still starts, runs synchronously until its first incomplete `await`, then returns a `Task`; any exception is stored in that task and goes unnoticed if nothing awaits it',
  },
  {
    front: 'Consume an asynchronous stream of items',
    back: cs('await foreach (var line in File.ReadLinesAsync(path))', '{', '    Console.WriteLine(line);', '}'),
    extra:
      '`File.ReadLinesAsync` (.NET 7+) returns an `IAsyncEnumerable<string>` (C# 8+); write your own with `yield return` inside an `async` method.',
  },
  // More language and runtime
  {
    front: 'Make sure a file is disposed at the end of the method',
    back: cs('using var stream = File.OpenRead(path);', '// … use stream …', '// Dispose() runs when the enclosing scope ends'),
    extra: 'A `using` declaration (C# 8+) works with any `IDisposable`; `using (…) { }` blocks are the older form.',
  },
  {
    front: 'A `switch` expression with relational patterns',
    back: cs(
      'string Describe(int n) => n switch',
      '{',
      '    < 0 => "negative",',
      '    0 => "zero",',
      '    _ => "positive",',
      '};',
    ),
    extra: '`_` is the discard pattern that matches anything.',
  },
  {
    front: 'How do C# generics differ from Java’s?',
    back: 'They are reified: type arguments exist at runtime, so `typeof(T)` works and a `List<int>` stores `int`s without boxing',
    extra: 'Constrain type parameters with `where`, e.g. `where T : IComparable<T>` or `where T : new()`.',
  },
  {
    front: '`Func` vs `Action`',
    back: 'Built-in delegate types: `Func<…, TResult>` returns a value, `Action<…>` returns `void`',
    extra: cs('Func<int, int> square = x => x * x;', 'Action<string> log = Console.WriteLine;'),
  },
  {
    front: 'The three service lifetimes in .NET dependency injection',
    back: '`AddSingleton`: one instance for the app. `AddScoped`: one per scope, i.e. per HTTP request in ASP.NET Core. `AddTransient`: a new instance every time it is resolved',
    extra: 'Injecting a scoped service into a singleton is a classic bug.',
  },
  {
    front: 'How does C# code run?',
    back: 'The compiler turns it into IL (intermediate language) stored in assemblies (`.dll`); the .NET runtime (CLR) JIT-compiles the IL to native code and manages memory with a garbage collector',
    extra: '`dotnet new console`, `dotnet run` and `dotnet add package <name>` cover day-to-day use.',
  },
  {
    front: 'Create an array, a list and a combined list with collection expressions',
    back: cs('int[] a = [1, 2, 3];', 'List<int> b = [4, 5];', 'List<int> all = [..a, ..b];'),
    extra: 'Collection expressions and the `..` spread element arrived in C# 12.',
  },
  {
    front: 'Look up a dictionary key that may be missing',
    back: cs('if (ages.TryGetValue("ada", out var age))', '{', '    Console.WriteLine(age);', '}'),
    extra: 'The indexer `ages["ada"]` throws `KeyNotFoundException` for a missing key.',
  },
]

export const CSHARP: PublicDeck = {
  slug: 'csharp-essentials',
  title: 'C# essentials: 50 cards on LINQ, async/await, records and nullability',
  shortTitle: 'C#',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'C# and .NET fundamentals with short snippets: value vs reference types, properties, records, nullable reference types, LINQ, async/await and DI.',
  intro:
    'Modern C# packs a lot into small syntax: init-only and required properties, records with value equality, nullable annotations, LINQ’s deferred execution and the habits that keep async code from deadlocking. Each card pairs a rule with a short snippet, written for current .NET, with version notes wherever a feature is recent.',
  faq: [
    {
      q: 'Which C# and .NET versions do the cards target?',
      a: 'Current .NET (10, with C# 14). Most cards apply to any modern version; newer features are marked, like required members (C# 11), primary constructors and collection expressions (C# 12) and the field keyword (C# 14).',
    },
    {
      q: 'Does the deck cover ASP.NET Core or Entity Framework?',
      a: 'Only where the language meets them, such as dependency injection lifetimes and IQueryable. The focus is C# itself.',
    },
    {
      q: 'I know Java. Is C# very different?',
      a: 'The syntax and object model are close, but C# adds properties, value-type structs, reified generics, LINQ and async/await. Several cards point out the differences.',
    },
  ],
  cards: CARDS,
}
