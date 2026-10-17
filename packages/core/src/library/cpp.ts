import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const cc = (...lines: string[]) => code('cpp', ...lines)

const CARDS: CardContent[] = [
  // References and pointers
  {
    front: 'Reference vs pointer',
    back: 'A reference is an alias that must be initialized, can’t be null and can’t be reseated; a pointer holds an address, can be null, can be reassigned, and needs `*` to reach the object',
  },
  {
    front: `What does this print?\n${cc('int a = 1;', 'int& r = a;', 'r = 5;', 'std::cout << a;')}`,
    back: '`5`: `r` is another name for `a`, so assigning through it changes `a`',
  },
  {
    front: 'Three ways to take a `std::string` parameter',
    back: '`std::string s` copies it; `std::string& s` lets the function modify the caller’s string; `const std::string& s` reads it without copying',
    extra: 'For read-only string parameters, `std::string_view` (C++17) is another option.',
  },
  {
    front: 'Why `nullptr` instead of `NULL` or `0`?',
    back: '`nullptr` (C++11) has its own type, `std::nullptr_t`, which converts only to pointer types; `NULL` is usually an integer constant, so `f(NULL)` can call `f(int)` instead of `f(char*)`',
  },
  {
    front: `What’s wrong with this function?\n${cc('const std::string& name() {', '    std::string s = "Ada";', '    return s;', '}')}`,
    back: 'It returns a reference to a local that is destroyed when the function returns, so using the result is undefined behavior. Return `std::string` by value instead',
    extra: 'Returning by value is cheap thanks to move semantics and copy elision.',
  },
  // RAII
  {
    front: 'What is RAII?',
    back: '“Resource acquisition is initialization”: an object acquires a resource in its constructor and releases it in its destructor, so cleanup happens automatically when the object goes out of scope, even if an exception is thrown',
    extra: 'Local objects are destroyed at the end of their scope, in reverse order of construction.',
  },
  {
    front: 'Lock a mutex for the rest of the scope',
    back: cc('{', '    std::scoped_lock lock(mtx);', '    shared.push_back(x);', '} // unlocked here, even if push_back throws'),
    extra: '`std::scoped_lock` is C++17; `std::lock_guard<std::mutex>` is the older equivalent.',
  },
  // Smart pointers
  {
    front: 'What is `std::unique_ptr<T>`?',
    back: 'A smart pointer with sole ownership: it deletes the object when it is destroyed. It can be moved but not copied, and typically costs nothing over a raw pointer',
  },
  {
    front: 'Create an object owned by a `unique_ptr`',
    back: cc('auto w = std::make_unique<Widget>(42);'),
    extra: '`std::make_unique` (C++14) avoids a naked `new`, so there is never a moment when the object has no owner.',
  },
  {
    front: 'Transfer ownership of a `unique_ptr`',
    back: cc('auto a = std::make_unique<Widget>();', 'auto b = std::move(a); // a is now null'),
    extra: '`auto b = a;` doesn’t compile, because a `unique_ptr` can’t be copied.',
  },
  {
    front: 'What is `std::shared_ptr<T>`?',
    back: 'A smart pointer with shared ownership: copies share a reference count, and the object is deleted when the last `shared_ptr` to it is destroyed',
    extra: 'Create it with `std::make_shared<T>(…)`, which allocates the object and the count together.',
  },
  {
    front: 'What is `std::weak_ptr` for?',
    back: 'A non-owning reference to an object managed by `shared_ptr`. It breaks ownership cycles, and `lock()` returns a `shared_ptr` if the object still exists (or an empty one if not)',
  },
  {
    front: 'Are raw pointers still OK in modern C++?',
    back: 'As non-owning observers, yes. Avoid owning raw pointers with manual `new` and `delete`; let containers and smart pointers own memory',
  },
  // Move semantics
  {
    front: 'What is move semantics?',
    back: 'Transferring an object’s resources (like a string’s heap buffer) to another object instead of copying them, when the source is a temporary or no longer needed',
    extra: 'A move constructor has the signature `T(T&& other) noexcept`.',
  },
  {
    front: 'What does `std::move` actually do?',
    back: 'Nothing at runtime: it is a cast to an rvalue reference, which lets overload resolution pick a move constructor or move assignment',
    extra: '`std::move` on a `const` object silently copies, because the move constructor takes a non-const `T&&`.',
  },
  {
    front: 'What state is an object in after being moved from?',
    back: 'Valid but unspecified: you can destroy it or assign it a new value, but shouldn’t rely on its contents',
    extra: 'A moved-from `std::string` is usually empty, but the standard doesn’t promise that.',
  },
  {
    front: 'lvalue vs rvalue',
    back: 'An lvalue has an identity you can take the address of, like a named variable; an rvalue is a temporary such as `x + 1` or `std::string("hi")`. `T&&` parameters bind to rvalues',
  },
  {
    front: 'Rule of zero vs rule of five',
    back: 'Rule of five: if you define a destructor, copy or move constructor, or copy or move assignment, you probably need all five. Rule of zero (better): use members like `std::vector` and `std::unique_ptr` that manage themselves, and define none',
  },
  {
    front: 'Why should move constructors be `noexcept`?',
    back: 'When `std::vector` reallocates, it moves elements only if their move constructor can’t throw; otherwise it copies them (if it can) to keep its strong exception guarantee',
  },
  // STL containers
  {
    front: 'Which container should you reach for by default?',
    back: '`std::vector`: a contiguous, growable array with fast iteration and amortized O(1) `push_back`',
  },
  {
    front: `What’s wrong here?\n${cc('std::vector<int> v{1, 2, 3};', 'int& first = v[0];', 'v.push_back(4);', 'std::cout << first;')}`,
    back: 'If `push_back` reallocates, `first` refers to freed memory and reading it is undefined behavior. Growing a vector can invalidate all references, pointers and iterators to its elements',
  },
  {
    front: '`std::map` vs `std::unordered_map`',
    back: '`std::map` keeps keys sorted (a balanced tree, O(log n) operations); `std::unordered_map` is a hash table with average O(1) lookups and no ordering',
  },
  {
    front: `What is \`m.size()\` afterwards?\n${cc('std::map<std::string, int> m;', 'if (m["alice"] == 0) { /* … */ }')}`,
    back: '`1`: `operator[]` inserts a value-initialized element when the key is missing',
    extra: 'To only look, use `m.find(key)`, `m.contains(key)` (C++20) or `m.at(key)`, which throws if the key is missing.',
  },
  {
    front: '`v[i]` vs `v.at(i)`',
    back: '`v[i]` doesn’t check bounds, so an out-of-range index is undefined behavior; `v.at(i)` throws `std::out_of_range`',
  },
  {
    front: 'Why use `std::array<int, 3>` over `int[3]`?',
    back: 'Same fixed size and no heap allocation, but it knows its size, can be copied and returned by value, works with algorithms, and doesn’t decay to a pointer',
  },
  {
    front: 'The `std::string_view` gotcha',
    back: 'A `string_view` (C++17) doesn’t own its characters. If it outlives the string it points into, such as a temporary, it dangles',
    extra: cc('std::string_view sv = std::string("temp"); // dangles immediately'),
  },
  {
    front: '`push_back` vs `emplace_back`',
    back: '`push_back` takes an existing object and copies or moves it in; `emplace_back` forwards constructor arguments and builds the element in place',
    extra: cc('people.emplace_back("Ada", 36); // calls Person(std::string, int)'),
  },
  // Algorithms and lambdas
  {
    front: 'Sort a vector ascending, then descending',
    back: cc(
      'std::ranges::sort(v);                              // C++20',
      'std::sort(v.begin(), v.end(), std::greater<>());   // descending',
    ),
  },
  {
    front: 'Remove all zeros from a vector',
    back: cc(
      'std::erase(v, 0); // C++20',
      '',
      '// before C++20: the erase-remove idiom',
      'v.erase(std::remove(v.begin(), v.end(), 0), v.end());',
    ),
    extra: '`std::remove` only shifts the kept elements forward and returns the new logical end; it never changes the size.',
  },
  {
    front: 'Find a value in a vector',
    back: cc(
      'auto it = std::find(v.begin(), v.end(), 42);',
      'if (it != v.end()) {',
      '    std::cout << "found at " << (it - v.begin());',
      '}',
    ),
  },
  {
    front: 'Lambda capture lists',
    back: '`[=]` captures used variables by copy, `[&]` by reference, `[x, &y]` names them individually, and `[this]` captures the current object',
    extra: 'Capturing by reference in a lambda that outlives the scope, such as a stored callback, leaves dangling references.',
  },
  {
    front: 'Loop over a `std::vector<std::string>` without copying each element',
    back: cc('for (const auto& name : names) {', "    std::cout << name << '\\n';", '}'),
    extra: '`for (auto name : names)` copies every string.',
  },
  {
    front: `What’s wrong with this sum?\n${cc('std::vector<double> prices{1.5, 2.5};', 'auto total = std::accumulate(prices.begin(), prices.end(), 0);')}`,
    back: 'The initial value `0` is an `int`, so the sum is accumulated as an `int`, truncating at each step: `total` is `3`, not `4.0`. Pass `0.0`',
  },
  // const and constexpr
  {
    front: '`const int* p` vs `int* const p`',
    back: '`const int* p`: you can’t modify `*p`, but `p` can point elsewhere. `int* const p`: you can modify `*p`, but `p` can’t be reseated',
    hint: 'Read the declaration right to left.',
  },
  {
    front: 'What does `const` after a member function mean, as in `int size() const;`?',
    back: 'The function promises not to modify the object, and only `const` member functions can be called on a `const` object or through a `const` reference',
  },
  {
    front: 'What does `constexpr` mean?',
    back: 'The value or function can be evaluated at compile time; a `constexpr` variable must be initialized with a constant expression',
    extra: cc(
      'constexpr int square(int x) { return x * x; }',
      'std::array<int, square(3)> grid; // size 9, computed at compile time',
    ),
  },
  // Templates
  {
    front: 'A function template',
    back: cc(
      'template <typename T>',
      'T max_of(T a, T b) {',
      '    return a > b ? a : b;',
      '}',
      '',
      'max_of(3, 7);      // T = int',
      'max_of(2.5, 1.0);  // T = double',
    ),
  },
  {
    front: 'Why are templates usually defined in headers?',
    back: 'The compiler instantiates a template separately for each set of type arguments, and it needs the full definition visible at the point of use to do that',
  },
  {
    front: 'Constrain a template to integer types',
    back: cc('template <std::integral T>', 'T gcd(T a, T b) {', '    return b == 0 ? a : gcd(b, a % b);', '}'),
    extra: 'Concepts (C++20) give clear errors instead of a page of template failures; `std::integral` is in `<concepts>`.',
  },
  {
    front: `Does this copy the string?\n${cc('std::vector<std::string> names = load();', 'auto first = names[0];')}`,
    back: 'Yes: `auto` drops references (and top-level `const`), so `first` is a copy. Write `auto& first` or `const auto& first` to refer to the element',
  },
  // Undefined behavior
  {
    front: 'What is undefined behavior?',
    back: 'Code the standard places no requirements on. The compiler may assume it never happens, so the program might crash, give wrong results, or seem to work until it doesn’t',
  },
  {
    front: 'Signed vs unsigned integer overflow',
    back: 'Signed overflow (`INT_MAX + 1`) is undefined behavior; unsigned arithmetic wraps around modulo 2ⁿ',
    extra: 'Optimizers exploit this: `x + 1 > x` may be folded to `true` for a signed `x`.',
  },
  {
    front: `What does this print?\n${cc('int x;', 'std::cout << x;')}`,
    back: 'Anything: reading an uninitialized local variable is undefined behavior. Always initialize: `int x = 0;` or `int x{};`',
    extra: 'C++26 reclassifies it as “erroneous behavior”, which is still a bug.',
  },
  {
    front: 'Common sources of undefined behavior',
    back: 'Out-of-bounds access, dereferencing null or dangling pointers, use after free, double `delete`, signed overflow, reading uninitialized variables, and data races',
    extra: 'Sanitizers catch many of them: compile with `-fsanitize=address,undefined`.',
  },
  {
    front: 'What is a data race?',
    back: 'Two threads access the same non-atomic variable without synchronization, and at least one of them writes. It is undefined behavior; use `std::mutex` or `std::atomic`',
  },
  {
    front: 'When does a base class need a virtual destructor?',
    back: 'When objects may be deleted through a pointer to the base; without it, `delete base_ptr` on a derived object is undefined behavior',
    extra: 'Rule of thumb: a class with any virtual function should have a virtual destructor.',
  },
  // Gotchas and handy types
  {
    front: 'What does `Widget w();` declare?',
    back: 'A function named `w` that returns a `Widget`, not an object (the “most vexing parse”). Write `Widget w;` or `Widget w{};`',
  },
  {
    front: '`int x = 3.7;` vs `int x{3.7};`',
    back: 'The first silently truncates to `3`; the second doesn’t compile, because brace initialization rejects narrowing conversions',
  },
  {
    front: 'Return “a value or nothing” from a function',
    back: cc(
      'std::optional<User> find_user(int id);',
      '',
      'if (auto user = find_user(42)) {',
      '    std::cout << user->name;',
      '}',
    ),
    extra: '`std::optional` is C++17; `value_or(fallback)` supplies a default.',
  },
  {
    front: 'What does `override` do?',
    back: 'Asks the compiler to verify that the function overrides a base-class virtual function, turning a signature mismatch into a compile error',
    extra: cc('void draw() const override;'),
  },
]

export const CPP: PublicDeck = {
  slug: 'cpp-essentials',
  title: 'C++ essentials: 50 cards on RAII, smart pointers, move semantics and the STL',
  shortTitle: 'C++',
  category: 'programming',
  level: 'intermediate',
  icon: 'code',
  description:
    'Modern C++ in short snippets: references vs pointers, RAII, smart pointers, move semantics, STL containers and algorithms, const, templates and UB.',
  intro:
    'Modern C++ is safer than its reputation, provided you know the rules: let RAII and smart pointers own resources, understand what `std::move` really does, and recognize code that compiles cleanly but is undefined behavior. These cards cover the C++11 to C++20 idioms with short snippets, noting the standard that introduced each newer feature.',
  faq: [
    {
      q: 'Which C++ standard does the deck use?',
      a: 'Modern C++, mostly C++17 and C++20 idioms. Newer features are marked with their standard, such as std::make_unique (C++14), std::optional and string_view (C++17), and concepts and ranges (C++20).',
    },
    {
      q: 'Is this deck for C++ beginners?',
      a: 'It suits anyone who knows basic C++ syntax, or comes from C or another language, and wants the modern idioms: ownership, move semantics, the STL and the pitfalls behind undefined behavior.',
    },
    {
      q: 'Why so many cards on undefined behavior?',
      a: 'Because UB is where C++ differs most from safer languages: buggy code often compiles and appears to work. Knowing the common sources is the best defense, together with sanitizers.',
    },
  ],
  cards: CARDS,
}
