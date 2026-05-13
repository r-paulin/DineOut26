import type { OfferCardModel } from "@/features/offers/offers.types"
import { computeOfferCardCampaignForSlug } from "@/features/offers/utils/offerCampaign"
import type { SearchResultRigaRow } from "@/features/search/data/searchResultsRiga"

/**
 * Maps static search rows to sheet `OfferCardModel` rows (XL / list layout).
 */
export function searchResultRigaToOfferCard(row: SearchResultRigaRow): OfferCardModel {
  return {
    id: row.id,
    restaurantSlug: row.restaurantSlug,
    name: row.name,
    priceRange: row.displayPrice,
    area: row.area,
    cuisine: row.cuisine,
    tagDescription: row.tagDescription,
    rating: row.rating,
    image: row.primaryImage,
    galleryImages: [row.primaryImage, row.sideTop, row.sideBottom],
    reviewCount: row.reviewSuffix,
    layout: "list",
    campaign: computeOfferCardCampaignForSlug(row.restaurantSlug),
  }
}
