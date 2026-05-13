/** Strip spaces/punctuation for `tel:` (RFC 3966-style dial string). */
export function toTelHref(displayPhone: string): string | undefined {
  const trimmed = displayPhone.trim()
  if (!trimmed) return undefined
  const dial = trimmed.replace(/[\s().-]/g, "")
  if (!dial) return undefined
  return `tel:${dial}`
}
