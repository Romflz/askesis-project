import { sql, type SQL } from 'drizzle-orm'
import { customType, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth.ts'

// Drizzle has no built-in tsvector column type.
const tsvector = customType<{ data: string }>({
  dataType: () => 'tsvector',
})

/** Docs served by the /docs routes, with full-text search and tags. */
export const docs = pgTable(
  'docs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    summary: text('summary').notNull().default(''),
    body: text('body').notNull(),
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    // Docs outlive their author's account.
    authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    // Maintained by Postgres; matches in the title rank above the summary, and the summary above the body.
    search: tsvector('search').generatedAlwaysAs(
      (): SQL =>
        sql`setweight(to_tsvector('english', coalesce(${docs.title}, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(${docs.summary}, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(${docs.body}, '')), 'C')`,
    ),
  },
  (t) => [
    index('docs_search_idx').using('gin', t.search),
    index('docs_tags_idx').using('gin', t.tags),
    index('docs_updated_at_idx').on(t.updatedAt),
  ],
)
