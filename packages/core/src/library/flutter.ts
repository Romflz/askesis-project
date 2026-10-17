import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const dart = (...lines: string[]) => code('dart', ...lines)

const CARDS: CardContent[] = [
  // Dart essentials
  {
    front: '`String` vs `String?` in Dart',
    back: 'With sound null safety (required since Dart 3), a `String` can never be `null`; a `String?` can, and the compiler makes you handle that case before using it',
  },
  {
    front: 'Dart’s null-aware operators',
    back: dart("final name = user?.name ?? 'Guest';", 'cache ??= {};', 'final len = maybeText!.length; // throws if null'),
    extra: '`?.` short-circuits to null, `??` supplies a default, `??=` assigns only if null, and `!` asserts non-null.',
  },
  {
    front: 'What does `late` do?',
    back: 'Declares a non-nullable variable that is initialized after its declaration; reading it before it is assigned throws a `LateInitializationError`',
    extra: '`late final config = loadConfig();` also makes the initializer lazy: it runs on first access.',
  },
  {
    front: '`final` vs `const`',
    back: '`final` is set once, at runtime; `const` is a compile-time constant that is deeply immutable and canonicalized, so identical `const` values are the same instance',
    extra: dart(
      'final now = DateTime.now();    // fine',
      "const appName = 'Askesis';      // fine",
      'const later = DateTime.now();  // compile error',
    ),
  },
  {
    front: '`var` vs `dynamic` vs `Object?`',
    back: '`var` infers a fixed static type from the initializer; `dynamic` turns off static checking; `Object?` accepts anything but still requires a check or cast before you use it',
  },
  {
    front: `What happens here?\n${dart("var x = 'hi';", 'x = 5;')}`,
    back: 'A compile error: `var` inferred `x` as a `String`, so it can’t be assigned an `int`',
  },
  {
    front: 'String interpolation in Dart',
    back: dart("print('Hello, $name! You have ${items.length} items.');"),
    extra: 'Use `${…}` for anything beyond a simple identifier.',
  },
  {
    front: 'Build a list with collection `if`, `for` and spread',
    back: dart(
      'final menu = [',
      '  ...baseItems,',
      "  if (isAdmin) 'Admin panel',",
      "  for (final id in recentIds) 'Item $id',",
      '];',
    ),
  },
  {
    front: 'What does the cascade operator `..` do?',
    back: 'Performs several operations on the same object and evaluates to that object',
    extra: dart('final paint = Paint()', '  ..color = Colors.blue', '  ..strokeWidth = 2;'),
  },
  {
    front: 'Named and required parameters',
    back: dart(
      "void greet({required String name, String greeting = 'Hi'}) {",
      "  print('$greeting, $name');",
      '}',
      '',
      "greet(name: 'Ada');",
    ),
    extra: 'Named parameters go in `{}`; optional positional parameters go in `[]`.',
  },
  {
    front: 'A class with a const constructor and initializing formals',
    back: dart('class Point {', '  const Point(this.x, this.y);', '', '  final int x;', '  final int y;', '}'),
    extra: '`this.x` assigns the field straight from the parameter. A `const` constructor requires all fields to be `final`.',
  },
  {
    front: 'Return two values from a function',
    back: dart("(String, int) nameAndAge() => ('Ada', 36);", '', 'final (name, age) = nameAndAge();'),
    extra: 'Records and destructuring patterns arrived in Dart 3.',
  },
  {
    front: 'Switch exhaustively over a sealed class',
    back: dart(
      'sealed class Shape {}',
      'class Square extends Shape { Square(this.side); final double side; }',
      'class Circle extends Shape { Circle(this.radius); final double radius; }',
      '',
      'double area(Shape s) => switch (s) {',
      '  Square(side: var l) => l * l,',
      '  Circle(radius: var r) => 3.14159 * r * r,',
      '};',
    ),
    extra: 'Sealed classes and switch expressions (Dart 3) let the compiler check that every subtype is handled.',
  },
  // Async Dart
  {
    front: 'What is a `Future`?',
    back: 'A value (or error) that will be available later. Mark a function `async` and `await` futures inside it as if they were synchronous',
    extra: dart(
      'Future<User> loadUser(int id) async {',
      "  final res = await http.get(Uri.parse('$baseUrl/users/$id'));",
      '  return User.fromJson(jsonDecode(res.body));',
      '}',
    ),
  },
  {
    front: `What does this print?\n${dart('void main() {', "  print('A');", "  Future(() => print('B'));", "  print('C');", '}')}`,
    back: '`A`, `C`, `B`: the future’s callback is queued on the event loop and runs only after the current synchronous code finishes',
  },
  {
    front: 'Wait for several futures in parallel',
    back: dart('final results = await Future.wait([fetchUser(), fetchPosts()]);'),
    extra: 'With records (Dart 3): `final (user, posts) = await (fetchUser(), fetchPosts()).wait;`',
  },
  {
    front: '`Future` vs `Stream`',
    back: 'A `Future` delivers one value or error; a `Stream` delivers a sequence of them over time, consumed with `await for` or `listen`',
    extra: 'A single-subscription stream can be listened to only once; a broadcast stream allows many listeners.',
  },
  {
    front: 'Write a function that produces a stream',
    back: dart(
      'Stream<int> countdown(int from) async* {',
      '  for (var i = from; i > 0; i--) {',
      '    yield i;',
      '    await Future.delayed(const Duration(seconds: 1));',
      '  }',
      '}',
    ),
  },
  {
    front: 'How do you keep heavy CPU work from freezing a Flutter UI?',
    back: 'Dart runs your code on a single thread per isolate, so a long computation blocks frames. Move it to another isolate',
    extra: dart('final data = await Isolate.run(() => parseHugeJson(text));'),
    hint: 'Isolates don’t share memory.',
  },
  // Widgets
  {
    front: 'What is a widget?',
    back: 'An immutable description of part of the UI. Flutter builds a tree of widgets and uses it to create and update the longer-lived elements and render objects that actually lay out and paint',
  },
  {
    front: '`StatelessWidget` vs `StatefulWidget`',
    back: 'A stateless widget depends only on its constructor arguments and inherited data; a stateful widget has a separate `State` object that persists across rebuilds and can change over time',
  },
  {
    front: 'A minimal `StatelessWidget`',
    back: dart(
      'class Greeting extends StatelessWidget {',
      '  const Greeting({super.key, required this.name});',
      '',
      '  final String name;',
      '',
      '  @override',
      "  Widget build(BuildContext context) => Text('Hello, $name');",
      '}',
    ),
  },
  {
    front: 'A counter with `StatefulWidget`',
    back: dart(
      'class Counter extends StatefulWidget {',
      '  const Counter({super.key});',
      '',
      '  @override',
      '  State<Counter> createState() => _CounterState();',
      '}',
      '',
      'class _CounterState extends State<Counter> {',
      '  int _count = 0;',
      '',
      '  @override',
      '  Widget build(BuildContext context) => ElevatedButton(',
      '        onPressed: () => setState(() => _count++),',
      "        child: Text('Tapped $_count times'),",
      '      );',
      '}',
    ),
  },
  {
    front: 'What does `setState` do?',
    back: 'Runs your callback, marks the `State` as dirty and schedules `build` to run again. Changing a field without `setState` updates the value but not the screen',
  },
  {
    front: 'What should and shouldn’t happen in `build`?',
    back: '`build` may run very often, even every frame during an animation, so keep it fast and free of side effects: no network calls, subscriptions or heavy work',
  },
  {
    front: 'Key `State` lifecycle methods',
    back: '`initState` runs once when the state is created (set up controllers and subscriptions); `didUpdateWidget` runs when the parent rebuilds with a new widget; `dispose` runs when it is removed for good (release them)',
    extra: 'Call `super.initState()` first and `super.dispose()` last.',
  },
  {
    front: 'Why add `const` to widget constructors and instances?',
    back: 'A `const` widget is created once at compile time and reused, so when its parent rebuilds, Flutter can skip rebuilding that subtree',
    extra: dart("const Padding(padding: EdgeInsets.all(8), child: Text('Hi'))"),
  },
  {
    front: 'What is a `BuildContext`?',
    back: 'A handle to a widget’s location in the tree, used to look up ancestors and inherited data: `Theme.of(context)`, `MediaQuery.sizeOf(context)`, `Navigator.of(context)`',
  },
  {
    front: 'What should you check before using `context` after an `await`?',
    back: 'That the widget is still in the tree: `if (!context.mounted) return;`',
    extra: 'Inside a `State`, check its `mounted` property. Using a stale context can throw or act on the wrong screen.',
  },
  // Hot reload
  {
    front: 'Hot reload vs hot restart',
    back: 'Hot reload injects changed code into the running app and rebuilds the widget tree, keeping state; hot restart reruns the app from `main()`, resetting state. Native code changes need a full rebuild',
  },
  {
    front: 'Which changes doesn’t hot reload pick up?',
    back: 'Code that already ran: edits to `main()` or `initState()`, and initializers of global variables and static fields. Some type changes, like turning an enum into a class, also need a hot restart',
  },
  // Keys
  {
    front: 'What are keys for?',
    back: 'They tell Flutter which widget is which when siblings are reordered, inserted or removed, so each `State` stays with the right item',
    extra: dart('TodoTile(key: ValueKey(todo.id), todo: todo)'),
  },
  {
    front: 'What goes wrong if you reorder stateful list items without keys?',
    back: 'Flutter matches widgets by type and position, so each `State` (a checkbox’s value, a text field’s contents) stays at its old position and ends up attached to a different item',
  },
  {
    front: 'When do you need a `GlobalKey`?',
    back: 'To reach a widget’s `State` from elsewhere, such as `GlobalKey<FormState>` to call `validate()` on a `Form`, or to keep state while moving a widget to a new parent. They are costly, so use them sparingly',
  },
  // Layout
  {
    front: 'Flutter’s core layout rule',
    back: '“Constraints go down. Sizes go up. Parent sets position.” A parent tells each child its minimum and maximum size, the child picks a size within them, and the parent positions it',
  },
  {
    front: '`Row` and `Column` alignment',
    back: '`mainAxisAlignment` positions children along the main axis (horizontal in a `Row`, vertical in a `Column`); `crossAxisAlignment` aligns them on the other axis',
  },
  {
    front: 'Make a child fill the remaining space in a `Row`',
    back: dart('Row(', '  children: [', '    const Icon(Icons.person),', '    Expanded(child: Text(longName)),', '  ],', ')'),
    extra: '`Flexible` lets the child be smaller than the space it gets; `flex:` shares space by ratio.',
  },
  {
    front: 'What does a yellow-and-black striped bar on screen mean?',
    back: 'An overflow: a child is bigger than the space its parent allows, e.g. long text in a `Row`. Fix it with `Expanded` or `Flexible`, by wrapping or truncating the text, or by making the area scrollable',
  },
  {
    front: '`SizedBox` vs `Padding` vs `Container`',
    back: '`SizedBox` gives a fixed size or a gap; `Padding` adds space around a child; `Container` combines padding, margin, size, color and decoration in one widget',
  },
  {
    front: 'Overlay one widget on another',
    back: dart(
      'Stack(',
      '  children: [',
      "    Image.asset('photo.jpg'),",
      '    const Positioned(top: 8, right: 8, child: Icon(Icons.star)),',
      '  ],',
      ')',
    ),
  },
  {
    front: 'Show a long list efficiently',
    back: dart(
      'ListView.builder(',
      '  itemCount: items.length,',
      '  itemBuilder: (context, i) => ListTile(title: Text(items[i])),',
      ')',
    ),
    extra: 'The builder creates only the items that are on screen, instead of all of them up front.',
  },
  {
    front: 'Why does a `ListView` inside a `Column` throw an error?',
    back: 'The `Column` gives it unbounded height, but a `ListView` tries to fill all available space. Wrap it in `Expanded` so it gets the remaining space',
    extra: 'The error mentions “Vertical viewport was given unbounded height”.',
  },
  {
    front: 'Adapt a layout to the space available',
    back: dart(
      'LayoutBuilder(',
      '  builder: (context, constraints) => constraints.maxWidth > 600',
      '      ? const WideLayout()',
      '      : const NarrowLayout(),',
      ')',
    ),
    extra: '`MediaQuery.sizeOf(context)` gives the whole screen size instead of the parent’s constraints.',
  },
  // App structure and navigation
  {
    front: 'What does a Flutter app’s entry point look like?',
    back: dart('void main() => runApp(const MyApp());'),
    extra:
      '`MyApp` usually returns a `MaterialApp` (theme, routes, localization), and each screen is a `Scaffold` with an `appBar` and a `body`.',
  },
  {
    front: 'Open a new screen and get a result back',
    back: dart(
      'final color = await Navigator.push<String>(',
      '  context,',
      '  MaterialPageRoute(builder: (_) => const PickerPage()),',
      ');',
      '',
      '// inside PickerPage:',
      "Navigator.pop(context, 'blue');",
    ),
    extra: 'Packages like go_router add URL-based, declarative routing on top.',
  },
  // State management
  {
    front: 'How should state be shared between widgets?',
    back: 'Keep it local with `setState` when one widget needs it; lift it up to a common ancestor when several do; for app-wide state use `InheritedWidget` or a package built on the same idea, like provider, Riverpod or Bloc',
  },
  {
    front: 'Rebuild part of the UI when a model changes, without packages',
    back: dart(
      'class Cart extends ChangeNotifier {',
      '  final items = <String>[];',
      '',
      '  void add(String item) {',
      '    items.add(item);',
      '    notifyListeners();',
      '  }',
      '}',
      '',
      'ListenableBuilder(',
      '  listenable: cart,',
      "  builder: (context, _) => Text('${cart.items.length} items'),",
      ')',
    ),
  },
  {
    front: 'The `FutureBuilder` gotcha',
    back: 'Creating the future inside `build` (`future: fetchData()`) starts a new request on every rebuild. Create it once, e.g. in `initState`, store it in a field, and pass that',
  },
  // Tooling
  {
    front: 'Add a package to a Flutter project',
    back: code('bash', 'flutter pub add http'),
    extra:
      'This adds it under `dependencies` in `pubspec.yaml` and fetches it; `flutter pub get` installs everything listed there.',
  },
  {
    front: 'Create, check and run a Flutter project',
    back: code('bash', 'flutter create my_app', 'flutter doctor', 'flutter run'),
    extra: '`flutter doctor` reports missing SDKs, devices or tooling setup.',
  },
]

export const FLUTTER: PublicDeck = {
  slug: 'flutter-essentials',
  title: 'Flutter essentials: 50 cards on Dart, widgets, state and layout',
  shortTitle: 'Flutter',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'Flutter and Dart basics: null safety, futures and streams, stateless vs stateful widgets, setState, hot reload, keys, layout and state management.',
  intro:
    'Flutter is easy to start and easy to misuse: work done in `build`, a missing key in a reorderable list, a `ListView` dropped into a `Column`. These cards cover the Dart you need (null safety, async code, records and sealed classes) and the Flutter fundamentals behind every app: widgets and their lifecycle, `setState`, hot reload, keys, the layout rules and the first steps of state management.',
  faq: [
    {
      q: 'Do I need to know Dart before Flutter?',
      a: 'No. The first part of the deck covers the Dart that Flutter code uses daily: null safety, async/await, streams, collection literals, records and sealed classes.',
    },
    {
      q: 'Which Flutter and Dart versions does it use?',
      a: 'Current Flutter 3 with Dart 3. Dart 3 features such as records, patterns and sealed classes are marked.',
    },
    {
      q: 'Which state management approach should I learn first?',
      a: 'Start with setState, lifting state up and ChangeNotifier, which this deck covers. Packages such as provider, Riverpod and Bloc build on the same ideas.',
    },
  ],
  cards: CARDS,
}
