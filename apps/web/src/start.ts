import { createStart } from '@tanstack/react-start'
import { guestPageCache } from './server/page-cache.ts'

export const startInstance = createStart(() => ({
  // Full-document SSR unless a route opts into 'data-only' or false.
  defaultSsr: true,
  // Public pages for guests come from memory after the first render.
  requestMiddleware: [guestPageCache],
}))
