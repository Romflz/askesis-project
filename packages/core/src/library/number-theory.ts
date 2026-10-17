import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Divisibility and primes
  { front: r`What does \(a \mid b\) mean?`, back: r`\(a\) divides \(b\): \(b = ka\) for some integer \(k\)` },
  { front: r`If \(d \mid a\) and \(d \mid b\), then…`, back: r`\(d \mid ax + by\) for all integers \(x\) and \(y\)` },
  {
    front: 'Division algorithm',
    back: r`For integers \(a\) and \(b > 0\) there are unique integers \(q\) and \(r\) with \(a = bq + r\) and \(0 \le r < b\)`,
  },
  {
    front: 'Prime number',
    back: r`An integer \(p > 1\) whose only positive divisors are \(1\) and \(p\)`,
    extra: '1 is neither prime nor composite.',
  },
  {
    front: 'Fundamental theorem of arithmetic',
    back: 'Every integer greater than 1 is a product of primes, and that factorization is unique apart from the order of the factors',
  },
  { front: 'Euclid’s lemma', back: r`If a prime \(p\) divides \(ab\), then \(p \mid a\) or \(p \mid b\)` },
  { front: r`If \(a \mid bc\) and \(\gcd(a, b) = 1\), then…`, back: r`\(a \mid c\)` },
  {
    front: 'Euclid’s proof that there are infinitely many primes',
    back: r`Given primes \(p_1, \dots, p_k\), the number \(p_1 p_2 \cdots p_k + 1\) leaves remainder 1 when divided by each of them, so its prime factors are new primes`,
    extra: r`The number itself need not be prime: \(2 \cdot 3 \cdot 5 \cdot 7 \cdot 11 \cdot 13 + 1 = 30031 = 59 \cdot 509\).`,
  },
  {
    front: r`To test whether \(n\) is prime, which divisors must you try?`,
    back: r`Only the primes up to \(\sqrt{n}\)`,
    extra: r`If \(n = ab\) with \(1 < a \le b\), then \(a \le \sqrt{n}\).`,
  },
  {
    front: 'Sieve of Eratosthenes',
    back: r`List the numbers \(2\) to \(n\). For each unmarked \(p \le \sqrt{n}\), which is prime, cross out the multiples of \(p\) from \(p^2\) on. What remains unmarked is prime`,
  },
  {
    front: 'Prime number theorem',
    back: r`\(\pi(x) \sim \dfrac{x}{\ln x}\), where \(\pi(x)\) counts the primes up to \(x\)`,
  },
  {
    front: r`Number of positive divisors of \(n = p_1^{a_1} p_2^{a_2} \cdots p_k^{a_k}\)`,
    back: r`\((a_1 + 1)(a_2 + 1) \cdots (a_k + 1)\)`,
    extra: r`Example: \(72 = 2^3 \cdot 3^2\) has \(4 \cdot 3 = 12\) divisors.`,
  },
  // gcd, lcm and the Euclidean algorithm
  {
    front: 'gcd and lcm from prime factorizations',
    back: 'The gcd takes each prime to the smaller of its two exponents; the lcm takes the larger',
    extra: r`\(12 = 2^2 \cdot 3\) and \(18 = 2 \cdot 3^2\) give \(\gcd = 2 \cdot 3 = 6\) and \(\operatorname{lcm} = 2^2 \cdot 3^2 = 36\).`,
  },
  {
    front: r`Product of \(\gcd(a, b)\) and \(\operatorname{lcm}(a, b)\)`,
    back: r`\(\gcd(a, b) \cdot \operatorname{lcm}(a, b) = ab\) for positive integers \(a\) and \(b\)`,
  },
  {
    front: 'Euclidean algorithm',
    back: r`Replace \((a, b)\) with \((b, a \bmod b)\) until the remainder is \(0\); the last nonzero remainder is \(\gcd(a, b)\)`,
    extra: r`It works because \(\gcd(a, b) = \gcd(b, a \bmod b)\).`,
  },
  {
    front: r`\(\gcd(252, 105)\)`,
    back: r`\(21\)`,
    extra: r`\(252 = 2 \cdot 105 + 42\), \(105 = 2 \cdot 42 + 21\), \(42 = 2 \cdot 21\).`,
  },
  {
    front: 'Bézout’s identity',
    back: r`For integers \(a\) and \(b\), not both zero, there are integers \(x\) and \(y\) with \(ax + by = \gcd(a, b)\)`,
    extra: r`The gcd is the smallest positive integer of the form \(ax + by\). The extended Euclidean algorithm finds \(x\) and \(y\).`,
  },
  { front: 'Coprime (relatively prime) integers', back: r`Integers \(a\) and \(b\) with \(\gcd(a, b) = 1\)` },
  {
    front: r`When does \(ax + by = c\) have integer solutions?`,
    back: r`Exactly when \(\gcd(a, b) \mid c\)`,
  },
  {
    front: r`All integer solutions of \(ax + by = c\), given one solution \((x_0, y_0)\)`,
    back: r`\(x = x_0 + \dfrac{b}{d}\,t\), \(y = y_0 - \dfrac{a}{d}\,t\) for integers \(t\), where \(d = \gcd(a, b)\)`,
  },
  // Congruences
  {
    front: r`What does \(a \equiv b \pmod{n}\) mean?`,
    back: r`\(n \mid a - b\): \(a\) and \(b\) leave the same remainder when divided by \(n\)`,
  },
  {
    front: r`If \(a \equiv b\) and \(c \equiv d \pmod{n}\), then…`,
    back: r`\(a + c \equiv b + d\), \(ac \equiv bd\) and \(a^k \equiv b^k \pmod{n}\)`,
  },
  {
    front: r`When can you cancel \(c\) from \(ac \equiv bc \pmod{n}\)?`,
    back: r`When \(\gcd(c, n) = 1\). In general, \(a \equiv b \pmod{n / \gcd(c, n)}\)`,
  },
  {
    front: r`When does \(a\) have an inverse modulo \(n\)?`,
    back: r`Exactly when \(\gcd(a, n) = 1\)`,
    extra: r`Bézout gives it: if \(ax + ny = 1\), then \(x\) is the inverse of \(a\).`,
  },
  { front: r`Inverse of \(3\) modulo \(7\)`, back: r`\(5\), since \(3 \cdot 5 = 15 \equiv 1 \pmod{7}\)` },
  {
    front: r`How many solutions does \(ax \equiv b \pmod{n}\) have?`,
    back: r`None unless \(d = \gcd(a, n)\) divides \(b\); if it does, exactly \(d\) solutions modulo \(n\)`,
  },
  { front: r`When are the integers modulo \(n\) a field?`, back: r`Exactly when \(n\) is prime` },
  {
    front: 'Why does the digit-sum test for divisibility by 3 and 9 work?',
    back: r`Because \(10 \equiv 1 \pmod{9}\), every power of 10 is \(\equiv 1\), so a number is congruent to its digit sum modulo 9, and so also modulo 3`,
  },
  {
    front: r`Computing \(a^k \bmod n\) efficiently`,
    back: r`Repeated squaring: square repeatedly, multiply in the powers that match the 1 bits of \(k\), and reduce modulo \(n\) at each step`,
    extra: r`It takes at most \(2\log_2 k\) multiplications instead of \(k - 1\).`,
  },
  // Fermat, Euler and Wilson
  {
    front: 'Fermat’s little theorem',
    back: r`If \(p\) is prime and \(p \nmid a\), then \(a^{p-1} \equiv 1 \pmod{p}\)`,
    extra: r`Equivalently, \(a^p \equiv a \pmod{p}\) for every integer \(a\).`,
  },
  {
    front: r`\(2^{100} \bmod 7\)`,
    back: r`\(2\)`,
    extra: r`\(2^3 = 8 \equiv 1 \pmod{7}\) and \(100 = 3 \cdot 33 + 1\), so \(2^{100} \equiv 2\).`,
  },
  {
    front: r`Euler’s totient \(\varphi(n)\)`,
    back: r`The number of integers from \(1\) to \(n\) that are coprime to \(n\)`,
  },
  {
    front: r`\(\varphi(p^k)\) for a prime \(p\)`,
    back: r`\(p^k - p^{k-1} = p^{k-1}(p - 1)\)`,
    extra: r`In particular \(\varphi(p) = p - 1\).`,
  },
  {
    front: r`Formula for \(\varphi(n)\) from the prime factors of \(n\)`,
    back: r`\(\varphi(n) = n \displaystyle\prod_{p \mid n} \left(1 - \frac{1}{p}\right)\)`,
    extra: r`\(\varphi\) is multiplicative: \(\varphi(mn) = \varphi(m)\,\varphi(n)\) when \(\gcd(m, n) = 1\).`,
  },
  {
    front: r`\(\varphi(36)\)`,
    back: r`\(12\)`,
    extra: r`\(36 \left(1 - \tfrac{1}{2}\right)\left(1 - \tfrac{1}{3}\right) = 12\)`,
  },
  {
    front: 'Euler’s theorem',
    back: r`If \(\gcd(a, n) = 1\), then \(a^{\varphi(n)} \equiv 1 \pmod{n}\)`,
    extra: r`Fermat’s little theorem is the case \(n = p\).`,
  },
  {
    front: r`Order of \(a\) modulo \(n\)`,
    back: r`The smallest \(k > 0\) with \(a^k \equiv 1 \pmod{n}\), for \(\gcd(a, n) = 1\); it always divides \(\varphi(n)\)`,
  },
  {
    front: r`Primitive root modulo \(n\)`,
    back: r`An \(a\) whose order modulo \(n\) is \(\varphi(n)\), so its powers run through every residue coprime to \(n\)`,
    extra: r`Primitive roots exist exactly when \(n\) is \(1\), \(2\), \(4\), \(p^k\) or \(2p^k\) for an odd prime \(p\).`,
  },
  {
    front: 'Carmichael number',
    back: r`A composite \(n\) with \(a^{n-1} \equiv 1 \pmod{n}\) for every \(a\) coprime to \(n\), so it passes the Fermat primality test for all such bases`,
    extra: r`The smallest is \(561 = 3 \cdot 11 \cdot 17\).`,
  },
  {
    front: 'Wilson’s theorem',
    back: r`An integer \(n > 1\) is prime exactly when \((n - 1)! \equiv -1 \pmod{n}\)`,
    extra: r`Example: \(6! = 720 = 7 \cdot 103 - 1 \equiv -1 \pmod{7}\).`,
  },
  // Chinese remainder theorem
  {
    front: 'Chinese remainder theorem',
    back: r`If \(n_1, \dots, n_k\) are pairwise coprime, the system \(x \equiv a_i \pmod{n_i}\) has exactly one solution modulo \(n_1 n_2 \cdots n_k\)`,
  },
  {
    front: r`Solve \(x \equiv 2 \pmod{3}\), \(x \equiv 3 \pmod{5}\), \(x \equiv 2 \pmod{7}\)`,
    back: r`\(x \equiv 23 \pmod{105}\)`,
    extra: 'The classic puzzle from the Sunzi Suanjing, a Chinese text from around the 3rd to 5th century.',
  },
  // Quadratic residues
  {
    front: r`Quadratic residue modulo \(n\)`,
    back: r`An \(a\) coprime to \(n\) for which \(x^2 \equiv a \pmod{n}\) has a solution`,
  },
  {
    front: r`Quadratic residues modulo \(7\)`,
    back: r`\(1\), \(2\) and \(4\)`,
    extra: r`The squares of \(1, \dots, 6\) are \(1, 4, 2, 2, 4, 1\) modulo 7.`,
  },
  {
    front: r`How many nonzero quadratic residues are there modulo an odd prime \(p\)?`,
    back: r`Exactly \(\frac{p-1}{2}\); the other \(\frac{p-1}{2}\) nonzero residues are non-residues`,
  },
  {
    front: r`Legendre symbol \(\left(\frac{a}{p}\right)\)`,
    back: r`\(1\) if \(a\) is a quadratic residue modulo the odd prime \(p\), \(-1\) if it is a non-residue, and \(0\) if \(p \mid a\)`,
  },
  {
    front: 'Euler’s criterion',
    back: r`\(\left(\dfrac{a}{p}\right) \equiv a^{(p-1)/2} \pmod{p}\) for an odd prime \(p\)`,
  },
  {
    front: r`When is \(-1\) a quadratic residue modulo an odd prime \(p\)?`,
    back: r`Exactly when \(p \equiv 1 \pmod{4}\)`,
  },
  {
    front: 'Law of quadratic reciprocity',
    back: r`For distinct odd primes \(p\) and \(q\): \(\left(\dfrac{p}{q}\right)\left(\dfrac{q}{p}\right) = (-1)^{\frac{p-1}{2} \cdot \frac{q-1}{2}}\)`,
    extra: r`So the two symbols are equal unless both \(p\) and \(q\) are \(\equiv 3 \pmod{4}\).`,
  },
  {
    front: 'Which odd primes are a sum of two squares?',
    back: r`Exactly those with \(p \equiv 1 \pmod{4}\)`,
    extra: r`Fermat’s theorem on sums of two squares; for example \(13 = 2^2 + 3^2\).`,
  },
]

export const NUMBER_THEORY: PublicDeck = {
  slug: 'number-theory',
  title: 'Number theory: 50 theorems from primes to quadratic residues',
  shortTitle: 'Number theory',
  category: 'math',
  level: 'intermediate',
  icon: 'brain',
  description:
    'Number theory flashcards in LaTeX: primes, gcd and the Euclidean algorithm, congruences, Fermat and Euler, the Chinese remainder theorem and quadratic residues.',
  intro:
    'Number theory studies the integers: how they divide one another, how primes build them, and how arithmetic behaves modulo n. This deck covers divisibility and primes, the Euclidean algorithm and Bézout’s identity, congruences and inverses, the theorems of Fermat, Euler and Wilson, the Chinese remainder theorem and quadratic residues, with worked examples to check yourself on.',
  faq: [
    {
      q: 'What background do I need?',
      a: 'Comfort with algebra and simple proofs. The deck matches a first course in elementary number theory or the number theory part of discrete math.',
    },
    {
      q: 'Is it useful for cryptography?',
      a: 'Yes. Modular inverses, fast exponentiation, Fermat’s and Euler’s theorems and the Chinese remainder theorem are the math behind RSA and Diffie–Hellman.',
    },
    {
      q: 'Does it help with math competitions?',
      a: 'It covers the core results that olympiad number theory problems build on, though competitions go much further.',
    },
    { q: 'How are formulas displayed?', a: 'With LaTeX rendered by KaTeX, so congruences and symbols look like your textbook.' },
  ],
  cards: CARDS,
}
