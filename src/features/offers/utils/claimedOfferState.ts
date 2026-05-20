import type { ClaimedOffer } from "@/features/offers/offers.types"

/** Removes one claim from the home/restaurant lookup map (cancel flow). */
export function removeClaimedOfferById(
  prev: Record<string, ClaimedOffer>,
  offerId: string,
): Record<string, ClaimedOffer> {
  if (!(offerId in prev)) return prev
  const next = { ...prev }
  delete next[offerId]
  return next
}
