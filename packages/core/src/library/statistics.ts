import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Describing data
  { front: 'Sample mean', back: r`\(\bar{x} = \dfrac{1}{n}\displaystyle\sum_{i=1}^{n} x_i\)` },
  {
    front: 'Median',
    back: 'The middle value of the sorted data; with an even count, the average of the two middle values',
    extra: 'Unlike the mean, it is robust to outliers.',
  },
  { front: 'Mode', back: 'The most frequent value in the data', extra: 'A dataset can have no mode, one mode, or several.' },
  { front: 'Range', back: 'Maximum minus minimum' },
  {
    front: 'Interquartile range (IQR)',
    back: r`\(\mathrm{IQR} = Q_3 - Q_1\)`,
    extra: 'The spread of the middle 50% of the data.',
  },
  { front: 'Tukey’s rule for outliers', back: r`Values below \(Q_1 - 1.5\,\mathrm{IQR}\) or above \(Q_3 + 1.5\,\mathrm{IQR}\)` },
  { front: 'Population variance', back: r`\(\sigma^2 = \dfrac{1}{N}\displaystyle\sum_{i=1}^{N} (x_i - \mu)^2\)` },
  { front: 'Sample variance', back: r`\(s^2 = \dfrac{1}{n - 1}\displaystyle\sum_{i=1}^{n} (x_i - \bar{x})^2\)` },
  {
    front: 'Bessel’s correction',
    back: r`Dividing by \(n - 1\) instead of \(n\) in the sample variance, which makes \(s^2\) an unbiased estimator of \(\sigma^2\)`,
  },
  { front: 'Standard deviation', back: 'The square root of the variance', extra: 'It has the same units as the data.' },
  { front: 'Variance shortcut formula', back: r`\(\mathrm{Var}(X) = E[X^2] - (E[X])^2\)` },
  // The normal distribution and sampling
  {
    front: 'z-score',
    back: r`\(z = \dfrac{x - \mu}{\sigma}\)`,
    extra: 'How many standard deviations a value lies from the mean.',
  },
  { front: 'Standard normal distribution', back: r`The normal distribution with mean \(0\) and standard deviation \(1\)` },
  {
    front: 'Empirical rule (68–95–99.7)',
    back: 'In a normal distribution, about 68%, 95% and 99.7% of values lie within 1, 2 and 3 standard deviations of the mean',
  },
  {
    front: 'Central limit theorem',
    back: 'For independent samples from a population with finite variance, the distribution of the sample mean approaches a normal distribution as n grows, whatever the population’s shape',
  },
  {
    front: 'Standard error of the mean',
    back: r`\(\mathrm{SE} = \dfrac{\sigma}{\sqrt{n}}\)`,
    extra: r`In practice \(\sigma\) is estimated with the sample standard deviation \(s\).`,
  },
  { front: 'Law of large numbers', back: 'As the sample size grows, the sample mean converges to the expected value' },
  // Estimation and testing
  { front: r`95% confidence interval for a mean (\(\sigma\) known)`, back: r`\(\bar{x} \pm 1.96\,\dfrac{\sigma}{\sqrt{n}}\)` },
  {
    front: 'What does a 95% confidence interval mean?',
    back: 'If the sampling were repeated many times, about 95% of the intervals built this way would contain the true parameter',
  },
  {
    front: r`Null hypothesis \(H_0\)`,
    back: 'The default claim of no effect or no difference, which the test tries to find evidence against',
  },
  { front: r`Alternative hypothesis \(H_1\)`, back: r`The claim you accept if the data lead you to reject \(H_0\)` },
  { front: 'p-value', back: r`The probability, assuming \(H_0\) is true, of a result at least as extreme as the one observed` },
  {
    front: r`Significance level \(\alpha\)`,
    back: r`The threshold for rejecting \(H_0\): reject when \(p \le \alpha\). It is the probability of a type I error.`,
    extra: r`\(\alpha = 0.05\) is common.`,
  },
  { front: 'Type I error', back: r`Rejecting a true null hypothesis (a false positive); its probability is \(\alpha\)` },
  { front: 'Type II error', back: r`Failing to reject a false null hypothesis (a false negative); its probability is \(\beta\)` },
  {
    front: 'Statistical power',
    back: r`\(1 - \beta\): the probability of rejecting \(H_0\) when it is false`,
    extra: 'Power grows with sample size and effect size.',
  },
  {
    front: 'One-sample t statistic',
    back: r`\(t = \dfrac{\bar{x} - \mu_0}{s/\sqrt{n}}\)`,
    extra: r`With \(n - 1\) degrees of freedom.`,
  },
  {
    front: 'When do you use a t-test instead of a z-test?',
    back: r`When the population standard deviation is unknown and estimated by \(s\), especially with small samples`,
  },
  {
    front: 'Paired t-test',
    back: 'Compares the means of two related measurements (e.g. before and after on the same subjects) by testing the mean of their differences',
  },
  {
    front: 'Chi-square test statistic',
    back: r`\(\chi^2 = \displaystyle\sum \frac{(O - E)^2}{E}\)`,
    extra: 'O observed counts, E expected counts.',
  },
  {
    front: 'Chi-square test of independence',
    back: 'Tests whether two categorical variables are associated, using counts in a contingency table',
  },
  {
    front: 'Expected count in a contingency table cell',
    back: r`\(E = \dfrac{\text{row total} \times \text{column total}}{\text{grand total}}\)`,
  },
  // Correlation and regression
  {
    front: 'Correlation vs causation',
    back: 'A correlation shows an association; it does not show that one variable causes the other',
    extra: 'Confounding variables or reverse causation can produce the same pattern.',
  },
  {
    front: 'Pearson correlation coefficient r',
    back: r`A measure of linear association between \(-1\) and \(1\): its sign gives the direction, its size the strength`,
  },
  {
    front: 'Formula for Pearson’s r',
    back: r`\[r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2}\,\sqrt{\sum (y_i - \bar{y})^2}}\]`,
  },
  { front: 'What does least-squares regression minimize?', back: 'The sum of squared residuals' },
  { front: 'Residual', back: r`\(e_i = y_i - \hat{y}_i\): the observed value minus the predicted value` },
  { front: 'Least-squares slope and intercept', back: r`\(b_1 = r\,\dfrac{s_y}{s_x}\), \(\;b_0 = \bar{y} - b_1\bar{x}\)` },
  {
    front: r`Coefficient of determination \(R^2\)`,
    back: r`The proportion of the variance in \(y\) explained by the model`,
    extra: r`In simple linear regression, \(R^2 = r^2\).`,
  },
  // Probability
  { front: 'Conditional probability', back: r`\(P(A \mid B) = \dfrac{P(A \cap B)}{P(B)}\), for \(P(B) > 0\)` },
  { front: 'Bayes’ theorem', back: r`\(P(A \mid B) = \dfrac{P(B \mid A)\,P(A)}{P(B)}\)` },
  { front: 'Independent events', back: r`\(P(A \cap B) = P(A)\,P(B)\)`, extra: r`Equivalently \(P(A \mid B) = P(A)\).` },
  { front: 'Addition rule for probabilities', back: r`\(P(A \cup B) = P(A) + P(B) - P(A \cap B)\)` },
  { front: 'Mutually exclusive events', back: r`Events that can’t both happen: \(P(A \cap B) = 0\)` },
  { front: 'Expected value of a discrete random variable', back: r`\(E[X] = \displaystyle\sum_x x\,P(X = x)\)` },
  {
    front: 'Linearity of expectation',
    back: r`\(E[aX + bY] = a\,E[X] + b\,E[Y]\)`,
    extra: 'It holds even when X and Y are dependent.',
  },
  { front: r`Variance of \(aX + b\)`, back: r`\(\mathrm{Var}(aX + b) = a^2\,\mathrm{Var}(X)\)` },
  {
    front: 'Binomial probability mass function',
    back: r`\(P(X = k) = \dbinom{n}{k}\,p^k (1 - p)^{n - k}\)`,
    extra: 'n independent trials, each succeeding with probability p.',
  },
  { front: 'Mean and variance of a binomial distribution', back: r`Mean \(np\), variance \(np(1 - p)\)` },
  {
    front: 'Poisson probability mass function',
    back: r`\(P(X = k) = \dfrac{\lambda^k e^{-\lambda}}{k!}\)`,
    extra: r`Its mean and variance are both \(\lambda\).`,
  },
]

export const STATISTICS: PublicDeck = {
  slug: 'statistics',
  title: 'Statistics flashcards: 50 formulas and concepts',
  shortTitle: 'Statistics',
  category: 'math',
  level: 'beginner',
  icon: 'book',
  description:
    'Learn the statistics every course and data job relies on: variance, the normal distribution, hypothesis tests, regression and probability rules, with formulas in clean LaTeX.',
  intro:
    'Statistics is a short list of ideas used over and over: measures of center and spread, the normal distribution, sampling, confidence intervals, hypothesis tests, correlation and regression, and the rules of probability. Each card asks for one definition or formula, so you can drill them in a few minutes a day.',
  faq: [
    {
      q: 'What level is this statistics deck?',
      a: 'An introductory course: descriptive statistics, the normal distribution, inference, regression and basic probability.',
    },
    {
      q: 'Why does the sample variance divide by n − 1?',
      a: 'Bessel’s correction. Using the sample mean instead of the true mean underestimates spread, and dividing by n − 1 makes the estimate unbiased.',
    },
    {
      q: 'Is a p-value the probability that the null hypothesis is true?',
      a: 'No. It is the probability of data at least as extreme as yours, assuming the null hypothesis is true.',
    },
    { q: 'How are formulas shown?', a: 'With LaTeX rendered by KaTeX, so they look like a textbook.' },
  ],
  cards: CARDS,
}
