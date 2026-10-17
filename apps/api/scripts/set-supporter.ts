// Sets an account's supporter tier (until Patreon is connected, an admin does it by hand).
//
//   pnpm --filter @askesis/api supporter <email> <0-3>
//
// 0 not a supporter, 1 Backer, 2 Insider, 3 Champion.
import { createDb, eq, schema } from '@askesis/db'

const [email, levelArg] = process.argv.slice(2)
const level = Number(levelArg)
if (!email || ![0, 1, 2, 3].includes(level)) {
  console.error('Usage: pnpm --filter @askesis/api supporter <email> <0-3>')
  process.exit(1)
}

const db = createDb(process.env.DATABASE_URL!)
const rows = await db
  .update(schema.user)
  .set({ supportLevel: level })
  .where(eq(schema.user.email, email))
  .returning({ email: schema.user.email })
console.log(rows.length ? `${email} is now at support level ${level}` : `No account with the email ${email}`)
await db.close()
