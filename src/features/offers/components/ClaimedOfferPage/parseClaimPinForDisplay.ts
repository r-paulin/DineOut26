/** Maximum digits rendered in the PIN slot row (Figma `16123:18340`). */
export const CLAIM_PIN_MAX_DIGITS = 8

export const CLAIM_PIN_UNAVAILABLE_MESSAGE =
  "PIN unavailable. Try closing and reopening this screen."

export type ClaimPinParseResult =
  | { ok: true; digits: string[] }
  | { ok: false; message: string }

/**
 * Validates PIN for display — never silently strips or truncates in production.
 */
export function parseClaimPinForDisplay(
  pin: string,
  maxDigits = CLAIM_PIN_MAX_DIGITS,
): ClaimPinParseResult {
  const trimmed = pin.trim()
  if (!trimmed) {
    return { ok: false, message: CLAIM_PIN_UNAVAILABLE_MESSAGE }
  }
  if (!/^\d+$/.test(trimmed)) {
    if (import.meta.env.DEV) {
      console.warn(
        `[ClaimedOfferHeroSection] Expected digit-only PIN, received "${pin}".`,
      )
    }
    return { ok: false, message: CLAIM_PIN_UNAVAILABLE_MESSAGE }
  }
  if (trimmed.length > maxDigits) {
    if (import.meta.env.DEV) {
      console.warn(
        `[ClaimedOfferHeroSection] PIN has ${trimmed.length} digits; max is ${maxDigits}.`,
      )
    }
    return { ok: false, message: CLAIM_PIN_UNAVAILABLE_MESSAGE }
  }
  return { ok: true, digits: trimmed.split("") }
}
