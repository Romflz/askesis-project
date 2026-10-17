import { and, eq, inArray, schema } from '@askesis/db'
import { randomInt } from 'node:crypto'
import type { db } from './db.ts'

const { card } = schema

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

// Card identifiers: a card's identity in exported and imported files, unique per
// user. Short enough to read in a spreadsheet; lowercase letters and digits
// without look-alikes (0/o, 1/l/i). The same alphabet and length as the migration
// that gave existing cards theirs.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const LENGTH = 6

function randomIdentifier(): string {
  let out = ''
  for (let i = 0; i < LENGTH; i++) out += ALPHABET[randomInt(ALPHABET.length)]
  return out
}

/**
 * `count` new identifiers that none of the user's cards has, none of `reserved`
 * (identifiers an import is about to use), and no two alike. Short random codes
 * can clash, so clashes are re-rolled.
 */
export async function newIdentifiers(
  tx: Tx | typeof db,
  userId: string,
  count: number,
  reserved: ReadonlySet<string> = new Set(),
): Promise<string[]> {
  const chosen = new Set<string>()
  while (chosen.size < count) {
    const candidates = new Set<string>()
    while (candidates.size < count - chosen.size) {
      const c = randomIdentifier()
      if (!chosen.has(c) && !reserved.has(c)) candidates.add(c)
    }
    const list = [...candidates]
    for (let i = 0; i < list.length; i += 5_000) {
      const taken = await tx
        .select({ identifier: card.identifier })
        .from(card)
        .where(and(eq(card.userId, userId), inArray(card.identifier, list.slice(i, i + 5_000))))
      for (const t of taken) candidates.delete(t.identifier)
    }
    for (const c of candidates) chosen.add(c)
  }
  return [...chosen]
}
