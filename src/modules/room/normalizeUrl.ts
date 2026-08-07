/** Normalizes free-typed input into a navigable http(s) URL, or null if it isn't one. */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Only add https:// when there is no scheme at all. An input that already
  // names a non-http(s) scheme (ftp:, mailto:, javascript:...) must be
  // rejected outright, not blindly prefixed - prepending https:// to
  // "ftp://example.com" does not error, it silently produces a nonsense
  // https URL instead of the rejection that input deserves.
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  if (hasScheme && !/^https?:\/\//i.test(trimmed)) return null

  const withProtocol = hasScheme ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}
