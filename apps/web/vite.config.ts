import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite'

const envDir = new URL('../..', import.meta.url).pathname

export default defineConfig(({ mode }) => {
  // Make the workspace .env visible to server code (process.env) in dev.
  // Only VITE_-prefixed values are ever exposed to the client bundle.
  process.env = { ...loadEnv(mode, envDir, ''), ...process.env }

  return {
    envDir,
    server: { port: 3000 },
    // Pre-bundle client deps reached through workspace packages (@askesis/core),
    // so dev doesn't discover them late and serve stale optimized chunks.
    optimizeDeps: {
      include: [
        'ts-fsrs',
        'recharts',
        'motion/react',
        'canvas-confetti',
        'lucide-react',
        'clsx',
        '@floating-ui/react',
        'katex',
        'highlight.js/lib/core',
      ],
    },
    environments: {
      client: {
        build: {
          rolldownOptions: {
            output: {
              // Fewer, larger files for the first load: what every page needs at
              // startup ships as one chunk instead of dozens of tiny ones (each a
              // request), and the icons used by lazily loaded pages share one file.
              // Page code still splits per route.
              codeSplitting: {
                groups: [
                  { name: 'app', tags: ['$initial'] },
                  { name: 'icons', test: /[\\/]lucide-react[\\/]/ },
                ],
              },
            },
          },
        },
      },
    },
    // The deployment target is chosen by NITRO_PRESET (node-server by default,
    // or bun, vercel, netlify, ...). Routes and server functions stay the same.
    plugins: [
      tanstackStart(),
      nitro({
        // Static files get .br/.gz siblings at build time; the server sends the
        // smallest one the browser accepts (fingerprinted /assets are cached for a year).
        compressPublicAssets: { gzip: true, brotli: true },
      }),
      viteReact(),
    ],
  }
})
