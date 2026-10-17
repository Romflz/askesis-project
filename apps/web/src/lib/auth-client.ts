import { usernameClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

// Talks to /api/auth on this origin (proxied to the API by routes/api/auth/$.ts).
export const authClient = createAuthClient({ plugins: [usernameClient()] })
