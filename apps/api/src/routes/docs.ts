import {
  createDocInput,
  docListQuery,
  PAGE_SIZE,
  slugParam,
  type Doc,
  type DocListResult,
  type DocSummary,
} from '@askesis/contracts'
import { and, arrayContains, arrayOverlaps, count, desc, eq, ne, schema, sql } from '@askesis/db'
import type { FastifyInstance } from 'fastify'
import { db } from '../db.ts'
import { requireSession } from '../http.ts'

const { docs, user } = schema

// A doc list item. Queries left-join the author, who may have deleted their account.
const summaryColumns = {
  slug: docs.slug,
  title: docs.title,
  summary: docs.summary,
  tags: docs.tags,
  updatedAt: docs.updatedAt,
  authorName: user.name,
}

type SummaryRow = { updatedAt: Date } & Omit<DocSummary, 'updatedAt'>
const toSummary = (row: SummaryRow): DocSummary => ({ ...row, updatedAt: row.updatedAt.toISOString() })

/** A URL slug from a title: runs of lowercase ASCII letters and digits joined by dashes. */
function slugify(title: string) {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return base || 'doc'
}

/** Public docs (search, tag filter, detail, related); signed-in users can list and create their own. */
export async function docRoutes(app: FastifyInstance) {
  app.get('/docs', async (request): Promise<DocListResult> => {
    const { q, tag, page } = docListQuery.parse(request.query)
    // websearch_to_tsquery accepts what people type ("quoted phrases", -exclusions) without syntax errors.
    const query = q ? sql`websearch_to_tsquery('english', ${q})` : undefined
    const where = and(query ? sql`${docs.search} @@ ${query}` : undefined, tag ? arrayContains(docs.tags, [tag]) : undefined)

    const [rows, [totals], tagRows] = await Promise.all([
      db
        .select(summaryColumns)
        .from(docs)
        .leftJoin(user, eq(user.id, docs.authorId))
        .where(where)
        .orderBy(query ? desc(sql`ts_rank(${docs.search}, ${query})`) : desc(docs.updatedAt))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      db.select({ total: count() }).from(docs).where(where),
      db.execute<{ tag: string }>(sql`select distinct unnest(${docs.tags}) as tag from ${docs} order by tag`),
    ])

    const total = totals?.total ?? 0
    return {
      items: rows.map(toSummary),
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      tags: tagRows.map((r) => r.tag),
    }
  })

  app.get('/docs/:slug', async (request, reply) => {
    const { slug } = slugParam.parse(request.params)
    const [row] = await db
      .select({ ...summaryColumns, body: docs.body, createdAt: docs.createdAt })
      .from(docs)
      .leftJoin(user, eq(user.id, docs.authorId))
      .where(eq(docs.slug, slug))
    if (!row) return reply.code(404).send({ error: 'not_found' })
    return { ...toSummary(row), body: row.body, createdAt: row.createdAt.toISOString() } satisfies Doc
  })

  // Docs sharing at least one tag, most overlap first. The web app streams this.
  app.get('/docs/:slug/related', async (request): Promise<DocSummary[]> => {
    const { slug } = slugParam.parse(request.params)
    const [current] = await db.select({ tags: docs.tags }).from(docs).where(eq(docs.slug, slug))
    if (!current || current.tags.length === 0) return []
    const tags = sql`array[${sql.join(
      current.tags.map((t) => sql`${t}`),
      sql`, `,
    )}]::text[]`
    const overlap = sql`cardinality(array(select unnest(${docs.tags}) intersect select unnest(${tags})))`
    const rows = await db
      .select(summaryColumns)
      .from(docs)
      .leftJoin(user, eq(user.id, docs.authorId))
      .where(and(ne(docs.slug, slug), arrayOverlaps(docs.tags, current.tags)))
      .orderBy(desc(overlap), desc(docs.updatedAt))
      .limit(5)
    return rows.map(toSummary)
  })

  app.get('/me/docs', { preHandler: requireSession }, async (request): Promise<DocSummary[]> => {
    const rows = await db
      .select(summaryColumns)
      .from(docs)
      .leftJoin(user, eq(user.id, docs.authorId))
      .where(eq(docs.authorId, request.session!.user.id))
      .orderBy(desc(docs.updatedAt))
    return rows.map(toSummary)
  })

  app.post('/docs', { preHandler: requireSession }, async (request, reply) => {
    const input = createDocInput.parse(request.body)
    const base = slugify(input.title)
    // Try the clean slug first; on collision fall back to a short random suffix.
    for (const slug of [base, `${base}-${crypto.randomUUID().slice(0, 6)}`]) {
      const [created] = await db
        .insert(docs)
        .values({ ...input, tags: [...new Set(input.tags)], slug, authorId: request.session!.user.id })
        .onConflictDoNothing({ target: docs.slug })
        .returning({ slug: docs.slug })
      if (created) return reply.code(201).send(created)
    }
    return reply.code(409).send({ error: 'slug_conflict' })
  })
}
