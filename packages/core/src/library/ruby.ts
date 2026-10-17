import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const rb = (...lines: string[]) => code('ruby', ...lines)

const CARDS: CardContent[] = [
  // Objects and basics
  {
    front: 'What does “everything is an object” mean in Ruby?',
    back: 'Every value, including numbers, `nil`, `true` and classes themselves, is an object with methods: `5.even?`, `nil.to_a`, `3.times { … }`',
    extra: '`5.class` is `Integer`, and `Integer.class` is `Class`.',
  },
  {
    front: `What does this print?\n${rb('puts 0 ? "yes" : "no"')}`,
    back: '`yes`: only `nil` and `false` are falsy in Ruby; `0`, `""` and `[]` are all truthy',
  },
  {
    front: '`puts` vs `p`',
    back: '`puts` prints the `to_s` form with a newline and returns `nil`; `p` prints the `inspect` form (strings keep their quotes) and returns its argument, which makes it handy for debugging',
  },
  {
    front: 'Interpolate a value into a string',
    back: rb('puts "Hello, #{name}! You have #{items.size} items."'),
    extra: 'Interpolation only works in double-quoted strings; single quotes are literal.',
  },
  {
    front: 'What does a Ruby method return when there is no `return`?',
    back: 'The value of the last expression it evaluated',
    extra: rb('def full_name', '  "#{first} #{last}"', 'end'),
  },
  {
    front: 'What do `?` and `!` at the end of a method name signal?',
    back: '`?` marks a predicate that returns a boolean (`empty?`); `!` marks a “dangerous” version of a method, usually one that mutates the receiver (`sort!` vs `sort`)',
  },
  {
    front: 'What does `"ABC".upcase!` return?',
    back: '`nil`: many bang methods return `nil` when they make no change, so don’t chain them',
    extra: '`"abc".upcase!` returns `"ABC"`.',
  },
  {
    front: 'Generate a getter and setter for `@name`',
    back: rb('class User', '  attr_accessor :name', 'end'),
    extra: '`attr_reader` makes only the getter, `attr_writer` only the setter.',
  },
  {
    front: 'What do the prefixes `@`, `@@` and `$` mean?',
    back: '`@name` is an instance variable, `@@count` a class variable shared with subclasses, and `$stdout` a global; names starting with a capital letter are constants',
  },
  {
    front: 'What is `7 / 2` in Ruby?',
    back: '`3`: dividing two integers is integer division, rounding down',
    extra: '`7 / 2.0` and `7.fdiv(2)` give `3.5`. Note that `-7 / 2` is `-4`.',
  },
  {
    front: '`if` is an expression',
    back: rb('label = if score >= 50 then "pass" else "fail" end'),
    extra: 'So are `case` and `begin` blocks: they all return their last value.',
  },
  {
    front: 'Write a one-line conditional',
    back: rb('return if user.nil?', 'puts "Welcome back" unless first_visit?'),
    extra: 'Modifier `if` and `unless` go after the statement; `unless` means “if not”.',
  },
  {
    front: 'Memoize a value with `||=`',
    back: rb('def config', '  @config ||= load_config', 'end'),
    extra: 'Gotcha: if the result is `nil` or `false`, it is recomputed on every call.',
  },
  {
    front: 'Define a method with keyword arguments',
    back: rb(
      'def greet(name:, greeting: "Hello")',
      '  "#{greeting}, #{name}!"',
      'end',
      '',
      'greet(name: "Ada") # => "Hello, Ada!"',
    ),
    extra: '`name:` has no default, so it is required.',
  },
  {
    front: 'Call a method only if the receiver isn’t `nil`',
    back: rb('city = user&.address&.city'),
    extra: '`&.` is the safe navigation operator: it returns `nil` instead of raising `NoMethodError`.',
  },
  // Symbols and strings
  {
    front: 'What is a symbol?',
    back: 'An immutable, interned name like `:status`: every use of the same symbol is the same object, which makes symbols cheap identifiers for hash keys and method names',
  },
  {
    front: `What does this print?\n${rb('puts :a.equal?(:a)', 'puts "a".equal?("a")')}`,
    back: '`true`, then (without frozen string literals) `false`: there is only one `:a` object, but each string literal creates a new string',
    extra: '`equal?` checks identity; `"a" == "a"` is `true`.',
  },
  {
    front: `What does this print?\n${rb('h = { name: "Ada" }', 'p h["name"]')}`,
    back: '`nil`: `name:` creates a symbol key, so the value is at `h[:name]`, not `h["name"]`',
    extra: '`{ name: "Ada" }` is shorthand for `{ :name => "Ada" }`.',
  },
  {
    front: 'Are Ruby strings mutable?',
    back: 'Yes: methods like `<<` and `upcase!` modify a string in place. The magic comment `# frozen_string_literal: true` freezes every string literal in a file',
    extra:
      'Ruby 3.4 can warn (with deprecation warnings enabled) when code mutates a string literal, a step toward frozen literals by default.',
  },
  // Blocks, procs and lambdas
  {
    front: 'What is a block?',
    back: 'A chunk of code passed to a method call with `{ … }` or `do … end`; the method runs it with `yield`',
    extra: rb('[1, 2, 3].each { |n| puts n }', '', 'File.open("log.txt") do |f|', '  puts f.readline', 'end'),
  },
  {
    front: `What does this print?\n${rb('def twice', '  yield 1', '  yield 2', 'end', '', 'twice { |n| puts n * 10 }')}`,
    back: '`10` and `20` on separate lines: each `yield` calls the block with an argument',
    extra: '`block_given?` tells a method whether it received a block.',
  },
  {
    front: `What does this print?\n${rb('puts [1, 2].map do |x|', '  x * 2', 'end')}`,
    back: 'Something like `#<Enumerator: …>`, not `2` and `4`: a `do … end` block binds to the outermost call (`puts`), so `map` gets no block',
    extra: '`{ … }` binds to the nearest call: `puts [1, 2].map { |x| x * 2 }` prints `2` and `4`.',
  },
  {
    front: 'Proc vs lambda',
    back: 'A lambda checks its argument count, and `return` exits only the lambda; a proc ignores missing or extra arguments, and `return` returns from the method where the proc was defined',
  },
  {
    front: 'Create and call a lambda',
    back: rb('square = ->(x) { x * x }', 'square.call(3) # => 9', 'square.(3)     # => 9', 'square[3]      # => 9'),
  },
  {
    front: 'What does `names.map(&:upcase)` mean?',
    back: 'Shorthand for `names.map { |n| n.upcase }`: `&` turns the symbol into a block via `Symbol#to_proc`',
    extra: 'In a method definition, a `&block` parameter does the reverse, capturing the passed block as a `Proc`.',
  },
  {
    front: 'Refer to a block’s parameter without naming it',
    back: rb('[1, 2, 3].map { it * 2 } # Ruby 3.4+', '[1, 2, 3].map { _1 * 2 } # Ruby 2.7+'),
  },
  {
    front: 'Can a block use local variables from where it was written?',
    back: 'Yes. Blocks, procs and lambdas are closures: they capture the surrounding local variables and can change them',
    extra: rb('total = 0', '[1, 2, 3].each { |n| total += n }', 'total # => 6'),
  },
  // Enumerable
  {
    front: '`each` vs `map`',
    back: '`each` runs the block for its side effects and returns the original collection; `map` returns a new array of the block’s results',
  },
  {
    front: 'Common Enumerable one-liners',
    back: rb(
      '(1..10).select(&:even?)       # => [2, 4, 6, 8, 10]',
      '[1, 2, 3].reject(&:odd?)      # => [2]',
      '[1, 2, 3].reduce(:+)          # => 6',
      '%w[a bb c].find { _1.size > 1 } # => "bb"',
    ),
  },
  {
    front: 'Loop with an index, or build a result while iterating',
    back: rb(
      'names.each_with_index { |name, i| puts "#{i}: #{name}" }',
      '',
      'lengths = names.each_with_object({}) { |n, h| h[n] = n.size }',
    ),
  },
  {
    front: 'How do you get `map`, `select`, `sort` and friends for your own collection class?',
    back: 'Include the `Enumerable` module and define `each`; Enumerable builds dozens of methods on top of it',
    extra: rb(
      'class Playlist',
      '  include Enumerable',
      '',
      '  def initialize(songs)',
      '    @songs = songs',
      '  end',
      '',
      '  def each(&block)',
      '    @songs.each(&block)',
      '  end',
      'end',
    ),
  },
  {
    front: 'Count how often each word appears',
    back: rb('%w[a b a c a].tally # => {"a" => 3, "b" => 1, "c" => 1}'),
    extra: '`tally` arrived in Ruby 2.7. `group_by { … }` instead groups elements into arrays by the block’s result.',
  },
  { front: '`1..5` vs `1...5`', back: 'Two dots include the end (1 to 5); three dots exclude it (1 to 4)' },
  {
    front: 'Take the first three even squares from an infinite range',
    back: rb('(1..).lazy.map { _1 * _1 }.select(&:even?).first(3)', '# => [4, 16, 36]'),
    extra: '`lazy` processes elements one at a time, so infinite or huge sequences work.',
  },
  // Modules and classes
  {
    front: 'What is a module?',
    back: 'A container for methods and constants that can’t be instantiated: used as a namespace (`Net::HTTP`) and as a mixin added to classes',
  },
  {
    front: '`include` vs `prepend` vs `extend`',
    back: '`include` adds a module’s methods as instance methods, looked up after the class’s own; `prepend` puts them before the class’s own, so they can wrap them with `super`; `extend` adds them to a single object, e.g. as class methods',
  },
  {
    front: 'Make objects comparable with `<`, `>` and `between?`',
    back: rb(
      'class Version',
      '  include Comparable',
      '  attr_reader :major, :minor',
      '',
      '  def <=>(other)',
      '    [major, minor] <=> [other.major, other.minor]',
      '  end',
      'end',
    ),
    extra: 'The `Comparable` mixin builds `<`, `<=`, `==`, `>`, `>=`, `between?` and `clamp` from `<=>`.',
  },
  {
    front: 'Inheritance and class methods',
    back: rb(
      'class Dog < Animal',
      '  def self.create(name) = new(name)',
      '',
      '  def speak',
      '    super + " Woof"',
      '  end',
      'end',
    ),
    extra:
      'A class has one superclass; `def self.x` defines a class method; `super` calls the parent’s version of the current method.',
  },
  {
    front: 'How does Ruby find a method?',
    back: 'It walks the receiver’s ancestor chain (its class, included modules, the superclass and so on) until it finds the method, calling `method_missing` if none matches',
    extra: '`Dog.ancestors` shows the chain, e.g. `[Dog, Animal, Object, Kernel, BasicObject]`.',
  },
  {
    front: 'What are open classes (monkey patching)?',
    back: 'Any class, including built-ins like `String`, can be reopened to add or replace methods. Powerful but risky; refinements (`refine` and `using`) limit a patch to the files that opt in',
  },
  {
    front: 'What is duck typing?',
    back: 'Caring about what an object can do rather than its class: call the method, or check `respond_to?(:each)`, instead of checking `is_a?`',
  },
  {
    front: '`==` vs `equal?` vs `eql?`',
    back: '`==` compares values, `equal?` checks object identity, and `eql?` is the stricter equality used for hash keys',
    extra: '`1 == 1.0` is true, but `1.eql?(1.0)` is false.',
  },
  // Metaprogramming
  {
    front: 'What is `method_missing`?',
    back: 'A hook Ruby calls when no method matches a call, letting an object respond to dynamic method names. Pair it with `respond_to_missing?`, and call `super` for names you don’t handle',
    extra: rb(
      'class Settings',
      '  def initialize(data)',
      '    @data = data',
      '  end',
      '',
      '  def method_missing(name, *args)',
      '    @data.key?(name) ? @data[name] : super',
      '  end',
      '',
      '  def respond_to_missing?(name, include_private = false)',
      '    @data.key?(name) || super',
      '  end',
      'end',
    ),
  },
  {
    front: 'Call a method whose name is in a variable',
    back: rb('user.public_send(:name)    # respects visibility', 'user.send(:secret_helper)  # can call private methods too'),
    extra: '`define_method(:name) { … }` defines methods dynamically, which is often clearer than `method_missing`.',
  },
  // Gems and Bundler
  {
    front: 'What is a gem?',
    back: 'A packaged Ruby library or tool, published on rubygems.org and installed with `gem install <name>`',
  },
  {
    front: 'How does Bundler manage a project’s gems?',
    back: 'You list dependencies in a `Gemfile`; `bundle install` resolves compatible versions and records them in `Gemfile.lock`; `bundle exec <cmd>` runs a command with exactly those versions',
    extra: '`bundle add <gem>` adds a gem to the Gemfile and installs it.',
  },
  {
    front: 'What does `gem "rails", "~> 7.1"` allow?',
    back: 'Versions `>= 7.1` and `< 8.0`. With three parts, `"~> 7.1.3"` allows `>= 7.1.3` and `< 7.2`',
    extra: '`~>` is the “pessimistic” version constraint.',
  },
  {
    front: 'Should you commit `Gemfile.lock`?',
    back: 'Yes, for applications: it guarantees that every developer, CI run and server uses the same gem versions',
  },
  // Errors and pattern matching
  {
    front: 'Handle an exception',
    back: rb(
      'begin',
      '  data = JSON.parse(text)',
      'rescue JSON::ParserError => e',
      '  warn "Bad JSON: #{e.message}"',
      '  data = {}',
      'ensure',
      '  log_attempt',
      'end',
    ),
    extra: 'Raise with `raise ArgumentError, "message"`. Inside a method body, `rescue` works without `begin`.',
  },
  {
    front: 'Match on the shape of a hash',
    back: rb('case response', 'in { status: 200, body: }', '  puts body', 'in { status: 404 }', '  puts "Not found"', 'end'),
    extra: 'Pattern matching with `case`/`in` is stable since Ruby 3.0; `body:` binds the value to a local variable.',
  },
]

export const RUBY: PublicDeck = {
  slug: 'ruby-essentials',
  title: 'Ruby essentials: 50 cards on blocks, symbols, Enumerable and mixins',
  shortTitle: 'Ruby',
  category: 'programming',
  level: 'beginner',
  icon: 'code',
  description:
    'Ruby fundamentals with short snippets: blocks, procs and lambdas, symbols, Enumerable, mixins, truthiness, method_missing, gems and Bundler.',
  intro:
    'Ruby reads like prose, but its expressiveness rests on a few ideas worth knowing precisely: blocks and `yield`, the difference between procs and lambdas, symbols, the Enumerable methods built on `each`, and modules as mixins. These cards cover them with snippets you can paste into irb, plus the gotchas that surprise newcomers and the Bundler basics every project uses.',
  faq: [
    {
      q: 'Which Ruby version does the deck use?',
      a: 'Ruby 3. Recent features are marked, such as pattern matching (3.0) and the it block parameter (3.4).',
    },
    {
      q: 'Should I learn Ruby before Rails?',
      a: 'It helps a lot. Rails code leans on blocks, symbols, mixins and metaprogramming, which is exactly what this deck covers.',
    },
    {
      q: 'What is the difference between a proc and a lambda?',
      a: 'A lambda checks how many arguments it receives, and return leaves only the lambda. A proc is lenient with arguments, and return exits the method that defined it.',
    },
  ],
  cards: CARDS,
}
