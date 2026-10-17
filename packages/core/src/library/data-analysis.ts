import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const py = (...lines: string[]) => code('python', ...lines)
const sql = (...lines: string[]) => code('sql', ...lines)

const CARDS: CardContent[] = [
  // Describing data
  {
    front: 'Mean or median for typical household income?',
    back: 'The median: income is right-skewed, and a few very high values pull the mean far above what a typical household earns',
    extra: 'In right-skewed data the mean is greater than the median. The same goes for house prices and response times.',
  },
  {
    front: 'Why report p95 or p99 latency instead of the average?',
    back: 'Averages hide the slow tail. A p95 of 800 ms means 95% of requests were faster than 800 ms and 1 in 20 users waited longer',
  },
  {
    front: 'Five-number summary',
    back: 'Minimum, first quartile, median, third quartile and maximum: exactly what a box plot draws',
    extra: 'Box plots usually draw points beyond 1.5 × IQR from the box as individual outliers.',
  },
  {
    front: 'Get a quick statistical summary of a DataFrame',
    back: py('df.describe()   # count, mean, std, min, quartiles, max', 'df.info()       # dtypes, non-null counts, memory'),
    extra: '`describe()` covers numeric columns by default; `describe(include="all")` adds the others.',
  },
  {
    front: 'An outlier shows up in your data. Remove it or keep it?',
    back: 'Investigate first. Fix or drop it if it is an error (a typo, a test record, a unit mix-up); keep it if it is real, because extreme values are often the most important data',
    extra: 'Report results with and without it if it changes the conclusion.',
  },
  // Cleaning
  {
    front: 'First checks on a new dataset in pandas',
    back: py(
      'df = pd.read_csv("sales.csv", parse_dates=["order_date"])',
      'df.shape',
      'df.head()',
      'df.dtypes',
      'df.isna().sum()',
      'df.duplicated().sum()',
    ),
    extra: 'Look at size, types, missing values, duplicates and value ranges before any analysis.',
  },
  {
    front: 'Count missing values per column',
    back: py('df.isna().sum()'),
    extra: '`df.isna().mean()` gives the share of missing values instead.',
  },
  {
    front: 'Options for handling missing values',
    back: 'Drop the rows or columns, fill them (median, mode, a constant, or forward-fill for time series), or keep them and add an “is missing” flag. The right choice depends on why they are missing',
    extra:
      'If missingness is related to the value itself, such as high earners skipping an income question, dropping or mean-filling biases the results.',
  },
  {
    front: 'Remove duplicate orders, keeping the latest version',
    back: py('df = df.drop_duplicates(subset=["order_id"], keep="last")'),
    extra: 'Without `subset`, only rows that are identical in every column count as duplicates.',
  },
  {
    front: 'Convert a text column with stray values to numbers',
    back: py('df["price"] = pd.to_numeric(df["price"], errors="coerce")'),
    extra: '`errors="coerce"` turns values it can’t parse, such as "N/A" or "12,50", into NaN, so count the new NaNs afterwards.',
  },
  {
    front: 'Parse a date column and extract the month',
    back: py('df["created_at"] = pd.to_datetime(df["created_at"])', 'df["month"] = df["created_at"].dt.month'),
    extra: 'The `.dt` accessor also offers `year`, `day_name()`, `to_period("M")` and more.',
  },
  {
    front: 'Clean inconsistent category labels like "USA", " usa" and "U.S."',
    back: py(
      'df["country"] = (',
      '    df["country"].str.strip().str.upper()',
      '    .replace({"U.S.": "USA", "UNITED STATES": "USA"})',
      ')',
    ),
    extra: 'Check the result with `value_counts()`.',
  },
  // pandas essentials
  {
    front: 'Filter rows on two conditions in pandas',
    back: py('df[(df["country"] == "DE") & (df["amount"] > 100)]'),
    extra: 'Use `&`, `|` and `~` with parentheses around each condition; Python’s `and` and `or` raise an error on Series.',
  },
  {
    front: '`loc` vs `iloc`',
    back: '`loc` selects by labels and boolean masks; `iloc` selects by integer position',
    extra: 'Label slices with `loc` include the end label; `iloc` slices exclude the end, like Python lists.',
  },
  {
    front: 'Add a revenue column from price and quantity',
    back: py('df["revenue"] = df["price"] * df["qty"]'),
    extra: 'Vectorized column arithmetic is much faster than looping over rows or calling `apply` row by row.',
  },
  {
    front: 'Top 10 rows by revenue',
    back: py('df.sort_values("revenue", ascending=False).head(10)'),
    extra: '`df.nlargest(10, "revenue")` does the same.',
  },
  {
    front: 'Count how often each value occurs in a column',
    back: py('df["status"].value_counts()'),
    extra: 'Add `normalize=True` for proportions and `dropna=False` to count missing values too.',
  },
  {
    front: 'Why write `df.loc[mask, "col"] = value` instead of `df[mask]["col"] = value`?',
    back: 'The chained version may assign to a temporary copy and leave `df` unchanged; a single `loc` call always updates the original',
    extra: 'With Copy-on-Write, the default from pandas 3.0, chained assignment never updates the original.',
  },
  {
    front: 'Total revenue per week from daily orders',
    back: py('df.set_index("order_date").resample("W")["amount"].sum()'),
    extra:
      'Use `"MS"` for calendar months starting on the 1st or `"ME"` for month end; the old `"M"` alias is deprecated in recent pandas.',
  },
  // Group-by and joins
  {
    front: 'Total revenue per region in pandas',
    back: py('df.groupby("region")["revenue"].sum()'),
    extra: 'Group-by follows split-apply-combine: split rows into groups, apply a function to each, combine the results.',
  },
  {
    front: 'Several named aggregations per group in pandas',
    back: py(
      'df.groupby("region").agg(',
      '    orders=("order_id", "nunique"),',
      '    revenue=("amount", "sum"),',
      '    avg_order=("amount", "mean"),',
      ')',
    ),
  },
  {
    front: 'Join customer details onto orders in pandas',
    back: py('orders.merge(customers, on="customer_id", how="left")'),
    extra: 'Use `left_on` and `right_on` when the key columns have different names.',
  },
  {
    front: 'Inner vs left vs outer join',
    back: 'Inner keeps only rows whose key appears in both tables; left keeps every row of the left table, with missing values where there is no match; outer keeps every row from both',
  },
  {
    front: 'After a left join you have more rows than before. Why?',
    back: 'The key isn’t unique in the right table, so each left row is repeated once per match, which also inflates any sums',
    extra: 'Catch it early with `merge(..., validate="many_to_one")`, which raises an error if the right-hand keys repeat.',
  },
  {
    front: 'Find orders whose customer is missing from the customers table',
    back: py('m = orders.merge(customers, on="customer_id", how="left", indicator=True)', 'm[m["_merge"] == "left_only"]'),
    extra: 'In SQL: `LEFT JOIN` and keep rows where the right table’s key `IS NULL`.',
  },
  // Pivot tables and reshaping
  {
    front: 'What does a pivot table do?',
    back: 'Summarizes data by turning the values of one column into rows and another into columns, with an aggregate such as a sum at each intersection',
    extra: 'Example: revenue by region (rows) and month (columns).',
  },
  {
    front: 'Revenue by region and month as a pivot table in pandas',
    back: py('df.pivot_table(index="region", columns="month",', '               values="revenue", aggfunc="sum", fill_value=0)'),
    extra: 'The default `aggfunc` is the mean, so set it explicitly. `margins=True` adds totals.',
  },
  {
    front: '`pivot` vs `pivot_table` in pandas',
    back: '`pivot` only reshapes and fails if an index/column pair appears more than once; `pivot_table` aggregates the duplicates',
  },
  {
    front: 'Reshape monthly columns (wide) into rows (long)',
    back: py('df.melt(id_vars=["region"], var_name="month", value_name="revenue")'),
    extra:
      'Long, or tidy, data has one row per observation and one column per variable, which most plotting and group-by tools expect.',
  },
  // SQL for analysis
  {
    front: 'Orders and revenue per region in SQL, biggest first',
    back: sql(
      'SELECT region,',
      '       COUNT(*)    AS orders,',
      '       SUM(amount) AS revenue',
      'FROM orders',
      'GROUP BY region',
      'ORDER BY revenue DESC;',
    ),
  },
  {
    front: 'Pivot statuses into columns in SQL',
    back: sql(
      'SELECT region,',
      "       SUM(CASE WHEN status = 'paid'     THEN amount ELSE 0 END) AS paid,",
      "       SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) AS refunded",
      'FROM orders',
      'GROUP BY region;',
    ),
    extra: "PostgreSQL also supports `SUM(amount) FILTER (WHERE status = 'paid')`.",
  },
  {
    front: 'Monthly revenue in PostgreSQL',
    back: sql(
      "SELECT DATE_TRUNC('month', created_at) AS month,",
      '       SUM(amount) AS revenue',
      'FROM orders',
      'GROUP BY 1',
      'ORDER BY 1;',
    ),
    extra:
      "BigQuery puts the unit second, as in `DATE_TRUNC(order_date, MONTH)`; MySQL has no `DATE_TRUNC`, so use `DATE_FORMAT(created_at, '%Y-%m-01')`.",
  },
  {
    front: 'Each region’s share of total revenue in SQL',
    back: sql(
      'SELECT region,',
      '       100.0 * SUM(amount) / SUM(SUM(amount)) OVER () AS pct_of_total',
      'FROM orders',
      'GROUP BY region;',
    ),
    extra: 'The window function runs after `GROUP BY`, so it can sum the per-region sums.',
  },
  {
    front: 'Why might `SELECT converted / visitors` return 0?',
    back: 'Both columns are integers, and in PostgreSQL, SQL Server and SQLite integer division truncates. Multiply by `1.0` or cast to a decimal first',
    extra: sql('SELECT 1.0 * converted / visitors AS conversion_rate FROM funnel;'),
  },
  {
    front: 'Daily active users from an events table',
    back: sql('SELECT event_date, COUNT(DISTINCT user_id) AS dau', 'FROM events', 'GROUP BY event_date;'),
    extra: '`COUNT(*)` would count events, not people.',
  },
  // Visualization
  {
    front: 'Best chart to compare a value across categories',
    back: 'A bar chart, sorted by value, with the axis starting at zero',
    extra: 'Use horizontal bars when the category names are long.',
  },
  { front: 'Best chart to show a trend over time', back: 'A line chart, with time on the x-axis' },
  {
    front: 'Best chart to show the distribution of one numeric variable',
    back: 'A histogram, or a box plot when comparing distributions across groups',
    extra: 'Try several bin widths: too few bins hide the shape, too many add noise.',
  },
  {
    front: 'Best chart to show the relationship between two numeric variables',
    back: 'A scatter plot, optionally with a trend line',
    extra: 'With many points, use transparency or a 2D histogram so dense areas stay readable.',
  },
  {
    front: 'Why avoid a pie chart with many slices?',
    back: 'People compare angles and areas poorly; beyond a few categories, a sorted bar chart shows the differences far more clearly',
  },
  {
    front: 'Why should a bar chart’s value axis start at zero?',
    back: 'Bar length encodes the value, so a truncated axis makes small differences look huge',
    extra: 'Line charts may use a non-zero baseline, because they show change, not size.',
  },
  // A/B tests
  {
    front: 'A/B test',
    back: 'A randomized experiment: users are randomly assigned to a control (A) or a variant (B), and a predefined metric is compared between the groups',
    extra:
      'Random assignment makes the groups alike on average in everything except the change, so a difference in the metric can be attributed to it.',
  },
  {
    front: 'What should you decide before starting an A/B test?',
    back: 'The primary metric, the minimum effect worth detecting, the sample size (from a power analysis), the duration and the rule for stopping',
  },
  {
    front: 'The peeking problem',
    back: 'Checking results repeatedly and stopping as soon as p < 0.05 greatly inflates the false-positive rate. Fix the sample size in advance or use a sequential testing method',
  },
  {
    front: 'Statistical vs practical significance',
    back: 'With a huge sample, a tiny effect can be statistically significant yet too small to matter; look at the effect size and its confidence interval, not just the p-value',
  },
  {
    front: 'Sample ratio mismatch (SRM)',
    back: 'The groups’ sizes differ from the planned split, such as 50.0/50.0 planned but 51.5/48.5 observed with 100,000 users. It signals an assignment or logging bug, so don’t trust the results until it’s explained',
    extra: 'A chi-square test on the group counts detects it.',
  },
  // Correlation and causation
  {
    front: 'Ice cream sales and drownings rise together. Does ice cream cause drowning?',
    back: 'No. Hot weather drives both: it is a confounding variable',
    extra: 'A confounder influences both the supposed cause and the effect, creating an association without causation.',
  },
  {
    front: 'Simpson’s paradox',
    back: 'A trend that holds within every group reverses or disappears when the groups are combined, because the groups differ in size or mix',
    extra:
      'A classic study found treatment A had higher success rates for both small and large kidney stones, yet B looked better overall, because A was used far more on the harder, large stones.',
  },
  {
    front: 'Survivorship bias',
    back: 'Drawing conclusions only from cases that made it through a filter, such as studying successful startups or customers who stayed, while ignoring those that failed or left',
    extra:
      'WWII analysts were advised to armor the areas where returning bombers had no bullet holes: planes hit there never made it back.',
  },
  {
    front: 'Pearson r ≈ 0. Does that mean no relationship?',
    back: 'No, only no linear relationship. A U-shaped pattern can have r near 0, so always plot the data',
    extra: 'Spearman’s rank correlation captures any monotonic relationship and is less sensitive to outliers.',
  },
]

export const DATA_ANALYSIS: PublicDeck = {
  slug: 'data-analysis',
  title: 'Data analysis basics: 50 cards on cleaning, pandas, SQL and A/B tests',
  shortTitle: 'Data analysis',
  category: 'data-ai',
  level: 'beginner',
  icon: 'book',
  description:
    'Data analysis flashcards: summary statistics, data cleaning, joins and group-by in pandas and SQL, pivot tables, chart choices, A/B tests and causation.',
  intro:
    'Fifty practical cards for analysts: which summary statistic to report, how to find and fix missing values, duplicates and messy types, how joins, group-by and pivot tables work in pandas and SQL, which chart fits which question, and how to run an A/B test and read correlations without fooling yourself. Code uses pandas and PostgreSQL-flavored SQL, with notes where other databases differ.',
  faq: [
    {
      q: 'Do I need to know Python?',
      a: 'Basic Python helps with the pandas cards. The SQL, charting, A/B testing and causation cards need no Python at all.',
    },
    {
      q: 'How is this different from the Statistics deck?',
      a: 'The Statistics deck covers formulas and theory such as distributions, hypothesis tests and regression. This deck is about applying them to real, messy data: cleaning, joining, reshaping, charting and reading experiments.',
    },
    {
      q: 'Which SQL dialect is used?',
      a: 'PostgreSQL, a common choice for analytics. Cards point out where MySQL, BigQuery or SQLite behave differently.',
    },
    {
      q: 'Is it useful for data analyst interviews?',
      a: 'Yes. Joins that duplicate rows, group-by and pivot questions, chart choices, A/B test pitfalls and correlation vs causation come up constantly in analyst interviews.',
    },
  ],
  cards: CARDS,
}
