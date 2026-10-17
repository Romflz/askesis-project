import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const sw = (...lines: string[]) => code('swift', ...lines)

const CARDS: CardContent[] = [
  // Basics and optionals
  {
    front: '`let` vs `var` in Swift',
    back: '`let` declares a constant that can’t be reassigned; `var` declares a variable. Prefer `let`; the compiler suggests it when a `var` never changes',
  },
  { front: 'Interpolate values into a string', back: sw('let message = "Hello, \\(name)! You have \\(items.count) items."') },
  {
    front: 'What is an optional?',
    back: 'A type like `String?` that holds either a value or `nil`. Non-optional types can never be `nil`, so you must unwrap an optional before using its value',
  },
  {
    front: 'Unwrap an optional with `if let`',
    back: sw('if let name = user.name {', '    print("Hi, \\(name)")', '} else {', '    print("No name")', '}'),
    extra: 'Since Swift 5.7 you can write `if let name { … }` to unwrap into a constant with the same name.',
  },
  {
    front: '`guard let` vs `if let`',
    back: '`guard let` unwraps for the rest of the scope, and its `else` branch must exit (`return`, `throw`, `break` or `continue`), which keeps the happy path unindented',
    extra: sw('guard let url = URL(string: text) else { return }', 'load(url)'),
  },
  {
    front: 'Provide a default for an optional',
    back: sw('let count = Int(text) ?? 0'),
    extra: '`??` is the nil-coalescing operator.',
  },
  {
    front: 'What is the type of `user?.address?.city` if `city` is a `String`?',
    back: '`String?`: optional chaining returns `nil` as soon as any link is `nil`, so the result is always optional',
  },
  {
    front: 'What happens when you force-unwrap `nil` with `!`?',
    back: 'The program crashes with “Unexpectedly found nil while unwrapping an Optional value”. Use `!` only when `nil` is truly impossible',
  },
  {
    front: `What does this print?\n${sw('let n = Int("42a")', 'print(n ?? -1)')}`,
    back: '`-1`: `Int(_:)` is a failable initializer that returns `nil` when the string isn’t a valid integer',
  },
  {
    front: `What does this print?\n${sw('let x: Int? = 5', 'print(x)')}`,
    back: '`Optional(5)`, with a compiler warning. Unwrap it first, or write `x ?? 0`, to print `5`',
  },
  // Structs and classes
  {
    front: 'Struct vs class in Swift',
    back: 'Structs are value types (copied on assignment) with no inheritance and a free memberwise initializer; classes are reference types with inheritance, identity (`===`) and deinitializers, managed by ARC',
    extra: 'Apple recommends structs by default, and classes when you need identity or shared mutable state.',
  },
  {
    front: `What does this print?\n${sw('struct Point { var x = 0 }', '', 'var a = Point()', 'var b = a', 'b.x = 5', 'print(a.x)')}`,
    back: '`0`: assigning a struct copies it',
    extra: 'If `Point` were a class, `a` and `b` would refer to the same object and it would print `5`.',
  },
  {
    front: 'Why must some struct methods be marked `mutating`?',
    back: 'A struct method can’t modify `self` unless it is marked `mutating`, and mutating methods can’t be called on a `let` constant',
    extra: sw('struct Counter {', '    var count = 0', '    mutating func increment() { count += 1 }', '}'),
  },
  {
    front: '`let` with a struct vs `let` with a class',
    back: 'A `let` struct is fully immutable, so you can’t change its properties. A `let` class reference can’t be reassigned, but the object’s `var` properties can still change',
  },
  {
    front: 'Why is copying a large `Array` cheap?',
    back: 'Standard collections (`Array`, `Dictionary`, `Set`) and `String` use copy-on-write: copies share storage until one of them is mutated',
  },
  {
    front: 'What does `final` do on a class?',
    back: 'Prevents subclassing, which also lets the compiler call its methods directly instead of through dynamic dispatch',
  },
  // Protocols
  {
    front: 'Define and adopt a protocol',
    back: sw(
      'protocol Shape {',
      '    var area: Double { get }',
      '}',
      '',
      'struct Square: Shape {',
      '    let side: Double',
      '    var area: Double { side * side }',
      '}',
    ),
    extra: 'Structs, classes and enums can all conform to protocols.',
  },
  {
    front: 'Give a protocol method a default implementation',
    back: sw('extension Shape {', '    func describe() -> String { "Area: \\(area)" }', '}'),
    extra: 'Every conforming type gets `describe()` for free through the protocol extension.',
  },
  {
    front: '`some Shape` vs `any Shape`',
    back: '`some Shape` is an opaque type: one specific concrete type that the caller doesn’t get to see. `any Shape` is an existential box that can hold any conforming type, at some runtime cost',
    extra: sw(
      'func makeShape() -> some Shape { Square(side: 2) }',
      'let shapes: [any Shape] = [Square(side: 1), Circle(radius: 2)]',
    ),
  },
  {
    front: 'Get equality, hashing and JSON support for a struct',
    back: sw('struct User: Codable, Hashable {', '    let id: Int', '    let name: String', '}'),
    extra: 'The compiler synthesizes the conformances when every stored property already conforms.',
  },
  { front: 'Decode JSON into a `Codable` struct', back: sw('let user = try JSONDecoder().decode(User.self, from: data)') },
  {
    front: 'A generic function constrained to comparable values',
    back: sw('func largest<T: Comparable>(_ items: [T]) -> T? {', '    items.max()', '}'),
  },
  // Enums
  {
    front: 'An enum with associated values',
    back: sw(
      'enum Payment {',
      '    case cash',
      '    case card(number: String)',
      '    case transfer(iban: String, reference: String)',
      '}',
    ),
    extra: 'Each case can carry different data, which makes enums a good fit for modeling states.',
  },
  {
    front: 'Extract associated values with `switch`',
    back: sw(
      'switch payment {',
      'case .cash:',
      '    print("Cash")',
      'case .card(let number):',
      '    print("Card \\(number)")',
      'case let .transfer(iban, _):',
      '    print("Transfer to \\(iban)")',
      '}',
    ),
    extra: 'A `switch` must be exhaustive, and cases don’t fall through.',
  },
  {
    front: `What is \`Planet.venus.rawValue\`?\n${sw('enum Planet: Int {', '    case mercury = 1, venus, earth', '}')}`,
    back: '`2`: integer raw values count up from the previous case',
    extra: '`Planet(rawValue: 3)` returns an optional, here `.earth`; an unknown raw value gives `nil`.',
  },
  {
    front: 'List every case of an enum',
    back: sw('enum Direction: CaseIterable { case north, south, east, west }', '', 'Direction.allCases.count // 4'),
  },
  {
    front: 'How is `Optional` defined?',
    back: 'As a generic enum with two cases, `.none` and `.some(Wrapped)`; `nil` is shorthand for `.none`',
    extra: sw('enum Optional<Wrapped> {', '    case none', '    case some(Wrapped)', '}'),
  },
  // Closures
  {
    front: 'Double every number with `map` and shorthand closure syntax',
    back: sw('let doubled = numbers.map { $0 * 2 }'),
    extra: 'The full form is `numbers.map { (n: Int) -> Int in n * 2 }`.',
  },
  {
    front: 'Sort an array in descending order',
    back: sw('let sorted = numbers.sorted { $0 > $1 }', '// or: numbers.sorted(by: >)'),
    extra: 'A trailing closure goes after the parentheses, which can be dropped when it is the only argument.',
  },
  {
    front: 'What does `@escaping` mean on a closure parameter?',
    back: 'The closure may be called after the function returns, e.g. stored in a property or used as a completion handler. Closure parameters are non-escaping by default',
  },
  {
    front: 'Why write `[weak self]` in a closure?',
    back: 'An escaping closure captures `self` strongly; if `self` also holds on to the closure, neither is ever freed. `[weak self]` breaks the cycle and makes `self` optional inside the closure',
    extra: sw('viewModel.onUpdate = { [weak self] in', '    self?.render()', '}'),
  },
  {
    front: `What does this print?\n${sw('var count = 0', 'let increment = { count += 1 }', 'increment()', 'increment()', 'print(count)')}`,
    back: '`2`: closures capture variables by reference, so they see and modify the original',
    extra: 'A capture list like `{ [count] in … }` copies the value when the closure is created instead.',
  },
  {
    front: 'Convert strings to numbers, dropping the ones that fail',
    back: sw('let numbers = ["1", "x", "3"].compactMap { Int($0) } // [1, 3]'),
  },
  // ARC
  {
    front: 'What is ARC?',
    back: 'Automatic Reference Counting: the compiler inserts retain and release calls so each class instance tracks its strong references, and it is deallocated (running `deinit`) as soon as the count reaches zero',
  },
  {
    front: 'What is a retain cycle?',
    back: 'Two class instances, or an instance and a closure, holding strong references to each other: neither count reaches zero, so both leak',
    extra: 'ARC has no cycle collector; break cycles with `weak` or `unowned`.',
  },
  {
    front: '`weak` vs `unowned`',
    back: '`weak` references are optional and become `nil` when the object is deallocated; `unowned` references are non-optional and assume the object outlives them, so using one after deallocation crashes',
  },
  {
    front: 'Declare a delegate property without a retain cycle',
    back: sw(
      'protocol DownloaderDelegate: AnyObject {',
      '    func didFinish(_ data: Data)',
      '}',
      '',
      'final class Downloader {',
      '    weak var delegate: DownloaderDelegate?',
      '}',
    ),
    extra: 'The protocol is restricted to classes with `AnyObject`, because only class instances can be referenced weakly.',
  },
  // Errors
  {
    front: 'Call a throwing function and handle the error',
    back: sw(
      'do {',
      '    let data = try loadFile(at: path)',
      '    print(data.count)',
      '} catch {',
      '    print("Failed: \\(error)")',
      '}',
    ),
    extra: 'Inside a bare `catch`, the error is available as `error`.',
  },
  {
    front: '`try?` vs `try!`',
    back: '`try?` turns a thrown error into `nil`, giving an optional result; `try!` crashes if an error is thrown',
  },
  // Concurrency
  {
    front: 'Declare and call an async throwing function',
    back: sw('func fetchUser(id: Int) async throws -> User { /* … */ }', '', 'let user = try await fetchUser(id: 42)'),
    extra: 'async/await arrived in Swift 5.5.',
  },
  {
    front: 'Start two async calls in parallel and wait for both',
    back: sw('async let profile = loadProfile()', 'async let friends = loadFriends()', 'let (p, f) = await (profile, friends)'),
    extra: 'Each `async let` starts a child task immediately; `await` collects the results.',
  },
  {
    front: 'Call async code from a synchronous context, like a button action',
    back: sw('Button("Refresh") {', '    Task { await viewModel.refresh() }', '}'),
    extra: '`Task { … }` starts a new unstructured task that inherits the current actor.',
  },
  {
    front: 'What is an actor?',
    back: 'A reference type that protects its mutable state by letting only one task access it at a time; calls from outside are asynchronous (`await counter.increment()`), which prevents data races',
  },
  {
    front: 'What does `@MainActor` do?',
    back: 'Makes a function, property or whole type run on the main actor, i.e. the main thread, where UI updates must happen',
  },
  // SwiftUI
  {
    front: 'The shape of a SwiftUI view',
    back: sw(
      'struct Greeting: View {',
      '    let name: String',
      '',
      '    var body: some View {',
      '        Text("Hello, \\(name)")',
      '    }',
      '}',
    ),
    extra: 'Views are lightweight structs; SwiftUI recomputes `body` whenever the data it depends on changes.',
  },
  {
    front: 'What is `@State`?',
    back: 'A property wrapper for simple state a view owns; changing it makes SwiftUI recompute the view’s `body`',
    extra: sw(
      'struct Counter: View {',
      '    @State private var count = 0',
      '',
      '    var body: some View {',
      '        Button("Tapped \\(count) times") { count += 1 }',
      '    }',
      '}',
    ),
  },
  {
    front: 'Let a child view edit its parent’s `@State`',
    back: 'Declare a `@Binding` in the child and pass the state with a `$` prefix',
    extra: sw(
      'struct Settings: View {',
      '    @State private var isOn = false',
      '    var body: some View { EnabledRow(isOn: $isOn) }',
      '}',
      '',
      'struct EnabledRow: View {',
      '    @Binding var isOn: Bool',
      '    var body: some View { Toggle("Enabled", isOn: $isOn) }',
      '}',
    ),
  },
  {
    front: 'Share an observable model between SwiftUI views (iOS 17+)',
    back: sw(
      '@Observable',
      'final class Cart {',
      '    var items: [Item] = []',
      '}',
      '',
      'struct CartView: View {',
      '    @State private var cart = Cart()',
      '    var body: some View { Text("\\(cart.items.count) items") }',
      '}',
    ),
    extra:
      'With the `@Observable` macro, views update when the properties they read change. Older code uses `ObservableObject` with `@Published` and `@StateObject`.',
  },
  {
    front: `Do these two views look the same?\n${sw('Text("Hi").padding().background(.yellow)', 'Text("Hi").background(.yellow).padding()')}`,
    back: 'No. Modifiers wrap the view in order: the first paints yellow behind the text and its padding; the second paints only behind the text, then adds clear padding around it',
  },
  {
    front: 'SwiftUI’s basic layout containers',
    back: '`VStack` stacks views vertically, `HStack` horizontally and `ZStack` front to back; `Spacer()` takes up free space, and `List` builds a scrolling list',
  },
]

export const SWIFT: PublicDeck = {
  slug: 'swift-essentials',
  title: 'Swift essentials: 50 cards on optionals, protocols, ARC and SwiftUI',
  shortTitle: 'Swift',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'Swift fundamentals with short snippets: optionals, structs vs classes, protocols, enums with associated values, closures, ARC, async/await and SwiftUI.',
  intro:
    'Swift’s safety comes from a handful of ideas you use constantly: optionals and the ways to unwrap them, value types versus reference types, protocols with default implementations, and enums that carry data. These cards cover them with short snippets, along with closures, ARC and retain cycles, Swift concurrency, and the SwiftUI property wrappers every app relies on.',
  faq: [
    {
      q: 'Which Swift version does the deck use?',
      a: 'Current Swift 6. Newer features are marked, such as async/await (5.5), the if let shorthand (5.7) and the @Observable macro (5.9, iOS 17).',
    },
    {
      q: 'Is this deck enough to build iOS apps?',
      a: 'It covers the language and the SwiftUI basics you need first. Navigation, networking and frameworks like SwiftData deserve their own study.',
    },
    {
      q: 'Should I use a struct or a class in Swift?',
      a: 'Start with a struct. Use a class when you need shared identity, inheritance or reference semantics, such as a model object that several views observe.',
    },
  ],
  cards: CARDS,
}
