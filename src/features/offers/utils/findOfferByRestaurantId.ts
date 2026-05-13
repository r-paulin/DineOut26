import type { OfferCardModel } from "@/features/offers/offers.types"

export function restaurantKey(o: OfferCardModel): string {
  return o.restaurantSlug ?? o.id
}

function offerRichness(o: OfferCardModel): number {
  let n = 0
  if (o.reviewCount) n += 4
  if (o.layout === "list") n += 2
  if (o.galleryImages && o.galleryImages.length > 0) n += 1
  return n
}

/**
 * Best offer matching map marker / focus id (`restaurantSlug` or `id`).
 * When the same venue appears in carousel and XL list, prefers the richer
 * card (reviews, list layout) so map-opened UI matches Figma detail density.
 */
export function findOfferByRestaurantId(
  offers: OfferCardModel[],
  id: string | null,
): OfferCardModel | null {
  if (!id) return null
  let best: OfferCardModel | null = null
  let bestScore = -1
  for (const o of offers) {
    if (restaurantKey(o) !== id) continue
    const score = offerRichness(o)
    if (score > bestScore) {
      best = o
      bestScore = score
    }
  }
  return best
}
