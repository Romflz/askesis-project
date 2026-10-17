// Public links: the top bar, the support section under the dashboards, and the
// Organization structured data. Override with VITE_GITHUB_URL / VITE_PATREON_URL
// in the workspace .env.

const githubUrl = (import.meta.env.VITE_GITHUB_URL as string | undefined) || 'https://github.com/Romflz/askesis-project'

// No trailing slash: callers append paths (`${GITHUB_URL}/issues`).
export const GITHUB_URL = githubUrl.replace(/\/+$/, '')
export const PATREON_URL = (import.meta.env.VITE_PATREON_URL as string | undefined) || 'https://www.patreon.com/c/askesis_project'
