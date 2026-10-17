import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const hs = (...lines: string[]) => code('haskell', ...lines)

const CARDS: CardContent[] = [
  // Types and type classes
  {
    front: 'How do you read `add :: Int -> Int -> Int`?',
    back: '`add` takes an `Int` and returns a function of type `Int -> Int`: `->` associates to the right, so the type means `Int -> (Int -> Int)`',
    extra: 'This is currying: `add 2 3` means `(add 2) 3`, and `add 2` on its own is a function of type `Int -> Int`.',
  },
  {
    front: 'Operator sections',
    back: 'An operator with one side filled in, giving a function: `(+ 1)` adds one, `(2 ^)` raises 2 to a power, `(/ 2)` halves',
    extra: '`(- 1)` is the number negative one, not a section; write `subtract 1` instead.',
  },
  {
    front: 'What does `Eq a =>` mean in `lookup :: Eq a => a -> [(a, b)] -> Maybe b`?',
    back: 'A class constraint: `a` can be any type with an `Eq` instance, so keys can be compared with `==`',
  },
  {
    front: '`type` vs `newtype` vs `data`',
    back: '`type` gives an existing type another name; `newtype` makes a distinct type around exactly one field, with no runtime cost; `data` defines a new algebraic data type with any number of constructors and fields',
  },
  {
    front: 'Define a sum type for shapes and an area function',
    back: hs(
      'data Shape = Circle Double | Rect Double Double',
      '',
      'area :: Shape -> Double',
      'area (Circle r) = pi * r * r',
      'area (Rect w h) = w * h',
    ),
  },
  {
    front: 'What does record syntax give you?',
    back: 'Named fields with an accessor function for each, and update syntax that copies a value with some fields changed',
    extra: hs(
      'data User = User { name :: String, age :: Int }',
      '',
      'birthday :: User -> User',
      'birthday u = u { age = age u + 1 }',
    ),
  },
  {
    front: 'Get `show`, `==` and ordering for a type without writing instances',
    back: hs('data Suit = Hearts | Spades deriving (Show, Eq, Ord)'),
    extra: 'Derived `Ord` orders constructors in the order they are declared, so `Hearts < Spades`.',
  },
  {
    front: 'Write a `Show` instance by hand',
    back: hs('data Color = Red | Green', '', 'instance Show Color where', '  show Red = "red"', '  show Green = "green"'),
  },
  {
    front: 'Declare a type class with a default method',
    back: hs('class Describable a where', '  describe :: a -> String', '  describe _ = "a thing"'),
    extra: 'An instance can override `describe` or keep the default with an empty body: `instance Describable Bool`.',
  },
  {
    front: '`Int` vs `Integer`',
    back: '`Int` is a fixed-size machine integer (64 bits with GHC on 64-bit platforms) that silently overflows; `Integer` has arbitrary precision',
  },
  {
    front: 'What is `String` in Haskell?',
    back: 'A type synonym for `[Char]`: a linked list of characters',
    extra: 'For serious text processing, `Text` from the `text` package is far more efficient.',
  },
  {
    front: 'What is the kind of `Maybe`?',
    back: '`* -> *` (also written `Type -> Type`): it takes a type such as `Int` to make a concrete type',
    extra: 'That’s why `Maybe` and `[]` can have `Functor` instances but `Int` can’t. Check kinds in GHCi with `:k`.',
  },
  // Pattern matching
  {
    front: 'Sum a list with pattern matching',
    back: hs('total :: [Int] -> Int', 'total [] = 0', 'total (x:xs) = x + total xs'),
  },
  {
    front: 'What happens when no pattern matches?',
    back: 'A runtime exception (non-exhaustive patterns); compile with `-Wall` to get a warning about missing cases',
  },
  {
    front: 'What does `xs@(x:_)` bind?',
    back: '`xs` to the whole list and `x` to its first element: `@` makes an as-pattern, and `_` ignores the rest',
  },
  {
    front: 'Guards',
    back: 'Conditions tried from top to bottom, each with its own result; `otherwise` is simply `True`',
    extra: hs('sign :: Int -> String', 'sign n', '  | n < 0 = "negative"', '  | n == 0 = "zero"', '  | otherwise = "positive"'),
  },
  {
    front: '`where` vs `let … in`',
    back: '`where` attaches bindings to a whole definition, visible in all its guards; `let … in` is an expression that can appear anywhere',
  },
  {
    front: 'Match on a value in the middle of an expression',
    back: hs('describe xs = case xs of', '  [] -> "empty"', '  [_] -> "one"', '  _ -> "many"'),
  },
  {
    front: 'What does `x = x + 1` mean in Haskell?',
    back: 'A recursive definition of `x` in terms of itself, which loops forever when evaluated; Haskell has no reassignment',
  },
  // Laziness and folds
  {
    front: 'What does `take 3 (cycle [1, 2])` return?',
    back: '`[1,2,1]`: `cycle` builds an infinite list, and laziness computes only the elements that are needed',
  },
  {
    front: 'What is a thunk?',
    back: 'A suspended computation: an unevaluated expression stored until its value is needed',
  },
  {
    front: 'Weak head normal form (WHNF)',
    back: 'Evaluated only as far as the outermost constructor or lambda; `Just (1 + 1)` and `(undefined, 2)` are both in WHNF',
  },
  {
    front: 'What does `fst (1, undefined)` return?',
    back: '`1`: the second component is never evaluated, so `undefined` never throws',
  },
  {
    front: 'What does `seq a b` do?',
    back: 'Evaluates `a` to weak head normal form, then returns `b`',
    extra: '`f $! x` uses `seq` to force `x` before applying `f`.',
  },
  {
    front: "Why prefer `foldl'` to `foldl` for summing a long list?",
    back: "`foldl` is lazy in its accumulator and can build a long chain of thunks; `foldl'` (from `Data.List`) forces the accumulator at each step",
  },
  {
    front: '`foldr (-) 0 [1, 2, 3]` vs `foldl (-) 0 [1, 2, 3]`',
    back: '`foldr` computes `1 - (2 - (3 - 0))`, which is 2; `foldl` computes `((0 - 1) - 2) - 3`, which is -6',
  },
  {
    front: 'Why can `foldr` stop early on an infinite list?',
    back: 'It passes the rest of the fold to the function as a lazy argument, so a function that doesn’t use it ends the fold',
    extra: hs('foldr (\\x acc -> x > 10 || acc) False [1 ..]  -- True'),
  },
  {
    front: 'What does `[x * 2 | x <- [1 .. 10], even x]` produce?',
    back: '`[4,8,12,16,20]`: a list comprehension with a generator and a filter',
  },
  // Maybe and Either
  {
    front: 'The definition of `Maybe`',
    back: hs('data Maybe a = Nothing | Just a'),
    extra: 'It models a value that may be missing, where other languages use null.',
  },
  {
    front: 'Which side of an `Either` holds the error?',
    back: '`Left`, by convention; `Right` holds the success value, and `fmap` and `>>=` only act on `Right`',
  },
  {
    front: 'Get the value out of a `Maybe`, with a default',
    back: '`fromMaybe 0 m` (from `Data.Maybe`), or `maybe 0 f m` to also transform a `Just` value with `f`',
  },
  {
    front: 'Why avoid `head`?',
    back: 'It’s partial: `head []` throws an exception. Pattern match instead, or use `listToMaybe` or a `NonEmpty` list',
    extra: 'GHC 9.8 and later warn when you use `head` or `tail` (`-Wx-partial`).',
  },
  // Functor, Applicative and Monad
  {
    front: 'What does `fmap` do?',
    back: 'Applies a function inside a structure without changing its shape: `fmap (+ 1) (Just 2)` is `Just 3`, and `fmap (+ 1) Nothing` is `Nothing`',
    extra: '`<$>` is `fmap` as an operator: `(+ 1) <$> Just 2`.',
  },
  {
    front: 'What is `fmap (+ 1) (1, 2)`?',
    back: '`(1,3)`: the `Functor` instance for pairs maps only the second component',
    extra: 'For the same reason, `length (1, 2)` is 1.',
  },
  {
    front: 'What does `(+) <$> Just 3 <*> Just 4` return?',
    back: '`Just 7`: `(+) <$> Just 3` is `Just (3 +)`, and `<*>` applies that wrapped function to `Just 4`',
    extra: 'If either argument is `Nothing`, the result is `Nothing`.',
  },
  {
    front: 'What does `[(+ 1), (* 2)] <*> [10, 20]` return?',
    back: '`[11,21,20,40]`: the list `Applicative` applies every function to every value',
  },
  {
    front: 'How are `Functor`, `Applicative` and `Monad` related?',
    back: 'Every `Monad` is an `Applicative`, and every `Applicative` is a `Functor`: each class is a superclass of the next',
  },
  {
    front: 'The type of `>>=`',
    back: '`(>>=) :: Monad m => m a -> (a -> m b) -> m b`',
    extra: 'It feeds the result of one action into a function that chooses the next action.',
  },
  {
    front: 'Does `return` end a function early?',
    back: 'No. `return x` (the same as `pure x`) only wraps `x` in the monad; the `do` block carries on with the next line',
  },
  {
    front: 'How does a `do` block desugar?',
    back: '`do { x <- m; rest }` becomes `m >>= \\x -> do { rest }`, and `do { m; rest }` becomes `m >> do { rest }`',
  },
  {
    front: '`x <- action` vs `let x = value` in a `do` block',
    back: '`<-` runs a monadic action and binds its result; `let` binds a plain value, with no `in`',
    extra: hs('main = do', '  name <- getLine', '  let greeting = "Hi, " ++ name', '  putStrLn greeting'),
  },
  {
    front: `What does this return?\n${hs('do', '  a <- Just 1', '  b <- Nothing', '  pure (a + b)')}`,
    back: '`Nothing`: in the `Maybe` monad, the first `Nothing` short-circuits the rest of the block',
  },
  {
    front: 'Parse a list of strings, failing if any one fails',
    back: hs('traverse readMaybe ["1", "2", "x"] :: Maybe [Int]  -- Nothing'),
    extra: '`readMaybe` comes from `Text.Read`. With `["1", "2"]` the result is `Just [1,2]`.',
  },
  {
    front: '`mapM` vs `mapM_`',
    back: '`mapM` runs an action for each element and collects the results; `mapM_` runs them only for their effects and returns `()`',
    extra: '`forM_` (from `Control.Monad`) is `mapM_` with its arguments flipped: `forM_ [1 .. 3] print`.',
  },
  {
    front: 'How do you use the `String` inside an `IO String`?',
    back: 'Bind it inside another `IO` action with `<-` (or `>>=`) and pass it to pure functions from there; pure code can’t run `IO` actions',
  },
  // Everyday Prelude
  {
    front: 'What does `$` do in `print $ sum [1, 2, 3]`?',
    back: 'It is function application with the lowest precedence, so it replaces parentheses: `print (sum [1, 2, 3])`',
  },
  {
    front: 'Function composition with `.`',
    back: '`(f . g) x` is `f (g x)`, so `countWords = length . words` defines a function without naming its argument',
  },
  {
    front: 'What does `zipWith (+) [1, 2, 3] [10, 20]` return?',
    back: '`[11,22]`: `zipWith` stops at the end of the shorter list',
  },
  {
    front: 'Sort a list of pairs by their second element',
    back: '`sortOn snd pairs` (from `Data.List`)',
    extra: '`sortBy (comparing snd) pairs` does the same, with `comparing` from `Data.Ord`.',
  },
  {
    front: 'Look up a key in a `Data.Map`',
    back: hs('import qualified Data.Map.Strict as Map', '', 'Map.lookup "ada" (Map.fromList [("ada", 36)])  -- Just 36'),
    extra: 'A missing key gives `Nothing`.',
  },
]

export const HASKELL: PublicDeck = {
  slug: 'haskell-essentials',
  title: 'Haskell essentials: 50 cards on types, type classes, laziness and monads',
  shortTitle: 'Haskell',
  category: 'programming',
  level: 'intermediate',
  icon: 'code',
  description:
    'Haskell fundamentals with short code: types and type classes, pattern matching, laziness, Maybe and Either, folds, Functor, Applicative and Monad.',
  intro:
    'Fifty cards for the point where Haskell stops looking like symbols and starts reading like code: currying and type signatures, data types and type classes, pattern matching and guards, laziness and folds, Maybe and Either, and the Functor, Applicative and Monad classes behind do-notation. Answers are precise rules or short snippets you can try in GHCi.',
  faq: [
    {
      q: 'Do I need to know another functional language first?',
      a: 'No, but it helps to have worked through an introductory tutorial: the cards assume you can read a basic function definition.',
    },
    {
      q: 'Which version of Haskell does it use?',
      a: 'Standard Haskell as compiled by current GHC releases, with functions from base such as Prelude, Data.List, Data.Maybe and Text.Read. The Data.Map card uses the containers package.',
    },
    {
      q: 'Is this a monad tutorial?',
      a: 'Not quite. It drills what fmap, <*>, >>= and do-notation do with Maybe, Either, lists and IO, which is what you need to read and write everyday Haskell.',
    },
  ],
  cards: CARDS,
}
