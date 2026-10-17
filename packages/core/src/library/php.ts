import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const ph = (...lines: string[]) => code('php', ...lines)

const CARDS: CardContent[] = [
  // Types and comparisons
  {
    front: 'What does `declare(strict_types=1);` do?',
    back: 'Makes scalar type declarations strict for calls made from that file: passing `"5"` to an `int` parameter throws a `TypeError` instead of being coerced to `5`',
    extra: 'It must be the first statement in the file, and it applies per file, to the calling code.',
  },
  {
    front: 'Add parameter and return types to a function',
    back: ph('function add(int $a, int $b): int', '{', '    return $a + $b;', '}'),
  },
  {
    front: 'Nullable and union types',
    back: '`?string` accepts a string or `null` (the same as `string|null`); union types like `int|float` (PHP 8.0) accept any of the listed types',
  },
  {
    front: '`==` vs `===`',
    back: '`==` compares after type juggling; `===` requires the same type and value. Prefer `===`',
    extra: '`"1" == "01"` is true, because numeric strings compare as numbers; `"1" === "01"` is false.',
  },
  {
    front: 'What is `0 == "a"` in PHP 8?',
    back: '`false`. Since PHP 8.0, comparing a number with a non-numeric string compares them as strings',
    extra: 'In PHP 7 the string was cast to `0`, so the result was `true`, a classic source of bugs.',
  },
  { front: 'What is `"10" == "1e1"`?', back: '`true`: both strings are numeric, so `==` compares them as numbers (10 and 10.0)' },
  {
    front: '`void` vs `never` return types',
    back: '`void`: the function returns without a value. `never` (PHP 8.1): it never returns normally, because it always throws or exits',
  },
  {
    front: 'Single vs double quotes',
    back: 'Double quotes interpolate variables (`"Hi $name"`, `"Hi {$user->name}"`) and escapes like `\\n`; single quotes are literal. Concatenate strings with `.`',
  },
  {
    front: 'What does `7 / 2` return in PHP?',
    back: '`3.5`: `/` returns a float unless the division is exact (`6 / 2` is `int(3)`)',
    extra: 'Use `intdiv(7, 2)` for integer division (`3`).',
  },
  // Arrays
  {
    front: 'What is a PHP array?',
    back: 'An ordered map: one type serves as both list and dictionary, with integer or string keys, and it remembers insertion order',
  },
  {
    front: `What does this print?\n${ph('$a = ["1" => "x", 1 => "y"];', 'echo count($a);')}`,
    back: '`1`: the string key `"1"` is cast to the integer `1`, so the second entry overwrites the first',
    extra: 'Keys like `true` are cast too (to `1`), but `"01"` stays a string.',
  },
  {
    front: 'Append to an array',
    back: ph('$list = [1, 2];', '$list[] = 3; // [1, 2, 3]'),
    extra: '`array_push($list, 3)` does the same.',
  },
  {
    front: 'What does `array_filter([1, 0, 2])` return?',
    back: '`[0 => 1, 2 => 2]`: it drops falsy values but keeps the original keys, leaving a gap',
    extra:
      'Wrap it in `array_values(…)` to reindex. Mind the argument order: `array_filter($array, $fn)` but `array_map($fn, $array)`.',
  },
  {
    front: 'Destructure an array',
    back: ph('[$first, $second] = [1, 2];', "['id' => $id, 'name' => $name] = $row;", '[$a, $b] = [$b, $a]; // swap'),
  },
  {
    front: 'Merge arrays with the spread operator',
    back: ph('$all = [...$defaults, ...$overrides];'),
    extra: 'Since PHP 8.1 this works with string keys too, where later keys win.',
  },
  {
    front: `What does this print?\n${ph('$a = [1, 2, 3];', 'foreach ($a as &$v) {}', 'foreach ($a as $v) {}', 'print_r($a);')}`,
    back: '`[1, 2, 2]`: after the first loop `$v` is still a reference to `$a[2]`, so the second loop overwrites that element on every pass',
    extra: 'Call `unset($v)` after a by-reference `foreach`.',
  },
  {
    front: 'Are arrays passed by value or by reference?',
    back: 'By value: assigning or passing an array gives an independent copy (made lazily, on write). Objects, by contrast, are passed as handles to the same object',
  },
  {
    front: "`isset($a['k'])` vs `array_key_exists('k', $a)`",
    back: '`isset` returns `false` when the key exists but its value is `null`; `array_key_exists` checks only for the key',
  },
  {
    front: 'Read a request parameter with a fallback',
    back: ph("$page = $_GET['page'] ?? 1;"),
    extra: "`??` doesn’t warn about undefined keys. `$config['debug'] ??= false;` assigns only when the key is unset or null.",
  },
  // Modern syntax
  {
    front: 'A `match` expression',
    back: ph('$label = match ($status) {', "    200, 201 => 'OK',", "    404 => 'Not found',", "    default => 'Error',", '};'),
    extra: 'PHP 8.0+.',
  },
  {
    front: '`match` vs `switch`',
    back: '`match` is an expression that returns a value, compares with `===`, never falls through, and throws `UnhandledMatchError` when no arm matches; `switch` compares with `==` and falls through without `break`',
  },
  {
    front: 'Get a nested value when any link may be null',
    back: ph('$country = $session?->user?->getAddress()?->country;'),
    extra: 'The nullsafe operator `?->` (PHP 8.0) short-circuits the rest of the chain to `null`.',
  },
  {
    front: 'What are named arguments?',
    back: 'Passing arguments by parameter name (PHP 8.0), so you can skip optional parameters and the order doesn’t matter',
    extra: ph('htmlspecialchars($text, double_encode: false);'),
  },
  {
    front: 'Declare and assign properties in the constructor signature',
    back: ph(
      'class Point',
      '{',
      '    public function __construct(',
      '        public readonly int $x = 0,',
      '        public readonly int $y = 0,',
      '    ) {}',
      '}',
    ),
    extra: 'Constructor property promotion, PHP 8.0.',
  },
  {
    front: 'What does `readonly` do on a property?',
    back: 'The property can be initialized once, from inside the class, and any later write throws an `Error` (PHP 8.1). It must be typed',
    extra: 'PHP 8.2 added `readonly class`, which makes every property readonly.',
  },
  {
    front: 'A backed enum',
    back: ph(
      'enum Suit: string',
      '{',
      "    case Hearts = 'H';",
      "    case Spades = 'S';",
      '}',
      '',
      "Suit::from('H');    // Suit::Hearts",
      "Suit::tryFrom('X'); // null",
    ),
    extra: 'Enums arrived in PHP 8.1. `from` throws a `ValueError` for an unknown value.',
  },
  {
    front: 'What can PHP enums do?',
    back: 'Cases are singleton objects compared with `===`; `->name` gives the case name and `->value` the backing value; `Suit::cases()` lists them; enums can have methods and constants and implement interfaces',
  },
  {
    front: 'Arrow functions vs anonymous functions',
    back: '`fn($x) => $x * $factor` captures outer variables by value automatically; `function ($x) use ($factor) { … }` must list them in `use`',
    extra: 'Arrow functions (PHP 7.4) hold a single expression.',
  },
  {
    front: 'Get a callable for a function or method',
    back: ph('$len = strlen(...);', '$save = $repo->save(...);'),
    extra: 'First-class callable syntax, PHP 8.1.',
  },
  {
    front: 'Check whether a string contains a substring',
    back: ph("if (str_contains($haystack, 'needle')) { /* … */ }"),
    extra: '`str_contains`, `str_starts_with` and `str_ends_with` arrived in PHP 8.0.',
  },
  {
    front: `Why is this check buggy?\n${ph("if (strpos('apple', 'a')) {", "    echo 'found';", '}')}`,
    back: '`strpos` returns `0` when the match is at the start, and `0` is falsy. Compare with `!== false`, or use `str_contains`',
  },
  {
    front: 'Throw if a lookup returns null, in one expression',
    back: ph('$user = $repo->find($id) ?? throw new NotFoundException();'),
    extra: '`throw` became an expression in PHP 8.0.',
  },
  {
    front: 'A computed property with a property hook',
    back: ph(
      'class User',
      '{',
      '    public function __construct(',
      '        public string $first,',
      '        public string $last,',
      '    ) {}',
      '',
      '    public string $fullName {',
      '        get => "{$this->first} {$this->last}";',
      '    }',
      '}',
    ),
    extra: 'Property hooks arrived in PHP 8.4.',
  },
  // Classes and errors
  {
    front: 'What is a trait?',
    back: 'A reusable set of methods (and properties) copied into a class with `use`, giving code reuse despite single inheritance',
    extra: ph(
      'trait Greets',
      '{',
      '    public function greet(): string',
      '    {',
      "        return 'Hello from ' . static::class;",
      '    }',
      '}',
      '',
      'class User { use Greets; }',
    ),
  },
  {
    front: 'How does PSR-4 autoloading work?',
    back: 'Composer maps a namespace prefix to a directory, so `App\\Models\\User` is loaded from `src/Models/User.php` the first time the class is used',
    extra: 'Configure it under `autoload.psr-4` in `composer.json`, e.g. `"App\\\\": "src/"`.',
  },
  {
    front: 'PHP’s exception hierarchy',
    back: 'Everything thrown implements `Throwable`, which has two branches: `Exception` (application errors) and `Error` (engine errors like `TypeError`, `ValueError` and `DivisionByZeroError`)',
    extra: '`catch (Exception $e)` doesn’t catch `Error`s; catch `Throwable` to get both.',
  },
  // Composer
  {
    front: 'Add a package with Composer',
    back: code('bash', 'composer require monolog/monolog'),
    extra: 'This updates `composer.json` and `composer.lock` and installs the package into `vendor/`.',
  },
  {
    front: '`composer install` vs `composer update`',
    back: '`install` installs the exact versions recorded in `composer.lock`; `update` resolves the newest versions allowed by `composer.json` and rewrites the lock file',
    extra: 'Commit `composer.lock` for applications, so every machine gets the same versions.',
  },
  { front: 'Load Composer’s autoloader', back: ph("require __DIR__ . '/vendor/autoload.php';") },
  {
    front: 'What does the version constraint `^2.3` allow?',
    back: 'Any version from `2.3.0` up to, but not including, `3.0.0`: the updates that shouldn’t break compatibility under semantic versioning',
    extra: '`~2.3` also means `>=2.3.0 <3.0.0`, but `~2.3.1` means `>=2.3.1 <2.4.0`.',
  },
  // Databases and security
  {
    front: 'Query a database safely with PDO',
    back: ph(
      "$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');",
      '$stmt->execute([$email]);',
      '$user = $stmt->fetch();',
    ),
    extra:
      'Prepared statements send values separately from the SQL, which prevents SQL injection. Never interpolate input into SQL.',
  },
  {
    front: 'Use named placeholders with PDO',
    back: ph(
      "$stmt = $pdo->prepare('UPDATE users SET name = :name WHERE id = :id');",
      "$stmt->execute(['name' => $name, 'id' => $id]);",
    ),
  },
  {
    front: 'How do PDO errors surface in PHP 8?',
    back: 'As `PDOException`s: `PDO::ERRMODE_EXCEPTION` is the default since PHP 8.0. Before that the default was silent mode, so a failed query just returned `false`',
    extra: ph('$pdo = new PDO($dsn, $user, $pass, [', '    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,', ']);'),
  },
  {
    front: 'Hash and check a password',
    back: ph(
      '$hash = password_hash($password, PASSWORD_DEFAULT);',
      '',
      'if (password_verify($input, $hash)) { /* logged in */ }',
    ),
    extra:
      'The hash string includes the algorithm, cost and salt; store it in a `VARCHAR(255)` column. PHP 8.4 raised the default bcrypt cost from 10 to 12.',
  },
  {
    front: 'Why not store passwords with `md5()` or `sha1()`?',
    back: 'They are fast, unsalted hashes, so leaked hashes can be brute-forced or looked up quickly. `password_hash` uses a slow, salted algorithm (bcrypt by default, or Argon2)',
  },
  {
    front: 'Escape user input when printing it into HTML',
    back: ph("echo htmlspecialchars($comment, ENT_QUOTES, 'UTF-8');"),
    extra: 'This prevents XSS. Since PHP 8.1, `ENT_QUOTES` is part of the default flags.',
  },
  // Everyday tools
  {
    front: '`echo` vs `print_r` vs `var_dump`',
    back: '`echo` outputs strings; `print_r` prints arrays and objects readably; `var_dump` also shows types and lengths, e.g. `string(3) "abc"`',
  },
  {
    front: 'Common superglobals',
    back: '`$_GET` (query string), `$_POST` (form body), `$_SERVER` (request and server info), `$_SESSION` (session data, after `session_start()`), `$_COOKIE` and `$_FILES`',
  },
  {
    front: 'Chain function calls with the pipe operator',
    back: ph('$slug = $title', '    |> trim(...)', '    |> strtolower(...)', "    |> (fn($s) => str_replace(' ', '-', $s));"),
    extra:
      'The pipe operator `|>` arrived in PHP 8.5. Each step must be a callable that takes one argument; arrow functions need parentheses.',
  },
  {
    front: 'Serve the current directory for local development',
    back: code('bash', 'php -S localhost:8000'),
    extra: 'The built-in web server is meant for development only, not production.',
  },
]

export const PHP: PublicDeck = {
  slug: 'php-essentials',
  title: 'PHP essentials: 50 cards on modern PHP 8, arrays, enums and PDO',
  shortTitle: 'PHP',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'Modern PHP 8 with short snippets: strict types, arrays, match, nullsafe and named arguments, enums, readonly, Composer, PDO and password_hash.',
  intro:
    'PHP has changed a lot since its reputation was formed. These cards cover the modern language, from strict types, match and enums to readonly properties and property hooks, along with the array quirks every PHP developer still meets, Composer, and the safe defaults for data and passwords: PDO prepared statements, output escaping and password_hash.',
  faq: [
    {
      q: 'Which PHP version does the deck use?',
      a: 'PHP 8. Newer features are marked with the version that introduced them, from match and named arguments (8.0) and enums (8.1) to property hooks (8.4) and the pipe operator (8.5).',
    },
    {
      q: 'Does it cover Laravel or Symfony?',
      a: 'No. It covers the language, Composer and PDO, which both frameworks build on.',
    },
    {
      q: 'How do I prevent SQL injection in PHP?',
      a: 'Use prepared statements (PDO or mysqli) with placeholders and pass the values separately. Never build SQL strings from user input.',
    },
  ],
  cards: CARDS,
}
