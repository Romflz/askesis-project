import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const rs = (...lines: string[]) => code('rust', ...lines)

const CARDS: CardContent[] = [
  {
    front: 'The three ownership rules',
    back: 'Each value has one owner; there is only one owner at a time; when the owner goes out of scope, the value is dropped',
  },
  {
    front: 'What happens to `a` after `let b = a;` when `a` is a `String`?',
    back: 'The value moves to `b`; using `a` afterwards is a compile error',
    extra: 'error[E0382]: borrow of moved value: `a`',
  },
  {
    front: 'Which types are copied instead of moved?',
    back: 'Types that implement `Copy`: integers, floats, `bool`, `char`, shared references, and tuples/arrays of `Copy` types',
  },
  {
    front: '`Copy` vs `Clone`',
    back: '`Copy` is an implicit bitwise copy for cheap types; `Clone` is an explicit, possibly expensive `.clone()`',
    extra: 'Every `Copy` type must also be `Clone`.',
  },
  {
    front: 'The borrowing rule',
    back: 'At any time you can have either one `&mut T` or any number of `&T`, and references must not outlive the value',
  },
  {
    front: 'Why doesn’t this compile?',
    back: 'You can’t borrow `v` mutably (push) while an immutable borrow (`first`) is still in use',
    extra: rs('let mut v = vec![1, 2, 3];', 'let first = &v[0];', 'v.push(4);', 'println!("{first}");'),
  },
  {
    front: '`String` vs `&str`',
    back: '`String` is an owned, growable, heap-allocated buffer; `&str` is a borrowed view of UTF-8 text',
  },
  {
    front: 'Best parameter type for read-only text',
    back: '`&str`',
    extra: 'A `&String` coerces to `&str`, so the function accepts both.',
  },
  {
    front: 'Why can’t you index a `String` with `s[0]`?',
    back: 'Strings are UTF-8, so a byte index may not be a character boundary',
    extra: 'Use `s.chars().nth(0)` or slice on a known boundary like `&s[0..1]`.',
  },
  {
    front: 'What does this signature say?',
    back: 'The returned reference lives as long as the shorter of `x` and `y`',
    extra: rs("fn longest<'a>(x: &'a str, y: &'a str) -> &'a str"),
  },
  { front: "What does `'static` mean on a reference?", back: 'The data lives for the whole program, like string literals' },
  {
    front: 'Lifetime elision with one reference input',
    back: 'The output reference gets that input’s lifetime, so you don’t write it',
  },
  { front: 'What is `Option<T>`?', back: '`Some(T)` or `None`: Rust’s way to model an absent value instead of null' },
  { front: 'What is `Result<T, E>`?', back: '`Ok(T)` or `Err(E)`: the return type for operations that can fail' },
  {
    front: 'What does the `?` operator do?',
    back: 'Unwraps `Ok`/`Some`, or returns the `Err`/`None` from the current function early',
    extra: rs(
      'fn read_config() -> Result<String, std::io::Error> {',
      '    let text = std::fs::read_to_string("config.toml")?;',
      '    Ok(text)',
      '}',
    ),
  },
  {
    front: 'How does `?` convert error types?',
    back: 'It calls `From::from` on the error, so it works when the function’s error type implements `From<SourceError>`',
  },
  { front: '`unwrap()` vs `expect("msg")`', back: 'Both panic on `None`/`Err`; `expect` adds your message to the panic' },
  {
    front: '`unwrap_or` vs `unwrap_or_else`',
    back: '`unwrap_or(v)` evaluates `v` eagerly; `unwrap_or_else(|| v)` only computes it when needed',
  },
  {
    front: 'Turn an `Option` into a `Result`',
    back: rs('let user = find_user(id).ok_or(Error::NotFound)?;'),
  },
  {
    front: 'Are `match` expressions required to be exhaustive?',
    back: 'Yes. Every possible value must be covered, often with a `_` catch-all',
  },
  {
    front: 'Match one variant and ignore the rest',
    back: rs('if let Some(user) = maybe_user {', '    greet(&user);', '}'),
  },
  {
    front: '`let ... else`',
    back: 'Destructure or bail out with a diverging block',
    extra: rs('let Some(port) = args.port else {', '    return Err("missing port".into());', '};'),
  },
  {
    front: 'Match guard',
    back: 'An extra `if` condition on a match arm',
    extra: rs('match n {', '    x if x < 0 => "negative",', '    0 => "zero",', '    _ => "positive",', '}'),
  },
  {
    front: 'What is a trait?',
    back: 'A set of methods a type can implement, like an interface; traits can provide default methods',
  },
  {
    front: 'Generic function with a trait bound',
    back: rs('fn largest<T: PartialOrd + Copy>(items: &[T]) -> T'),
  },
  {
    front: 'Same bound written with `where`',
    back: rs('fn largest<T>(items: &[T]) -> T', 'where', '    T: PartialOrd + Copy,'),
  },
  {
    front: '`impl Trait` in argument position',
    back: 'Shorthand for a generic parameter: `fn show(item: impl Display)` accepts any `Display` type',
  },
  {
    front: '`impl Trait` in return position',
    back: 'Returns one concrete type that the caller only knows by its trait, e.g. `-> impl Iterator<Item = u32>`',
  },
  {
    front: 'Generics vs `dyn Trait`',
    back: 'Generics are monomorphized (static dispatch, one copy per type); `dyn Trait` uses a vtable at runtime (dynamic dispatch)',
  },
  {
    front: 'Store different types that share a trait in one `Vec`',
    back: rs('let shapes: Vec<Box<dyn Shape>> = vec![Box::new(Circle(1.0)), Box::new(Square(2.0))];'),
  },
  { front: 'The orphan rule', back: 'You can implement a trait for a type only if your crate defines the trait or the type' },
  {
    front: 'Which traits can `#[derive]` give you?',
    back: 'Standard ones like `Debug`, `Clone`, `Copy`, `PartialEq`, `Eq`, `Hash`, `PartialOrd`, `Ord`, `Default`',
  },
  {
    front: '`Fn` vs `FnMut` vs `FnOnce`',
    back: '`Fn` borrows its captures, `FnMut` mutably borrows them, `FnOnce` may consume them and can be called once',
  },
  {
    front: 'What does `move` do on a closure?',
    back: 'Forces the closure to take ownership of the variables it captures',
    extra: rs('let name = String::from("ada");', 'std::thread::spawn(move || println!("{name}"));'),
  },
  {
    front: 'Are iterator adapters like `map` and `filter` eager?',
    back: 'No, they’re lazy; nothing runs until a consumer like `collect`, `sum` or a `for` loop drives them',
  },
  {
    front: 'Sum the squares of the even numbers',
    back: rs('let total: i32 = nums.iter().filter(|&&n| n % 2 == 0).map(|&n| n * n).sum();'),
  },
  { front: '`iter()` vs `iter_mut()` vs `into_iter()`', back: 'Yields `&T`, `&mut T`, or owned `T` (consuming the collection)' },
  {
    front: 'Collect an iterator of `Result`s, stopping at the first error',
    back: rs('let nums: Result<Vec<i32>, _> = input.lines().map(str::parse::<i32>).collect();'),
  },
  {
    front: 'When do you need `Box<T>`?',
    back: 'To put a value on the heap: recursive types, large values, or trait objects (`Box<dyn Trait>`)',
  },
  {
    front: '`Rc<T>` vs `Arc<T>`',
    back: 'Both are reference-counted shared ownership; `Arc` uses atomic counts and is safe to share across threads',
  },
  {
    front: 'What is `RefCell<T>`?',
    back: 'Interior mutability with borrow rules checked at runtime; a violation panics',
    extra: 'Common pattern for shared mutable data in one thread: `Rc<RefCell<T>>`.',
  },
  {
    front: 'Shared mutable state across threads',
    back: rs('let counter = Arc::new(Mutex::new(0));', '*counter.lock().unwrap() += 1;'),
  },
  { front: '`Send` vs `Sync`', back: '`Send`: ownership can move to another thread. `Sync`: `&T` can be shared between threads' },
  { front: 'Why isn’t `Rc<T>` `Send`?', back: 'Its reference count isn’t atomic, so two threads could corrupt it; use `Arc<T>`' },
  {
    front: 'Library vs application error handling',
    back: 'Libraries usually define error enums (often with `thiserror`); applications often use `anyhow::Result` with context',
  },
  {
    front: 'What does `unsafe` let you do?',
    back: 'Dereference raw pointers, call `unsafe` functions (including FFI), access mutable statics, implement `unsafe` traits, access union fields',
  },
  {
    front: 'Does `unsafe` turn off the borrow checker?',
    back: 'No. It only allows those extra operations; you take responsibility for upholding the safety rules',
  },
  {
    front: 'What does an `async fn` return?',
    back: 'A `Future`; nothing runs until it is `.await`ed or polled by an executor like Tokio',
  },
  {
    front: 'Make an item public and add a dependency',
    back: 'Mark items `pub` to export them; add crates with `cargo add <crate>` (written to `Cargo.toml`)',
  },
  {
    front: '`cargo check` vs `cargo build`',
    back: '`check` type-checks without producing a binary, so it’s much faster during development',
  },
]

export const RUST: PublicDeck = {
  slug: 'rust-essentials',
  title: 'Rust flashcards: 50 essentials with code',
  shortTitle: 'Rust',
  category: 'programming',
  level: 'intermediate',
  icon: 'code',
  description:
    'Learn the Rust that the compiler keeps asking about: ownership, borrowing, lifetimes, Option and Result, traits, closures, smart pointers and async.',
  intro:
    'Fifty cards on the ideas that make Rust different: moves and borrows, lifetimes, error handling with `?`, traits and generics versus `dyn`, closures, iterators, smart pointers and thread safety. Most answers come with a short snippet, and a few show the compiler error you’ll meet if you get it wrong.',
  faq: [
    {
      q: 'Is this deck for Rust beginners?',
      a: 'It suits anyone who has started the Rust book or written a little Rust. It focuses on the concepts that cause the most compiler errors.',
    },
    { q: 'Which Rust edition does it use?', a: 'Everything applies to the 2021 and 2024 editions of stable Rust.' },
    {
      q: 'Does it cover async Rust?',
      a: 'It covers the basics (futures and .await). Executors such as Tokio are only mentioned.',
    },
  ],
  cards: CARDS,
}
