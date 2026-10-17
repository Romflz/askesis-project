#!/usr/bin/env node
// Writes sitemap.xml to a file, from the same list the live /sitemap.xml route
// serves (src/lib/sitemap.ts). Useful for static hosting, CDNs or submitting the
// file to search consoles.
//
//   pnpm --filter @askesis/web sitemap                          → .output/public/sitemap.xml
//   pnpm --filter @askesis/web sitemap -- --out sitemap.xml --site https://askesis.example
//
// --site overrides VITE_SITE_URL from the repository's .env for the absolute URLs.

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { createServer } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { values } = parseArgs({
  options: {
    out: { type: 'string', default: '.output/public/sitemap.xml' },
    site: { type: 'string' },
  },
})
if (values.site) process.env.VITE_SITE_URL = values.site

// Vite loads the TypeScript/TSX sources (the docs list lives in a .tsx file);
// no dev server is started.
const vite = await createServer({
  root,
  configFile: false,
  envDir: resolve(root, '../..'),
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false },
  esbuild: { jsx: 'automatic' },
})
try {
  const { sitemapEntries, sitemapXml } = await vite.ssrLoadModule('/src/lib/sitemap.ts')
  const entries = sitemapEntries()
  const out = resolve(root, values.out)
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, sitemapXml(entries))
  console.log(`Wrote ${entries.length} URLs to ${out}`)
} finally {
  await vite.close()
}
