import { usernameSchema } from '@askesis/contracts'
import { schema } from '@askesis/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'
import { db } from './db.ts'
import { env } from './env.ts'

export const auth = betterAuth({
  baseURL: env.WEB_ORIGIN,
  basePath: '/api/auth',
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.WEB_ORIGIN],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      // Patreon tier (0–3). `input: false`: set by an admin (pnpm --filter
      // @askesis/api supporter), never through sign-up or profile updates.
      supportLevel: { type: 'number', defaultValue: 0, input: false },
    },
  },
  plugins: [
    // Unique public handles for future profiles and sharing. Lowercased for
    // uniqueness; the casing a user picked is kept as displayUsername.
    username({
      minUsernameLength: 3,
      maxUsernameLength: 24,
      usernameValidator: (value) => usernameSchema.safeParse(value).success,
    }),
  ],
})

export type Session = typeof auth.$Infer.Session
