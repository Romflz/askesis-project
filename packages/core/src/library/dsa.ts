import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

// Complexities are LaTeX; String.raw keeps the backslashes.
const t = String.raw
const py = (...lines: string[]) => code('python', ...lines)

const CARDS: CardContent[] = [
  { front: 'Access an array element by index', back: t`\(O(1)\)` },
  {
    front: 'Append to a dynamic array (Python list, JS array, Vec)',
    back: t`Amortized \(O(1)\)`,
    extra: 'An occasional resize copies everything, but doubling the capacity spreads that cost out.',
  },
  { front: 'Insert at the front of an array', back: t`\(O(n)\), because every element shifts` },
  { front: 'Search an unsorted array', back: t`\(O(n)\)` },
  { front: 'Access the k-th node of a linked list', back: t`\(O(n)\), you have to walk from the head` },
  { front: 'Insert or delete at the head of a linked list', back: t`\(O(1)\)` },
  { front: 'Hash map lookup, insert and delete', back: t`\(O(1)\) on average, \(O(n)\) in the worst case (many collisions)` },
  {
    front: 'Two ways hash tables resolve collisions',
    back: 'Chaining (a list per bucket) and open addressing (probe for another slot)',
  },
  { front: 'Binary heap: push, pop and peek', back: t`Push and pop \(O(\log n)\), peek at the min/max \(O(1)\)` },
  {
    front: 'Build a heap from n unsorted items',
    back: t`\(O(n)\) with bottom-up heapify`,
    extra: t`Pushing items one by one would take \(O(n \log n)\).`,
  },
  {
    front: 'Balanced BST search, insert, delete',
    back: t`\(O(\log n)\)`,
    extra: t`An unbalanced BST can degrade to \(O(n)\), like a linked list.`,
  },
  { front: 'What order does an in-order traversal of a BST visit keys in?', back: 'Sorted (ascending) order' },
  { front: 'Trie lookup for a word of length L', back: t`\(O(L)\), independent of how many words are stored` },
  { front: 'Space of an adjacency list vs an adjacency matrix', back: t`List \(O(V + E)\); matrix \(O(V^2)\)` },
  { front: 'Time of BFS or DFS on a graph (adjacency list)', back: t`\(O(V + E)\)` },
  { front: 'Shortest path in an unweighted graph', back: 'Breadth-first search from the source' },
  { front: 'Merge sort: time, space, stable?', back: t`\(O(n \log n)\) in every case, \(O(n)\) extra space, stable` },
  { front: 'Quicksort: average and worst case', back: t`Average \(O(n \log n)\), worst \(O(n^2)\) (bad pivots); not stable` },
  { front: 'Heapsort: time, space, stable?', back: t`\(O(n \log n)\), \(O(1)\) extra space, not stable` },
  { front: 'Insertion sort: best and worst case', back: t`Best \(O(n)\) on nearly sorted input, worst \(O(n^2)\); stable` },
  { front: 'Lower bound for comparison-based sorting', back: t`\(\Omega(n \log n)\) comparisons in the worst case` },
  { front: 'Counting sort complexity', back: t`\(O(n + k)\) for keys in a range of size \(k\); not comparison-based` },
  { front: 'What does “stable sort” mean?', back: 'Elements that compare equal keep their original relative order' },
  {
    front: 'Which algorithm do Python’s `sorted` and Java’s object sort use?',
    back: t`Timsort: stable, \(O(n \log n)\) worst case, \(O(n)\) on already-sorted runs`,
  },
  { front: 'Binary search time and precondition', back: t`\(O(\log n)\), and the array must be sorted` },
  {
    front: 'Binary search midpoint that can’t overflow',
    back: '`mid = lo + (hi - lo) // 2`',
    extra: 'In fixed-width integer languages, `(lo + hi) / 2` can overflow.',
  },
  {
    front: 'Two pointers: find a pair with a given sum in a sorted array',
    back: t`Start at both ends; move left up if the sum is too small, right down if too big. \(O(n)\) time, \(O(1)\) space`,
  },
  {
    front: 'Sliding window: longest substring without repeating characters',
    back: t`Grow the right edge, shrink the left while a character repeats, track positions in a map. \(O(n)\)`,
  },
  {
    front: 'Detect a cycle in a linked list in O(1) space',
    back: t`Floyd’s tortoise and hare: a slow and a fast pointer meet if there’s a cycle. \(O(n)\) time`,
  },
  { front: 'Dijkstra’s algorithm with a binary heap', back: t`\(O((V + E) \log V)\); requires non-negative edge weights` },
  { front: 'Shortest paths with negative edge weights', back: t`Bellman–Ford, \(O(VE)\); it also detects negative cycles` },
  {
    front: 'Topological sort: when does it exist, and how fast is it?',
    back: t`Only for a DAG (no cycles). Kahn’s algorithm or DFS runs in \(O(V + E)\)`,
  },
  {
    front: 'Union-find with path compression and union by rank',
    back: t`Nearly constant amortized time per operation: \(O(\alpha(n))\)`,
  },
  {
    front: 'Kruskal’s minimum spanning tree',
    back: t`Sort edges by weight and add them unless they form a cycle (checked with union-find). \(O(E \log E)\)`,
  },
  {
    front: 'Memoization vs tabulation',
    back: 'Memoization is top-down recursion with a cache; tabulation fills a table bottom-up',
  },
  { front: 'Naive recursive Fibonacci vs memoized', back: t`Naive \(O(2^n)\); memoized or iterative \(O(n)\)` },
  { front: 'Longest common subsequence of strings of lengths m and n', back: t`\(O(mn)\) time with a DP table` },
  {
    front: '0/1 knapsack with n items and capacity W',
    back: t`\(O(nW)\): pseudo-polynomial, since \(W\) is a value, not an input size`,
  },
  { front: 'Edit (Levenshtein) distance between strings of lengths m and n', back: t`\(O(mn)\) dynamic programming` },
  {
    front: 'Space cost of recursion',
    back: t`One stack frame per level: \(O(\text{depth})\), e.g. \(O(n)\) for naive recursion over a list`,
  },
  {
    front: 'What is amortized analysis?',
    back: 'The average cost per operation over a worst-case sequence of operations, even if single operations are sometimes expensive',
  },
  { front: 'Big-O vs Big-Θ vs Big-Ω', back: 'O is an upper bound, Ω a lower bound, Θ a tight bound (both)' },
  { front: t`Solve \(T(n) = 2T(n/2) + O(n)\)`, back: t`\(O(n \log n)\), as in merge sort (master theorem)` },
  {
    front: 'Find the k largest of n items',
    back: t`Keep a min-heap of size \(k\): \(O(n \log k)\)`,
    extra: t`Quickselect finds the k-th largest in \(O(n)\) on average.`,
  },
  {
    front: 'Design an LRU cache with O(1) get and put',
    back: 'A hash map from key to node plus a doubly linked list ordered by recency',
  },
  {
    front: 'Prefix sums',
    back: t`Precompute running totals in \(O(n)\), then answer any range sum in \(O(1)\)`,
    extra: py('prefix = [0]', 'for x in nums:', '    prefix.append(prefix[-1] + x)', 'range_sum = prefix[r + 1] - prefix[l]'),
  },
  { front: 'Next greater element for every item', back: t`A monotonic stack: \(O(n)\), each item is pushed and popped once` },
  { front: 'Time to generate all permutations of n items', back: t`\(O(n \cdot n!)\)` },
  { front: 'Deque operations at both ends', back: t`\(O(1)\) push and pop at either end` },
  { front: 'Height of a balanced binary tree with n nodes', back: t`\(O(\log n)\)` },
]

export const DSA: PublicDeck = {
  slug: 'data-structures-and-algorithms',
  title: 'Data structures and algorithms: 50 Big-O flashcards',
  shortTitle: 'DS & Algorithms',
  category: 'cs',
  level: 'intermediate',
  icon: 'code',
  description:
    'Big-O for arrays, hash maps, heaps, trees and graphs, sorting trade-offs, and the patterns behind interview problems: two pointers, sliding windows, BFS, Dijkstra and DP.',
  intro:
    'Fifty cards for coding interviews and everyday performance thinking: the complexity of core operations on arrays, lists, hash maps, heaps, trees, tries and graphs; which sort to use and why; and the patterns that crack most problems, from two pointers and sliding windows to Dijkstra, union-find and dynamic programming.',
  faq: [
    {
      q: 'Is this enough for coding interviews?',
      a: 'It covers the complexities and patterns interviews test most. Pair it with solving problems so you can apply them.',
    },
    { q: 'Which language are the examples in?', a: 'The few snippets use Python; the ideas are language-independent.' },
    {
      q: 'Why do some answers say amortized?',
      a: 'Operations like appending to a dynamic array are usually O(1) but occasionally expensive; amortized cost averages that out over a sequence.',
    },
  ],
  cards: CARDS,
}
