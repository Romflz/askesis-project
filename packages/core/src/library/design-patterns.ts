import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const ts = (...lines: string[]) => code('typescript', ...lines)
const java = (...lines: string[]) => code('java', ...lines)

// Scenario cards: the hint asks the learner to name the pattern.
const PICK = 'Pick a pattern'

const CARDS: CardContent[] = [
  // Principles
  {
    front: 'What does SOLID stand for?',
    back: 'Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion',
    extra: 'Five object-oriented design principles popularized by Robert C. Martin.',
  },
  {
    front: 'Single responsibility principle',
    back: 'A class or module should have one reason to change: one job, serving one part of the business',
    extra: 'An `Invoice` class that calculates totals, renders PDFs and sends emails has three reasons to change.',
  },
  {
    front: 'Open/closed principle',
    back: 'Code should be open for extension but closed for modification: add behavior by adding code, such as a new class or strategy, instead of editing code that works',
    extra: 'A `switch` on a type that you edit for every new case is the classic violation.',
  },
  {
    front: 'Liskov substitution principle',
    back: 'Objects of a subtype must work anywhere the base type is expected, without surprising the caller',
    extra:
      'Classic violation: `Square extends Rectangle`. Setting a square’s width also changes its height, which breaks code that expects a rectangle’s sides to vary independently.',
  },
  {
    front: 'Interface segregation principle',
    back: 'Clients shouldn’t depend on methods they don’t use, so prefer several small, focused interfaces over one large one',
    extra: 'A `Printer` shouldn’t have to implement `fax()` just because it shares a `Machine` interface with a fax machine.',
  },
  {
    front: 'Dependency inversion principle',
    back: 'High-level code should depend on abstractions, not on concrete low-level details; the details implement those abstractions',
    extra: 'An `OrderService` depends on a `PaymentGateway` interface, not directly on a `StripeClient`.',
  },
  {
    front: 'DRY',
    back: '“Don’t repeat yourself”: every piece of knowledge should have a single, authoritative representation in the system',
    extra:
      'It’s about duplicated knowledge, not code that merely looks similar. Merging look-alike code that changes for different reasons creates the wrong abstraction.',
  },
  { front: 'KISS', back: '“Keep it simple, stupid”: prefer the simplest design that solves the problem' },
  {
    front: 'YAGNI',
    back: '“You aren’t gonna need it”: don’t build features or flexibility until they’re actually needed',
    extra: 'From Extreme Programming. Speculative generality costs time now and complexity forever.',
  },
  {
    front: 'Composition over inheritance',
    back: 'Build behavior by combining objects that each do one thing (has-a) instead of extending class hierarchies (is-a)',
    extra: 'Composed parts can be swapped at runtime, and you avoid fragile base classes and deep hierarchies.',
  },
  {
    front: 'Law of Demeter',
    back: 'A method should talk only to its immediate collaborators, not reach through them: avoid chains like `order.getCustomer().getAddress().getCity()`',
    extra: 'Also called the principle of least knowledge.',
  },
  {
    front: 'Coupling vs cohesion',
    back: 'Coupling is how much modules depend on each other; cohesion is how closely the parts of one module belong together. Aim for low coupling and high cohesion',
  },
  // Patterns in general
  {
    front: 'What is a design pattern?',
    back: 'A named, reusable solution to a problem that keeps recurring in software design: a template to adapt, not finished code',
  },
  {
    front: 'The three categories of Gang of Four patterns',
    back: 'Creational (how objects are created), structural (how objects are composed), behavioral (how objects interact and share responsibilities)',
    extra: 'From “Design Patterns” (1994) by Gamma, Helm, Johnson and Vlissides, which catalogs 23 patterns.',
  },
  // Creational
  {
    front: 'Singleton',
    back: 'Ensures a class has only one instance and provides a global point of access to it',
    extra:
      'Often considered an anti-pattern: it’s global state that hides dependencies and makes testing hard. Creating one instance and passing it in is usually better.',
  },
  {
    front: `Which pattern is this?\n${ts(
      'class Config {',
      '  private static instance?: Config',
      '  private constructor() {}',
      '',
      '  static get(): Config {',
      '    return (Config.instance ??= new Config())',
      '  }',
      '}',
    )}`,
    back: 'Singleton: the private constructor blocks `new Config()` from outside, and `Config.get()` always returns the same instance',
  },
  {
    front: 'Factory method',
    back: 'Creates objects through a method instead of direct constructor calls, so a subclass or configuration decides which concrete class to instantiate',
    extra: 'Callers depend only on the product’s interface, not on the concrete classes.',
  },
  {
    front: 'Abstract factory',
    back: 'An interface for creating families of related objects without naming their concrete classes',
    extra: 'A `UIFactory` with `createButton()` and `createCheckbox()`, implemented once for Windows and once for macOS.',
  },
  {
    front: 'Builder',
    back: 'Constructs a complex object step by step, often through a fluent API that ends with `build()`',
    extra: java(
      'HttpRequest request = HttpRequest.newBuilder()',
      '    .uri(URI.create("https://example.com"))',
      '    .header("Accept", "application/json")',
      '    .GET()',
      '    .build();',
    ),
  },
  {
    front: 'Prototype',
    back: 'Creates new objects by copying an existing instance instead of building them from scratch',
    extra:
      'Useful when objects are expensive to set up, or when you don’t know their concrete class. In JavaScript, `structuredClone(obj)` makes a deep copy.',
  },
  // Structural
  {
    front: 'Adapter',
    back: 'Wraps an object to convert its interface into the one clients expect, so classes with incompatible interfaces can work together',
    extra: 'Like a travel plug adapter: the same electricity through a different shape.',
  },
  {
    front: 'Decorator',
    back: 'Wraps an object in another object with the same interface that adds behavior, without changing the original class; wrappers can be stacked',
    extra: 'Java I/O is built this way: `new BufferedReader(new FileReader("data.txt"))` adds buffering to any `Reader`.',
  },
  {
    front: 'Facade',
    back: 'A simple interface in front of a complex subsystem, e.g. one `VideoConverter.convert(file, "mp4")` call that hides codecs, buffers and containers',
    extra: 'Clients can still use the subsystem directly when they need more control.',
  },
  {
    front: 'Proxy',
    back: 'A stand-in with the same interface as the real object that controls access to it: lazy loading, permission checks, caching or calling a remote service',
    extra: 'JavaScript’s built-in `Proxy` lets you intercept property access on any object.',
  },
  {
    front: 'Composite',
    back: 'Composes objects into tree structures so clients can treat single items and groups of items the same way',
    extra: 'A UI `Panel` holds buttons and other panels; calling `render()` on a panel renders all of its children.',
  },
  {
    front: 'Adapter vs decorator vs proxy vs facade',
    back: 'An adapter changes an interface; a decorator keeps it and adds behavior; a proxy keeps it and controls access; a facade puts one simpler interface over many',
  },
  // Behavioral
  {
    front: 'Observer',
    back: 'A subject keeps a list of observers and notifies all of them when its state changes (one-to-many)',
    extra: ts(
      '// DOM events are observers: the button notifies both listeners',
      'button.addEventListener("click", () => save())',
      'button.addEventListener("click", () => track("save"))',
    ),
  },
  {
    front: 'Strategy',
    back: 'Defines a family of interchangeable algorithms behind one interface, so the algorithm can be chosen at runtime',
    extra:
      'With first-class functions, a strategy is often just a function, like the comparator in `items.sort((a, b) => a.price - b.price)`.',
  },
  {
    front: 'Command',
    back: 'Wraps a request, the action and its parameters, in an object so it can be queued, logged, retried or undone',
  },
  {
    front: 'Template method',
    back: 'A base class defines the skeleton of an algorithm and lets subclasses override specific steps without changing its overall structure',
  },
  {
    front: 'Iterator',
    back: 'Gives sequential access to the elements of a collection without exposing how it’s stored',
    extra: 'Built into most languages: `for...of` with `Symbol.iterator` in JavaScript, `__iter__` and `__next__` in Python.',
  },
  {
    front: 'State',
    back: 'An object delegates its behavior to a state object and swaps that object when its state changes, so it seems to change class',
    extra: 'It replaces large `switch` statements on a status field, e.g. an order that is pending, paid, shipped or cancelled.',
  },
  {
    front: 'Chain of responsibility',
    back: 'Passes a request along a chain of handlers; each one either handles it or passes it on to the next',
    extra: 'Web framework middleware for authentication, logging and rate limiting works this way.',
  },
  {
    front: 'Strategy vs state',
    back: 'Both delegate to swappable objects. With strategy, the client picks the algorithm and the strategies don’t know each other; with state, the states themselves switch to the next state as things change',
  },
  // Dependency injection
  {
    front: 'Dependency injection',
    back: 'An object receives its dependencies from outside, usually through its constructor, instead of creating them itself',
    extra: ts(
      'class OrderService {',
      '  constructor(private payments: PaymentGateway) {}',
      '}',
      '',
      'new OrderService(new StripeGateway()) // production',
      'new OrderService(new FakeGateway())   // tests',
    ),
  },
  {
    front: 'Dependency inversion vs dependency injection vs IoC container',
    back: 'Dependency inversion is the principle (depend on abstractions); dependency injection is the technique (pass dependencies in); an IoC container is a library that wires dependencies together automatically',
  },
  {
    front: 'Why is a service locator often called an anti-pattern?',
    back: 'Classes pull their dependencies from a global registry (`Locator.get(Mailer)`), so the dependencies are hidden instead of listed in the constructor, which makes them harder to see, swap and test',
  },
  // Pitfalls
  {
    front: 'God object',
    back: 'An anti-pattern where one class knows or does far too much and attracts every unrelated change',
    extra: 'Split it along its responsibilities (single responsibility principle).',
  },
  {
    front: 'When shouldn’t you use a design pattern?',
    back: 'When the problem it solves isn’t there yet. Patterns add indirection, and forcing them in makes simple code harder to read',
    extra: 'Start simple, and refactor toward a pattern when duplication or change actually calls for it.',
  },
  // Scenarios
  {
    front: 'When an order is placed, email, SMS and analytics must react, without the order code knowing about them',
    hint: PICK,
    back: 'Observer (or publish-subscribe): the order publishes an event, and each service subscribes to it',
  },
  {
    front: 'A constructor has a dozen optional parameters',
    hint: PICK,
    back: 'Builder: set only the options you need, then call `build()`',
  },
  {
    front: 'Your code expects a `PaymentGateway` interface, but the vendor’s SDK has different method names',
    hint: PICK,
    back: 'Adapter: wrap the SDK in a class that implements `PaymentGateway`',
  },
  {
    front: 'Add caching and logging around a repository without changing its class',
    hint: PICK,
    back: 'Decorator: wrap the repository in objects with the same interface, each adding one behavior',
  },
  {
    front: 'Shipping cost is calculated differently for each carrier, chosen at checkout',
    hint: PICK,
    back: 'Strategy: one `ShippingCalculator` interface, with one implementation per carrier',
  },
  {
    front: 'A text editor needs undo and redo',
    hint: PICK,
    back: 'Command: each edit is an object with `execute()` and `undo()`, kept on undo and redo stacks',
  },
  {
    front: 'Give callers one `placeOrder()` method that coordinates the inventory, payment and shipping subsystems',
    hint: PICK,
    back: 'Facade: a single entry point that hides how the subsystems work together',
  },
  {
    front: 'Create a `CsvParser`, `JsonParser` or `XmlParser` based on a file extension known only at runtime',
    hint: PICK,
    back: 'Factory: a `createParser(ext)` method returns the right implementation behind a common `Parser` interface',
  },
  {
    front: 'Load a large image from disk only when it’s first displayed',
    hint: PICK,
    back: 'Proxy (a virtual proxy): a lightweight stand-in loads the real image on first use',
  },
  {
    front: 'A vending machine behaves differently when idle, when holding coins and when sold out',
    hint: PICK,
    back: 'State: one object per state, each handling input and switching the machine to the next state',
  },
  {
    front: 'Folders contain files and other folders, and you need the total size of any of them',
    hint: PICK,
    back: 'Composite: `File` and `Folder` share a `size()` method, and a folder sums the sizes of its children',
  },
]

export const DESIGN_PATTERNS: PublicDeck = {
  slug: 'design-patterns',
  title: 'Design patterns basics: 50 cards on SOLID and the Gang of Four',
  shortTitle: 'Design patterns',
  category: 'cs',
  level: 'intermediate',
  icon: 'book',
  description:
    'SOLID, DRY, KISS and YAGNI, plus the Gang of Four patterns used most: singleton, factory, builder, adapter, decorator, observer, strategy, command and more.',
  intro:
    'The principles and patterns that come up in code reviews and interviews: the five SOLID principles, DRY, KISS and YAGNI, composition over inheritance and dependency injection, and the most used Gang of Four patterns. Scenario cards ask which pattern fits a situation, so you learn to recognize patterns in real code, not just recite definitions.',
  faq: [
    {
      q: 'Do I need to know all 23 Gang of Four patterns?',
      a: 'No. About a dozen, such as factory, builder, adapter, decorator, facade, observer, strategy and command, cover most real code. The rest are worth recognizing when you meet them.',
    },
    {
      q: 'Which language are the examples in?',
      a: 'TypeScript, with a couple of Java snippets. The patterns are language-independent, and many get simpler in languages with first-class functions.',
    },
    {
      q: 'Is the singleton pattern bad?',
      a: 'Not always, but it is global state in disguise: it hides dependencies and complicates tests. Creating one instance at startup and passing it where it is needed gives the same benefit without the drawbacks.',
    },
  ],
  cards: CARDS,
}
