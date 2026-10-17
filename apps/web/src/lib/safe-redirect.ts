/**
 * Only same-origin relative paths; anything else is dropped and the page uses its
 * default. "//host" and "/\host" are rejected because browsers read both as
 * another origin.
 */
export function safeRedirect(value: unknown): string | undefined {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
    ? value
    : undefined
}

/** validateSearch for pages that continue somewhere after signing in. */
export function redirectSearch(search: Record<string, unknown>): { redirect?: string } {
  return { redirect: safeRedirect(search.redirect) }
}
