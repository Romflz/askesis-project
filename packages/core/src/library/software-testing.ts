import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const py = (...lines: string[]) => code('python', ...lines)

const CARDS: CardContent[] = [
  // Kinds of tests
  {
    front: 'The test pyramid',
    back: 'Many fast unit tests at the base, fewer integration tests in the middle, and a few end-to-end tests at the top',
    extra:
      'Tests get slower, costlier and more brittle toward the top, so most checks belong lower down. Popularized by Mike Cohn.',
  },
  {
    front: 'Unit test',
    back: 'Tests a small piece of code, such as a function or a class, in isolation; it runs in milliseconds, without a network, database or file system',
  },
  {
    front: 'Integration test',
    back: 'Checks that several components work together correctly, e.g. your data-access code against a real database, or two services talking over HTTP',
  },
  {
    front: 'End-to-end (E2E) test',
    back: 'Exercises the whole running system the way a user would, e.g. driving a browser with Playwright or Cypress through sign-up and checkout',
    extra: 'The most realistic kind of test, but also the slowest and the most prone to flakiness.',
  },
  {
    front: 'The “ice cream cone” anti-pattern',
    back: 'An upside-down test pyramid: mostly manual and end-to-end tests with few unit tests, which makes feedback slow and flaky',
  },
  {
    front: 'The testing trophy',
    back: 'Kent C. Dodds’ alternative to the pyramid: static analysis at the base, then unit tests, a large layer of integration tests, and a few end-to-end tests on top',
    extra: 'Its motto, from Guillermo Rauch: “Write tests. Not too many. Mostly integration.”',
  },
  {
    front: 'Arrange, Act, Assert',
    back: 'A common structure for a test: set up the data, perform the one action under test, then check the outcome',
    extra: py(
      'def test_coupon_reduces_total():',
      '    cart = Cart([Item(price=100)])  # Arrange',
      '    cart.apply_coupon("SAVE10")     # Act',
      '    assert cart.total() == 90       # Assert',
    ),
  },
  {
    front: 'Black-box vs white-box testing',
    back: 'Black-box tests are designed from the specification without looking at the code; white-box tests are designed from the code’s internal structure, e.g. to cover every branch',
  },
  {
    front: 'Smoke test',
    back: 'A quick, shallow check that the most important things work at all (the app starts, the home page loads, a user can sign in) before deeper testing',
  },
  {
    front: 'Regression testing',
    back: 'Re-running tests after a change to make sure existing behavior still works',
    extra: 'When you fix a bug, first add a test that reproduces it, so the same bug can’t silently come back.',
  },
  {
    front: 'Acceptance testing',
    back: 'Checks that the system meets the business requirements or acceptance criteria, usually from the user’s point of view; in user acceptance testing (UAT), real users or the customer do the checking',
  },
  // TDD and BDD
  {
    front: 'The TDD cycle',
    back: 'Red: write a failing test. Green: write just enough code to make it pass. Refactor: clean up while the tests stay green',
    extra: 'Test-driven development was popularized by Kent Beck.',
  },
  {
    front: 'Benefits of test-driven development',
    back: 'You define the behavior before writing code, the design is pushed toward small, decoupled, testable units, and you end up with a test suite that makes refactoring safe',
  },
  {
    front: 'Behavior-driven development (BDD)',
    back: 'Describing behavior as concrete examples in business-readable language, usually Given / When / Then scenarios that run as tests, e.g. with Cucumber',
    extra: 'Given a cart containing one book\nWhen the customer applies the coupon SAVE10\nThen the total is 10% lower',
  },
  // Test doubles
  {
    front: 'Test double',
    back: 'Any object that stands in for a real dependency in a test; the umbrella term for dummies, stubs, spies, mocks and fakes',
    extra: 'The term comes from Gerard Meszaros, by analogy with stunt doubles in films.',
  },
  { front: 'Dummy (test double)', back: 'An object passed only to fill a parameter list and never actually used' },
  {
    front: 'Stub',
    back: 'A double that returns canned answers, so the test controls what the code under test receives, e.g. an exchange-rate service that always returns 1.1',
  },
  {
    front: 'Spy',
    back: 'A double, or a wrapper around a real object, that records how it was called so the test can check those calls afterward',
  },
  {
    front: 'Mock',
    back: 'A double programmed with expectations about the calls it should receive; the test fails if the interactions don’t match',
    extra:
      'In everyday speech “mock” means any double, and libraries such as Jest and `unittest.mock` create objects that can act as stubs, spies or mocks.',
  },
  {
    front: 'Fake',
    back: 'A real, working implementation that takes a shortcut unsuitable for production, e.g. an in-memory repository instead of a database',
  },
  {
    front: 'Stubs vs mocks: state vs behavior verification',
    back: 'With stubs you check the result or final state (state verification); with mocks you check that the right calls were made (behavior verification)',
    extra:
      'Heavy mocking ties tests to implementation details, so harmless refactors break them. See Martin Fowler’s essay “Mocks Aren’t Stubs”.',
  },
  {
    front: `What does this test use the \`Mock\` for?\n${py(
      'from unittest.mock import Mock',
      '',
      'def test_checkout_charges_card():',
      '    gateway = Mock()',
      '    gateway.charge.return_value = {"status": "ok"}',
      '    checkout(Cart(total=4200), gateway)',
      '    gateway.charge.assert_called_once_with(4200)',
    )}`,
    back: 'Both roles: `return_value` makes it a stub that feeds `checkout` a canned reply, and `assert_called_once_with` verifies the call, as a mock would',
  },
  {
    front: '“Don’t mock what you don’t own”',
    back: 'Instead of mocking a third-party library directly, wrap it in a small interface of your own, use doubles of that interface in unit tests, and cover the wrapper with integration tests',
    extra: 'A mock of code you don’t control encodes your assumptions about it, which may be wrong or go out of date.',
  },
  // Coverage and mutation testing
  {
    front: 'Line, branch and function coverage',
    back: 'The share of lines executed, of decision outcomes taken (both sides of every `if`), and of functions called while the tests run',
  },
  {
    front: `The only test calls \`discount(100, member=True)\`. Line and branch coverage?\n${py('def discount(price, member):', '    if member:', '        price = price * 0.9', '    return price')}`,
    back: '100% line coverage, but only 50% branch coverage: the path where `member` is false never runs',
  },
  {
    front: 'Why doesn’t 100% code coverage mean the code is well tested?',
    back: 'Coverage only shows that code ran, not that its results were checked: a test without assertions still counts, and missing cases or edge inputs don’t show up',
    extra:
      'When coverage becomes a target, people write tests to hit lines rather than to catch bugs (Goodhart’s law). Use it to find untested code, not as a quality score.',
  },
  {
    front: 'Mutation testing',
    back: 'A tool makes many small changes (mutants) to your code, such as `>` to `>=` or `+` to `-`, and runs the tests against each one. A mutant that no test catches reveals a gap in the tests',
    extra: 'Tools: PIT (Java), Stryker (JavaScript, C#, Scala), mutmut (Python), cargo-mutants (Rust).',
  },
  {
    front: 'Killed vs survived mutants, and the mutation score',
    back: 'A mutant is killed if at least one test fails, and survives if all tests still pass. The mutation score is the share of mutants killed',
    extra:
      'Mutation testing is slow, since the suite runs once per mutant, and some mutants behave exactly like the original code, so no test can kill them.',
  },
  // Property-based testing
  {
    front: 'Property-based testing',
    back: 'Instead of hand-picked examples, you state a property that must hold for all inputs, and the framework checks it against hundreds of generated inputs',
    extra: 'It started with QuickCheck for Haskell; Hypothesis (Python) and fast-check (JavaScript) are popular today.',
  },
  {
    front: `What kind of test is this?\n${py(
      'from hypothesis import given, strategies as st',
      '',
      '@given(st.lists(st.integers()))',
      'def test_sorting_twice_changes_nothing(xs):',
      '    assert sorted(sorted(xs)) == sorted(xs)',
    )}`,
    back: 'A property-based test: Hypothesis generates many lists of integers and checks, for every one, that sorting is idempotent',
  },
  {
    front: 'Shrinking (property-based testing)',
    back: 'After finding a failing input, the framework simplifies it step by step to the smallest input that still fails, e.g. from a 40-element list down to `[0, -1]`',
  },
  {
    front: 'Useful properties to test',
    back: 'Round trips (`decode(encode(x)) == x`), invariants (sorted output is ordered and has the same length), idempotence (doing it twice equals doing it once), and agreement with a simpler reference implementation',
  },
  // Flaky tests and isolation
  {
    front: 'Flaky test',
    back: 'A test that sometimes passes and sometimes fails on the same code',
    extra: 'Flaky tests teach a team to ignore red builds, so fix or quarantine them quickly.',
  },
  {
    front: 'Common causes of flaky tests',
    back: 'Fixed sleeps and timing assumptions, race conditions in async code, shared state or dependence on test order, and relying on the real clock, randomness or network',
  },
  {
    front: 'How do you stop a UI test from failing on a slow page load?',
    back: 'Wait for a condition, such as the element becoming visible, with a timeout, instead of sleeping for a fixed time',
    extra: 'Playwright’s locators and web-first assertions wait automatically.',
  },
  {
    front: 'Test isolation',
    back: 'Each test sets up and cleans up its own state, so it passes on its own, in any order and in parallel with others',
    extra:
      'Common tools: a database transaction rolled back after each test, temporary directories, and no shared mutable globals.',
  },
  {
    front: 'How do you test code that depends on the current time?',
    back: 'Control the clock: inject a clock object, or use fake timers such as `jest.useFakeTimers()` or Python’s `freezegun`',
    extra:
      'Reading the real clock directly makes results depend on when the tests run, e.g. failing only around midnight or on leap days.',
  },
  // Contract testing
  {
    front: 'Contract testing',
    back: 'Checks that an API consumer and its provider agree on requests and responses by testing each side separately against a shared contract, without deploying both together',
  },
  {
    front: 'Consumer-driven contract testing (e.g. Pact)',
    back: 'The consumer’s tests record the requests it makes and the responses it needs into a contract; the provider’s CI replays that contract against the real provider and fails on breaking changes',
  },
  // Techniques
  {
    front: 'Test fixture',
    back: 'The fixed setup a test needs, such as objects, data or database state, often shared through hooks like `beforeEach` or pytest fixtures',
  },
  {
    front: 'Parameterized test',
    back: 'One test function that runs with several sets of inputs and expected outputs',
    extra: py(
      'import pytest',
      '',
      '@pytest.mark.parametrize("a, b, expected", [(1, 2, 3), (0, 0, 0), (-1, 1, 0)])',
      'def test_add(a, b, expected):',
      '    assert add(a, b) == expected',
    ),
  },
  {
    front: 'Boundary value analysis',
    back: 'Testing at and just around the edges of valid ranges, where off-by-one bugs live: for a valid range of 1–100, try 0, 1, 2, 99, 100 and 101',
  },
  {
    front: 'Equivalence partitioning',
    back: 'Dividing inputs into groups the code should treat the same way, such as negative, zero and positive, and testing one representative of each group instead of every value',
  },
  {
    front: 'Snapshot testing',
    back: 'Saving the output of a component or function and failing whenever it changes later',
    extra: 'Cheap to write, but snapshot changes are easy to approve without reading; keep snapshots small.',
  },
  {
    front: 'Characterization tests',
    back: 'Tests that pin down what legacy code currently does, right or wrong, so you can refactor it safely',
    extra: 'Described by Michael Feathers in “Working Effectively with Legacy Code”.',
  },
  // Good tests and other kinds of testing
  {
    front: 'The FIRST properties of good unit tests',
    back: 'Fast, Independent, Repeatable, Self-validating (they pass or fail with no manual checking), Timely (written along with the code)',
  },
  {
    front: 'Why test behavior rather than implementation details?',
    back: 'Tests that check observable results through the public interface survive refactoring; tests of private methods or internal calls break whenever the code is reorganized, even when it still works',
  },
  {
    front: 'Load vs stress vs soak vs spike testing',
    back: 'Load: the expected traffic. Stress: beyond capacity, to find the breaking point. Soak: normal load for hours or days, to find leaks. Spike: a sudden surge',
  },
  {
    front: 'Fuzz testing',
    back: 'Feeding huge numbers of random or malformed inputs to a program to find crashes, hangs and security bugs',
    extra:
      'Coverage-guided fuzzers such as AFL++ and libFuzzer keep mutating the inputs that reach new code paths. Go has fuzzing built into `go test`.',
  },
  {
    front: 'Functional vs non-functional testing',
    back: 'Functional tests check what the system does (its features and rules); non-functional tests check how well it does it: performance, security, usability, reliability',
  },
]

export const SOFTWARE_TESTING: PublicDeck = {
  slug: 'software-testing',
  title: 'Software testing basics: 50 cards on TDD, mocks and the test pyramid',
  shortTitle: 'Software testing',
  category: 'cs',
  level: 'beginner',
  icon: 'code',
  description:
    'Software testing fundamentals: the test pyramid, unit, integration and E2E tests, TDD, mocks vs stubs vs fakes, coverage, mutation and property-based testing.',
  intro:
    'Fifty cards on writing tests that catch bugs without slowing you down: which kinds of tests to write and how many, the TDD cycle, the difference between dummies, stubs, spies, mocks and fakes, what code coverage can and can’t tell you, techniques such as property-based, mutation and contract testing, and how to track down flaky tests.',
  faq: [
    {
      q: 'What is the difference between a mock and a stub?',
      a: 'A stub returns canned answers so the test controls the input; a mock records calls, and the test checks that the expected interactions happened. Many libraries create objects that can do both.',
    },
    {
      q: 'What code coverage should I aim for?',
      a: 'There is no universal number. Use coverage to find untested code, and judge tests by whether they would catch real bugs; mutation testing measures that more directly.',
    },
    {
      q: 'Which language are the examples in?',
      a: 'Python, with pytest, unittest.mock and Hypothesis, but the ideas apply to any language and test framework.',
    },
  ],
  cards: CARDS,
}
