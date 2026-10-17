// Small parsers for URL search params (route validateSearch). Plain functions
// rather than zod schemas: validateSearch runs in the router itself, which
// every page loads, and zod would add ~85 kB to all of them. Bad values become
// undefined, so callers fall back to defaults instead of erroring.

export function str(value: unknown, max = Infinity): string | undefined {
  return typeof value === 'string' && value.length <= max ? value : undefined
}

export function oneOf<const T extends string>(value: unknown, options: readonly T[]): T | undefined {
  return typeof value === 'string' && (options as readonly string[]).includes(value) ? (value as T) : undefined
}

/** Integers within [min, max]; numeric strings count (the router parses `?n=5` as 5, `?n=05` as "05"). */
export function int(value: unknown, min: number, max: number): number | undefined {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function uuid(value: unknown): string | undefined {
  return typeof value === 'string' && UUID.test(value) ? value : undefined
}
