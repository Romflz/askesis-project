import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const q = (...lines: string[]) => code('sql', ...lines)

const CARDS: CardContent[] = [
  { front: 'Select active users’ names and emails', back: q('SELECT name, email', 'FROM users', 'WHERE active = true;') },
  { front: '`WHERE` vs `HAVING`', back: '`WHERE` filters rows before grouping; `HAVING` filters groups after aggregation' },
  { front: 'Count orders per customer', back: q('SELECT customer_id, COUNT(*)', 'FROM orders', 'GROUP BY customer_id;') },
  {
    front: 'Customers with more than 5 orders',
    back: q('SELECT customer_id', 'FROM orders', 'GROUP BY customer_id', 'HAVING COUNT(*) > 5;'),
  },
  { front: 'Default direction of `ORDER BY`', back: 'Ascending (`ASC`)' },
  {
    front: 'Paginate with `LIMIT` and `OFFSET`',
    back: q('SELECT * FROM posts', 'ORDER BY id', 'LIMIT 20 OFFSET 40;'),
    extra: 'Large offsets get slow; keyset pagination (`WHERE id > last_id`) scales better.',
  },
  {
    front: '`COUNT(*)` vs `COUNT(column)`',
    back: '`COUNT(*)` counts rows; `COUNT(column)` counts non-NULL values in that column',
  },
  { front: 'What is `NULL = NULL`?', back: 'NULL (unknown), not true. Test with `IS NULL` / `IS NOT NULL`' },
  {
    front: 'Replace NULL with a default',
    back: q('SELECT COALESCE(nickname, name) FROM users;'),
    extra: '`COALESCE` returns its first non-NULL argument.',
  },
  { front: '`INNER JOIN`', back: 'Only rows that have a match in both tables' },
  { front: '`LEFT JOIN`', back: 'Every row from the left table, with NULLs where the right table has no match' },
  { front: '`FULL OUTER JOIN`', back: 'Every row from both tables, with NULLs wherever one side has no match' },
  { front: '`CROSS JOIN`', back: 'Every combination of rows from both tables (the Cartesian product)' },
  {
    front: 'Self join example',
    back: q('SELECT e.name, m.name AS manager', 'FROM employees e', 'LEFT JOIN employees m ON m.id = e.manager_id;'),
  },
  {
    front: 'Find customers with no orders',
    back: q('SELECT c.*', 'FROM customers c', 'LEFT JOIN orders o ON o.customer_id = c.id', 'WHERE o.id IS NULL;'),
    extra: '`NOT EXISTS` works too.',
  },
  {
    front: 'Pitfall of `NOT IN (subquery)`',
    back: 'If the subquery returns any NULL, `NOT IN` matches no rows; prefer `NOT EXISTS`',
  },
  { front: '`DISTINCT`', back: 'Removes duplicate rows from the result' },
  { front: '`UNION` vs `UNION ALL`', back: '`UNION` removes duplicates; `UNION ALL` keeps every row and is faster' },
  {
    front: 'Wildcards in `LIKE`',
    back: '`%` matches any sequence of characters; `_` matches exactly one',
    extra: q("WHERE email LIKE '%@example.com'"),
  },
  {
    front: 'Conditional values with `CASE`',
    back: q(
      'SELECT name,',
      "  CASE WHEN score >= 90 THEN 'A'",
      "       WHEN score >= 80 THEN 'B'",
      "       ELSE 'C' END AS grade",
      'FROM results;',
    ),
  },
  { front: 'The five standard aggregate functions', back: '`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`' },
  { front: 'Primary key', back: 'A column (or set of columns) that uniquely identifies each row; unique and not NULL' },
  { front: 'Foreign key', back: 'A column that references a key in another table, enforcing referential integrity' },
  { front: '`ON DELETE CASCADE`', back: 'Deleting a parent row also deletes the rows that reference it' },
  {
    front: 'Does a `UNIQUE` column allow several NULLs?',
    back: 'In PostgreSQL and most databases, yes: NULLs aren’t equal to each other',
    extra: 'SQL Server allows only one NULL in a unique index.',
  },
  { front: 'What does an index trade off?', back: 'Faster reads and lookups for slower writes and extra storage' },
  {
    front: 'Column order in a composite index on (a, b)',
    back: 'It helps queries filtering on `a`, or `a` and `b`, but not `b` alone (leftmost prefix rule)',
  },
  {
    front: '`EXPLAIN` vs `EXPLAIN ANALYZE`',
    back: '`EXPLAIN` shows the planned execution; `EXPLAIN ANALYZE` runs the query and shows real timings',
  },
  { front: 'Normalization', back: 'Structuring tables to reduce redundancy and update anomalies (1NF, 2NF, 3NF, …)' },
  { front: 'First normal form (1NF)', back: 'Every column holds atomic values; no repeating groups' },
  {
    front: 'Run statements as one transaction',
    back: q(
      'BEGIN;',
      'UPDATE accounts SET balance = balance - 100 WHERE id = 1;',
      'UPDATE accounts SET balance = balance + 100 WHERE id = 2;',
      'COMMIT;',
    ),
  },
  { front: 'ACID', back: 'Atomicity, Consistency, Isolation, Durability' },
  { front: 'The four standard isolation levels', back: 'Read uncommitted, Read committed, Repeatable read, Serializable' },
  { front: 'Dirty read', back: 'Reading another transaction’s changes before it commits' },
  {
    front: 'Number rows per group with a window function',
    back: q('SELECT *, ROW_NUMBER() OVER (', '  PARTITION BY user_id ORDER BY created_at', ') AS n', 'FROM reviews;'),
  },
  { front: '`RANK` vs `DENSE_RANK`', back: '`RANK` leaves gaps after ties (1, 1, 3); `DENSE_RANK` doesn’t (1, 1, 2)' },
  { front: 'Running total', back: q('SELECT day, SUM(amount) OVER (ORDER BY day) AS running_total', 'FROM sales;') },
  { front: '`LAG` and `LEAD`', back: 'Window functions that read a value from the previous or next row' },
  {
    front: 'Common table expression (CTE)',
    back: q(
      'WITH recent AS (',
      "  SELECT * FROM orders WHERE created_at > now() - interval '7 days'",
      ')',
      'SELECT COUNT(*) FROM recent;',
    ),
  },
  { front: 'What is `WITH RECURSIVE` for?', back: 'Querying hierarchies and graphs, like a category tree or an org chart' },
  {
    front: 'Upsert in PostgreSQL',
    back: q("INSERT INTO tags (name) VALUES ('sql')", 'ON CONFLICT (name) DO NOTHING;'),
    extra: 'Use `DO UPDATE SET …` to update the existing row instead.',
  },
  {
    front: '`DELETE` vs `TRUNCATE`',
    back: '`DELETE` removes chosen rows one by one; `TRUNCATE` empties the whole table at once and is much faster',
  },
  { front: 'Add a column to a table', back: q('ALTER TABLE users ADD COLUMN bio text;') },
  { front: 'How do you prevent SQL injection?', back: 'Use parameterized queries; never concatenate user input into SQL' },
  {
    front: 'View vs materialized view',
    back: 'A view runs its query each time; a materialized view stores the result until refreshed',
  },
  {
    front: 'Logical order a `SELECT` is evaluated in',
    back: '`FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`',
  },
  { front: 'Correlated subquery', back: 'A subquery that refers to the outer query, so it is evaluated for each outer row' },
  {
    front: '`CHAR(n)` vs `VARCHAR(n)`',
    back: '`CHAR` is fixed-length and padded; `VARCHAR` stores variable-length strings up to n',
  },
  {
    front: 'Why can’t you use a `SELECT` alias in `WHERE`?',
    back: '`WHERE` is evaluated before `SELECT`, so the alias doesn’t exist yet',
  },
  {
    front: 'Second-highest salary',
    back: q('SELECT DISTINCT salary', 'FROM employees', 'ORDER BY salary DESC', 'LIMIT 1 OFFSET 1;'),
  },
]

export const SQL: PublicDeck = {
  slug: 'sql-essentials',
  title: 'SQL essentials: 50 queries and concepts',
  shortTitle: 'SQL',
  category: 'databases',
  level: 'intermediate',
  icon: 'code',
  description:
    'Learn SQL that holds up in production: joins, grouping, NULL semantics, indexes, transactions, window functions and CTEs.',
  intro:
    'From the difference between WHERE and HAVING to window functions and recursive CTEs, these cards cover what working developers and data analysts reach for every week. Examples use standard SQL with PostgreSQL where dialects differ.',
  faq: [
    {
      q: 'Which database does this deck use?',
      a: 'Standard SQL, with PostgreSQL syntax where dialects differ (like ON CONFLICT for upserts).',
    },
    {
      q: 'Is it useful for data analysis interviews?',
      a: 'Yes. Joins, grouping, NULL handling and window functions make up most SQL interview questions.',
    },
    {
      q: 'Why does NOT IN sometimes return nothing?',
      a: 'If the subquery yields a NULL, every comparison becomes unknown, so no rows match. NOT EXISTS avoids this.',
    },
  ],
  cards: CARDS,
}
