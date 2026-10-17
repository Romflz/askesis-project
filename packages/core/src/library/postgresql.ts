import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const q = (...lines: string[]) => code('sql', ...lines)

const CARDS: CardContent[] = [
  {
    front: '`text` vs `varchar(n)` in PostgreSQL',
    back: 'Same storage and speed; `varchar(n)` only adds a length check. Use `text` unless you want that limit',
    extra: '`char(n)` pads values with spaces and is rarely what you want.',
  },
  {
    front: '`timestamp` vs `timestamptz`',
    back: '`timestamptz` stores an absolute instant (in UTC) and displays it in the session’s time zone; `timestamp` is a wall-clock value with no zone. Prefer `timestamptz`',
  },
  {
    front: '`numeric` vs `double precision`',
    back: '`numeric` does exact decimal arithmetic, right for money; `double precision` is fast binary floating point, where `0.1 + 0.2` isn’t exactly `0.3`',
  },
  {
    front: 'Declare an auto-incrementing primary key the modern way',
    back: q(
      'CREATE TABLE users (',
      '  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,',
      '  email text NOT NULL UNIQUE',
      ');',
    ),
    extra:
      'SQL-standard identity columns are preferred over `serial`. Sequence values are never rolled back, so gaps in IDs are normal.',
  },
  {
    front: 'Generate UUIDs in PostgreSQL',
    back: '`gen_random_uuid()` makes random v4 UUIDs (built in since PostgreSQL 13); `uuidv7()` (PostgreSQL 18) makes time-ordered ones that are friendlier to B-tree indexes',
  },
  {
    front: 'What does `SELECT 5 / 2;` return?',
    back: '`2`: dividing two integers truncates. Write `5 / 2.0` or `5::numeric / 2` to get 2.5',
  },
  {
    front: `What does this create?\n${q('CREATE TABLE Users (userId int);')}`,
    back: 'A table `users` with a column `userid`: unquoted names are folded to lowercase. Quoted `"userId"` keeps its case but must then always be quoted, so use snake_case',
  },
  {
    front: 'What does `now()` return inside a long transaction?',
    back: 'The transaction’s start time, the same for every call in that transaction; `clock_timestamp()` returns the actual current time',
  },
  {
    front: 'What is the default index type good for?',
    back: "B-tree indexes handle equality and ranges (`=`, `<`, `BETWEEN`), `ORDER BY`, `IS NULL` and prefix searches like `LIKE 'abc%'`",
    extra: 'Prefix `LIKE` needs the C collation or an index built with `text_pattern_ops`.',
  },
  {
    front: 'When do you use a GIN index?',
    back: 'For values that contain many elements: `jsonb` documents, arrays, full-text search `tsvector`s and trigram search with `pg_trgm`',
  },
  {
    front: 'What is a BRIN index for?',
    back: 'Huge tables whose values follow the physical row order, like append-only timestamps; it stores only min and max per block range, so it is tiny',
  },
  {
    front: 'Does PostgreSQL index foreign key columns automatically?',
    back: 'No. Primary keys and unique constraints get indexes, but the referencing column doesn’t; index it to speed up joins and deletes on the parent table',
  },
  {
    front: 'What is a partial index?',
    back: 'An index over only the rows matching a `WHERE` clause: smaller and faster, used when a query’s filter implies that condition',
    extra: q("CREATE INDEX ON orders (created_at) WHERE status = 'pending';"),
  },
  {
    front: 'Why doesn’t `WHERE lower(email) = $1` use the index on `email`?',
    back: 'The index stores `email`, not `lower(email)`. Create an expression index: `CREATE INDEX ON users (lower(email));`',
  },
  {
    front: 'What does `CREATE INDEX CONCURRENTLY` do?',
    back: 'Builds the index without blocking writes to the table; it is slower, can’t run inside a transaction block, and a failed build leaves an invalid index to drop',
  },
  {
    front: 'What does `INCLUDE` add to an index?',
    back: 'Extra columns stored in the index but not searched on, so queries that read only those columns can use an index-only scan',
    extra: q('CREATE INDEX ON orders (customer_id) INCLUDE (total);'),
  },
  {
    front: "Why can’t `WHERE name LIKE '%son'` use a B-tree index?",
    back: 'A B-tree is sorted from the first character, so a leading wildcard can’t narrow the search. Use a trigram GIN index (`pg_trgm`) or full-text search',
  },
  {
    front: 'Seq Scan, Index Scan, Index Only Scan, Bitmap Heap Scan',
    back: 'Reads the whole table; follows the index to each row; answers from the index alone; collects matches from an index, then reads those table pages in order',
  },
  {
    front: `What do these numbers mean in \`EXPLAIN\` output?\n${q('Index Scan using users_pkey on users  (cost=0.29..8.31 rows=1 width=72)')}`,
    back: 'Planner estimates: startup cost..total cost in arbitrary units, expected rows returned, and average row width in bytes',
  },
  {
    front: 'Why wrap `EXPLAIN ANALYZE` of a `DELETE` in a transaction?',
    back: '`EXPLAIN ANALYZE` actually runs the statement. Use `BEGIN; EXPLAIN ANALYZE …; ROLLBACK;` to measure it without keeping the changes',
  },
  {
    front: 'The planner expected 10 rows but got 500,000. What should you check first?',
    back: 'Stale statistics: run `ANALYZE table_name;` so the planner has fresh row counts and value distributions',
    extra: 'Autovacuum normally runs `ANALYZE` for you.',
  },
  {
    front: 'Is a Seq Scan in a plan always bad?',
    back: 'No. For small tables, or queries that return a large share of the rows, reading the table sequentially is cheaper than many random index lookups',
  },
  {
    front: 'What is PostgreSQL’s default isolation level?',
    back: 'Read Committed: each statement sees the data committed before that statement began',
    extra: 'Read Uncommitted behaves the same in PostgreSQL: dirty reads never happen.',
  },
  {
    front: 'What does Repeatable Read guarantee in PostgreSQL?',
    back: 'The whole transaction sees one snapshot taken at its first query, which also prevents phantom reads; updating a row another transaction changed meanwhile fails with a serialization error',
  },
  {
    front: 'What must an app do when using Serializable isolation?',
    back: 'Retry transactions that fail with SQLSTATE `40001`: PostgreSQL aborts one side of any conflict so results match running them one at a time',
  },
  {
    front: 'Two sessions read a balance, subtract in app code and write it back. How do you prevent the lost update?',
    back: 'Update atomically (`SET balance = balance - 10`), lock the row first with `SELECT … FOR UPDATE`, or use Repeatable Read and retry',
  },
  {
    front: `What does this do when several workers run it?\n${q('SELECT id FROM jobs', "WHERE status = 'queued'", 'ORDER BY id', 'LIMIT 1', 'FOR UPDATE SKIP LOCKED;')}`,
    back: 'Each worker locks a different queued job, skipping rows other transactions have locked: a simple job queue',
  },
  {
    front: 'Can you roll back `CREATE TABLE` or `ALTER TABLE` in PostgreSQL?',
    back: 'Yes. DDL is transactional, so a migration can run in one transaction and roll back cleanly; exceptions include `CREATE INDEX CONCURRENTLY` and `CREATE DATABASE`',
  },
  {
    front: 'What is MVCC?',
    back: 'Multi-version concurrency control: an `UPDATE` writes a new row version and leaves the old one as a dead tuple, so each transaction reads a consistent snapshot',
    extra: 'Readers don’t block writers and writers don’t block readers.',
  },
  {
    front: '`VACUUM` vs `VACUUM FULL`',
    back: '`VACUUM` marks dead tuples’ space reusable and runs alongside normal traffic, but rarely shrinks the file; `VACUUM FULL` rewrites the table compactly under an exclusive lock that blocks all access',
  },
  {
    front: 'What does autovacuum do?',
    back: 'Vacuums and analyzes tables in the background as they change, and freezes old rows to prevent transaction ID wraparound; don’t turn it off',
  },
  {
    front: 'Why are long-running or idle-in-transaction sessions harmful?',
    back: 'Their old snapshot stops VACUUM from removing any dead tuples newer than it, so tables and indexes bloat',
  },
  {
    front: '`json` vs `jsonb`',
    back: '`json` stores the input text verbatim; `jsonb` stores a parsed binary form (no whitespace or key order, last duplicate key wins) that is faster to query and can be indexed. Use `jsonb`',
  },
  {
    front: '`->` vs `->>` on JSON',
    back: '`->` returns `jsonb` (to keep navigating); `->>` returns `text`',
    extra: q("SELECT data->'address'->>'city' FROM users;"),
  },
  {
    front: 'Find events whose JSONB payload has `"type": "signup"`, using an index',
    back: q(
      'CREATE INDEX ON events USING gin (payload);',
      '',
      'SELECT * FROM events',
      'WHERE payload @> \'{"type": "signup"}\';',
    ),
    extra: "`@>` means “contains”. The default GIN operator class also supports key-exists checks like `payload ? 'email'`.",
  },
  {
    front: 'Are CTEs an optimization fence in PostgreSQL?',
    back: 'Not since PostgreSQL 12: a non-recursive, side-effect-free CTE referenced once is inlined into the main query. Write `AS MATERIALIZED` to force it to run separately',
  },
  {
    front: 'Move finished tasks to an archive table in one statement',
    back: q(
      'WITH moved AS (',
      '  DELETE FROM tasks WHERE done RETURNING *',
      ')',
      'INSERT INTO tasks_archive SELECT * FROM moved;',
    ),
  },
  {
    front: 'List an employee and everyone below them in the org chart',
    back: q(
      'WITH RECURSIVE team AS (',
      '  SELECT id, name FROM employees WHERE id = 1',
      '  UNION ALL',
      '  SELECT e.id, e.name',
      '  FROM employees e JOIN team t ON e.manager_id = t.id',
      ')',
      'SELECT * FROM team;',
    ),
  },
  {
    front: 'Get the 3 most expensive products per category',
    back: q(
      'SELECT * FROM (',
      '  SELECT *, ROW_NUMBER() OVER (',
      '    PARTITION BY category ORDER BY price DESC',
      '  ) AS rn',
      '  FROM products',
      ') ranked',
      'WHERE rn <= 3;',
    ),
    extra: 'Window functions can’t appear in `WHERE`, hence the subquery.',
  },
  {
    front: 'What does `DISTINCT ON` do?',
    back: 'PostgreSQL-specific: keeps the first row of each group, as decided by `ORDER BY`',
    extra: q('-- latest login per user', 'SELECT DISTINCT ON (user_id) *', 'FROM logins', 'ORDER BY user_id, created_at DESC;'),
  },
  {
    front: `Why do rows with the same \`day\` get the same running total?\n${q('SELECT day, amount,', '  SUM(amount) OVER (ORDER BY day) AS running', 'FROM sales;')}`,
    back: 'With `ORDER BY`, the default frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, which includes every peer with an equal `day`. Use `ROWS BETWEEN …` to go row by row',
  },
  {
    front: 'Does `CHECK (price > 0)` reject a NULL price?',
    back: 'No. A check fails only when the expression is false, and `NULL > 0` is unknown. Add `NOT NULL` as well',
  },
  {
    front: `What does this constraint prevent?\n${q('ALTER TABLE bookings', '  ADD EXCLUDE USING gist (room_id WITH =, during WITH &&);')}`,
    back: 'Two bookings for the same room with overlapping `during` time ranges',
    extra: 'Using `=` on a plain column in a GiST index needs the `btree_gist` extension.',
  },
  {
    front: 'What does `DEFERRABLE INITIALLY DEFERRED` do on a constraint?',
    back: 'Checks it at `COMMIT` instead of after each statement, so rows can be temporarily inconsistent inside the transaction, e.g. for circular foreign keys',
  },
  {
    front: 'Users vs groups in PostgreSQL',
    back: 'Both are roles. `CREATE USER` is `CREATE ROLE` with `LOGIN`, and granting one role to another (`GRANT readers TO alice`) makes it a group',
  },
  {
    front: 'Create a read-only role that also covers future tables',
    back: q(
      'CREATE ROLE readonly;',
      'GRANT USAGE ON SCHEMA public TO readonly;',
      'GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;',
      'ALTER DEFAULT PRIVILEGES IN SCHEMA public',
      '  GRANT SELECT ON TABLES TO readonly;',
    ),
    extra: '`ON ALL TABLES` only covers existing tables; default privileges cover tables the granting role creates later.',
  },
  {
    front: 'What changed about the `public` schema in PostgreSQL 15?',
    back: 'Ordinary users can no longer create objects in it by default; the `CREATE` privilege must be granted explicitly',
  },
  {
    front: 'Restrict rows per user with row-level security',
    back: q(
      'ALTER TABLE documents ENABLE ROW LEVEL SECURITY;',
      '',
      'CREATE POLICY owner_only ON documents',
      "  USING (owner_id = current_setting('app.user_id')::int);",
    ),
    extra: 'Superusers, `BYPASSRLS` roles and, unless you add `FORCE ROW LEVEL SECURITY`, the table owner bypass policies.',
  },
  {
    front: 'Why put PgBouncer in front of PostgreSQL?',
    back: 'Each connection is a separate server process with its own memory, so thousands of connections hurt; a pooler shares a small number of them',
  },
  {
    front: 'Essential `psql` meta-commands',
    back: '`\\l` lists databases, `\\c db` connects, `\\dt` lists tables, `\\d name` describes a table, `\\x` toggles expanded output, `\\q` quits',
  },
]

export const POSTGRESQL: PublicDeck = {
  slug: 'postgresql-essentials',
  title: 'PostgreSQL essentials: 50 cards on indexes, MVCC and JSONB',
  shortTitle: 'PostgreSQL',
  category: 'databases',
  level: 'intermediate',
  icon: 'code',
  description:
    'PostgreSQL know-how: data types, B-tree and GIN indexes, EXPLAIN, isolation levels, MVCC and VACUUM, JSONB, CTEs, window functions, constraints and roles.',
  intro:
    'PostgreSQL rewards knowing how it works underneath. These cards go beyond standard SQL to what is specific to Postgres: picking the right data types, when B-tree, GIN or BRIN indexes help, reading EXPLAIN plans, what each isolation level really guarantees, why MVCC needs VACUUM, querying and indexing JSONB, and locking down access with roles and row-level security.',
  faq: [
    {
      q: 'Which PostgreSQL version does this deck cover?',
      a: 'Current releases (PostgreSQL 15 to 18). Version notes call out newer features such as uuidv7 in 18 and the public schema permission change in 15.',
    },
    {
      q: 'Should I learn SQL first?',
      a: 'It helps. This deck assumes you can write SELECT, JOIN and GROUP BY queries; our SQL essentials deck covers those basics.',
    },
    {
      q: 'What is the difference between json and jsonb?',
      a: 'json keeps the original text exactly; jsonb stores a parsed binary form that drops whitespace and duplicate keys, is faster to query and supports GIN indexes. Use jsonb unless you must preserve the input as written.',
    },
  ],
  cards: CARDS,
}
