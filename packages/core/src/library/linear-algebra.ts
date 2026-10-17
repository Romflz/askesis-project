import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Vectors
  { front: 'Dot product', back: r`\(\mathbf{u} \cdot \mathbf{v} = \displaystyle\sum_i u_i v_i\)` },
  {
    front: 'Dot product and the angle between vectors',
    back: r`\(\mathbf{u} \cdot \mathbf{v} = \lVert \mathbf{u} \rVert\,\lVert \mathbf{v} \rVert \cos\theta\)`,
  },
  {
    front: 'Euclidean norm of a vector',
    back: r`\(\lVert \mathbf{v} \rVert = \sqrt{\mathbf{v} \cdot \mathbf{v}} = \sqrt{\textstyle\sum_i v_i^2}\)`,
  },
  { front: 'When are two vectors orthogonal?', back: r`When their dot product is zero: \(\mathbf{u} \cdot \mathbf{v} = 0\)` },
  {
    front: r`Cross product \(\mathbf{u} \times \mathbf{v}\) in \(\mathbb{R}^3\)`,
    back: r`\((u_2 v_3 - u_3 v_2,\; u_3 v_1 - u_1 v_3,\; u_1 v_2 - u_2 v_1)\)`,
    extra: 'It is perpendicular to both vectors, oriented by the right-hand rule.',
  },
  {
    front: 'Magnitude of the cross product',
    back: r`\(\lVert \mathbf{u} \times \mathbf{v} \rVert = \lVert \mathbf{u} \rVert\,\lVert \mathbf{v} \rVert \sin\theta\)`,
    extra: 'It equals the area of the parallelogram the two vectors span.',
  },
  {
    front: 'Cauchy–Schwarz inequality',
    back: r`\(\lvert \mathbf{u} \cdot \mathbf{v} \rvert \le \lVert \mathbf{u} \rVert\,\lVert \mathbf{v} \rVert\)`,
  },
  {
    front: 'Triangle inequality',
    back: r`\(\lVert \mathbf{u} + \mathbf{v} \rVert \le \lVert \mathbf{u} \rVert + \lVert \mathbf{v} \rVert\)`,
  },
  {
    front: r`Projection of \(\mathbf{v}\) onto \(\mathbf{u}\)`,
    back: r`\(\operatorname{proj}_{\mathbf{u}} \mathbf{v} = \dfrac{\mathbf{v} \cdot \mathbf{u}}{\mathbf{u} \cdot \mathbf{u}}\,\mathbf{u}\)`,
  },
  // Matrices
  {
    front: r`When is the product \(AB\) defined?`,
    back: r`When \(A\) is \(m \times n\) and \(B\) is \(n \times p\); the result is \(m \times p\)`,
  },
  { front: r`Entry \((i, j)\) of \(AB\)`, back: r`\((AB)_{ij} = \displaystyle\sum_k a_{ik}\,b_{kj}\)` },
  {
    front: 'Is matrix multiplication commutative?',
    back: r`No: in general \(AB \neq BA\)`,
    extra: 'It is associative and distributive, though.',
  },
  { front: 'Identity matrix', back: r`A square matrix with ones on the diagonal and zeros elsewhere: \(AI = IA = A\)` },
  { front: 'Transpose of a product', back: r`\((AB)^T = B^T A^T\)` },
  { front: 'Inverse of a product', back: r`\((AB)^{-1} = B^{-1} A^{-1}\)` },
  {
    front: r`Inverse of a \(2 \times 2\) matrix`,
    back: r`\[\begin{pmatrix} a & b \\ c & d \end{pmatrix}^{-1} = \frac{1}{ad - bc}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}\]`,
    extra: r`It exists only when \(ad - bc \neq 0\).`,
  },
  {
    front: 'Trace of a matrix',
    back: r`The sum of the diagonal entries: \(\operatorname{tr}(A) = \sum_i a_{ii}\)`,
    extra: r`\(\operatorname{tr}(A + B) = \operatorname{tr}(A) + \operatorname{tr}(B)\)`,
  },
  { front: 'Cyclic property of the trace', back: r`\(\operatorname{tr}(AB) = \operatorname{tr}(BA)\)` },
  // Determinants
  { front: r`Determinant of a \(2 \times 2\) matrix \(\begin{pmatrix} a & b \\ c & d \end{pmatrix}\)`, back: r`\(ad - bc\)` },
  {
    front: r`Determinant of \(\begin{pmatrix} a & b & c \\ d & e & f \\ g & h & i \end{pmatrix}\)`,
    back: r`\(a(ei - fh) - b(di - fg) + c(dh - eg)\)`,
    extra: 'Cofactor expansion along the first row.',
  },
  { front: r`\(\det(AB)\)`, back: r`\(\det(A)\,\det(B)\)` },
  { front: r`\(\det(A^T)\)`, back: r`\(\det(A)\)` },
  { front: r`\(\det(cA)\) for an \(n \times n\) matrix`, back: r`\(c^n \det(A)\)` },
  {
    front: 'Effect of swapping two rows on the determinant',
    back: 'The sign flips',
    extra: 'Adding a multiple of one row to another leaves it unchanged; scaling a row by c scales it by c.',
  },
  {
    front: 'When is a square matrix invertible?',
    back: r`Exactly when \(\det(A) \neq 0\)`,
    extra: 'Equivalently: full rank, only the trivial solution to Ax = 0, and 0 is not an eigenvalue.',
  },
  // Spaces
  { front: 'Span of a set of vectors', back: 'The set of all their linear combinations' },
  {
    front: 'Linear independence',
    back: r`\(c_1 \mathbf{v}_1 + \dots + c_k \mathbf{v}_k = \mathbf{0}\) only when every \(c_i = 0\)`,
  },
  { front: 'Basis', back: 'A linearly independent set of vectors that spans the space' },
  { front: 'Dimension of a vector space', back: 'The number of vectors in any basis' },
  { front: 'Null space of A', back: r`All vectors \(\mathbf{x}\) with \(A\mathbf{x} = \mathbf{0}\)` },
  {
    front: 'Column space of A',
    back: r`The span of the columns of \(A\): all \(\mathbf{b}\) for which \(A\mathbf{x} = \mathbf{b}\) has a solution`,
  },
  {
    front: 'Rank of a matrix',
    back: 'The dimension of its column space, which equals the dimension of its row space and the number of pivots',
  },
  {
    front: r`Rank–nullity theorem (\(A\) is \(m \times n\))`,
    back: r`\(\operatorname{rank}(A) + \operatorname{nullity}(A) = n\)`,
    extra: 'n is the number of columns.',
  },
  // Systems
  {
    front: 'Elementary row operations',
    back: 'Swap two rows, multiply a row by a nonzero scalar, add a multiple of one row to another',
  },
  { front: 'Gaussian elimination', back: 'Row-reduce the augmented matrix to row echelon form, then solve by back-substitution' },
  {
    front: r`How many solutions can \(A\mathbf{x} = \mathbf{b}\) have?`,
    back: 'None, exactly one, or infinitely many',
    extra: 'None if inconsistent; one if consistent with no free variables; infinitely many if there are free variables.',
  },
  { front: 'Least-squares normal equations', back: r`\(A^T A\,\hat{\mathbf{x}} = A^T \mathbf{b}\)` },
  { front: r`Projection matrix onto the column space of \(A\) (full column rank)`, back: r`\(P = A (A^T A)^{-1} A^T\)` },
  // Eigenvalues
  { front: 'Eigenvalue and eigenvector', back: r`\(A\mathbf{v} = \lambda \mathbf{v}\) with \(\mathbf{v} \neq \mathbf{0}\)` },
  { front: 'Characteristic equation', back: r`\(\det(A - \lambda I) = 0\)`, extra: 'Its roots are the eigenvalues.' },
  {
    front: 'Sum and product of the eigenvalues',
    back: r`Sum \(= \operatorname{tr}(A)\), product \(= \det(A)\)`,
    extra: 'Counted with multiplicity, over the complex numbers.',
  },
  {
    front: 'Diagonalization',
    back: r`\(A = PDP^{-1}\), with eigenvectors as the columns of \(P\) and eigenvalues on the diagonal of \(D\)`,
    extra: r`Possible exactly when \(A\) has \(n\) linearly independent eigenvectors.`,
  },
  { front: r`An \(n \times n\) matrix with \(n\) distinct eigenvalues is…`, back: 'Diagonalizable' },
  { front: 'Matrix powers via diagonalization', back: r`\(A^k = P D^k P^{-1}\)` },
  // Orthogonality and decompositions
  {
    front: 'Orthogonal matrix',
    back: r`\(Q^T Q = I\), so \(Q^{-1} = Q^T\)`,
    extra: 'Its columns are orthonormal; it preserves lengths and angles, and det Q = ±1.',
  },
  {
    front: 'Gram–Schmidt process',
    back: 'Turns a basis into an orthonormal basis: subtract from each vector its projections onto the previous ones, then normalize',
  },
  {
    front: 'Spectral theorem (real symmetric matrices)',
    back: r`A real symmetric matrix has real eigenvalues and orthogonal eigenvectors: \(A = Q \Lambda Q^T\)`,
  },
  {
    front: 'Positive definite matrix',
    back: r`A symmetric matrix with \(\mathbf{x}^T A \mathbf{x} > 0\) for every \(\mathbf{x} \neq \mathbf{0}\)`,
    extra: 'Equivalently, all its eigenvalues are positive.',
  },
  {
    front: 'Singular value decomposition (SVD)',
    back: r`\(A = U \Sigma V^T\), with \(U\) and \(V\) orthogonal and \(\Sigma\) diagonal with nonnegative entries`,
    extra: 'Every real matrix has one.',
  },
  { front: r`Singular values of \(A\)`, back: r`The square roots of the eigenvalues of \(A^T A\)` },
]

export const LINEAR_ALGEBRA: PublicDeck = {
  slug: 'linear-algebra',
  title: 'Linear algebra flashcards: 50 definitions and theorems',
  shortTitle: 'Linear algebra',
  category: 'math',
  level: 'intermediate',
  icon: 'book',
  description:
    'Vectors, matrices, determinants, eigenvalues, orthogonality and the SVD: the linear algebra behind machine learning and engineering, in 50 LaTeX flashcards.',
  intro:
    'Linear algebra runs through machine learning, graphics, physics and statistics. This deck covers the definitions and results you reach for most: dot and cross products, matrix rules, determinants, rank and null space, eigenvalues and diagonalization, orthogonal matrices, projections and the singular value decomposition.',
  faq: [
    {
      q: 'What course does this deck match?',
      a: 'A first university course in linear algebra, plus the orthogonality and SVD results used in data science.',
    },
    {
      q: 'Is it useful for machine learning?',
      a: 'Yes. Projections, least squares, eigenvalues, positive definite matrices and the SVD show up throughout ML.',
    },
    { q: 'Do I need calculus first?', a: 'No. Linear algebra stands on its own; basic algebra is enough to start.' },
  ],
  cards: CARDS,
}
