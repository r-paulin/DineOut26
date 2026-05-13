import type { OfferCardModel } from "@/features/offers/offers.types"
import type { SearchResultRigaRow } from "@/features/search/data/searchResultsRiga"

function pickGalleryImages(offer: OfferCardModel): [string, string, string] {
  const g = offer.galleryImages
  if (g && g.length >= 3) return [g[0]!, g[1]!, g[2]!]
  if (g && g.length === 2) return [g[0]!, g[1]!, offer.image]
  if (g && g.length === 1) return [g[0]!, offer.image, offer.image]
  return [offer.image, offer.image, offer.image]
}

/**
 * Maps a discover `OfferCardModel` into the static search result row shape
 * (photo grid + meta) for reuse on the section “All” screen.
 */
export function offerToSearchResultRow(offer: OfferCardModel): SearchResultRigaRow {
  const [primaryImage, sideTop, sideBottom] = pickGalleryImages(offer)

  return {
    id: offer.id,
    restaurantSlug: offer.restaurantSlug ?? offer.id,
    name: offer.name,
    primaryImage,
    sideTop,
    sideBottom,
    displayPrice: offer.priceRange,
    area: offer.area,
    cuisine: offer.cuisine,
    tagDescription: offer.tagDescription,
    rating: offer.rating,
    reviewSuffix: offer.reviewCount ?? "",
    primaryGrad: true,
  }
}
