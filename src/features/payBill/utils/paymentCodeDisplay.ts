import type { ClaimedOffer } from "@/features/offers/offers.types"

/** Display payment code for waiter confirmation (claim PIN or fallback from transaction id). */
export function formatPaymentCodeDisplay(
  offer: ClaimedOffer | null,
  transactionId: string,
): string {
  const raw = offer?.pin?.trim()
  if (raw) return raw.startsWith("#") ? raw : `#${raw}`
  const compact = transactionId.replace(/[^A-Za-z0-9]/g, "")
  const tail = compact.slice(Math.max(0, compact.length - 6))
  return `#${tail.toUpperCase()}`
}
