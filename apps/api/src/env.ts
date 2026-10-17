import { z } from 'zod'

/** An optional secret or id. Empty values count as unset, so `KEY=` in .env turns a feature off. */
const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined)

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_HOST: z.string().default('127.0.0.1'),
  API_PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().url().default('postgres://askesis:askesis@localhost:5432/askesis'),
  // Public origin of the web app. Auth cookies are issued for it, because the
  // browser reaches Better Auth through the web app's /api/auth proxy.
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  BETTER_AUTH_SECRET: z.string().min(32),
  // Web Push (daily reminders). Generate a pair with `pnpm --filter @askesis/api vapid`.
  // Reminders are off until both keys are set.
  VAPID_PUBLIC_KEY: optionalString,
  VAPID_PRIVATE_KEY: optionalString,
  VAPID_SUBJECT: z.string().trim().default('mailto:hello@askesis.local'),
})

export const env = schema.parse(process.env)
