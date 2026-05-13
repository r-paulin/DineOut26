import type { OfferCardCampaign, OfferCardModel, RestaurantCardView } from "../offers.types"

/** True when the map-opened / pin UI should show campaign pills (has a primary line). */
export function hasCampaignBadges(c: OfferCardCampaign): boolean {
  return Boolean(c.discountLabel || c.timeWindow)
}

function cuisineTagsFromOffer(offer: OfferCardModel): string[] {
  const raw = offer.cuisine.trim()
  if (!raw) return []
  return raw.split(/\s*·\s*/).map((s) => s.trim()).filter(Boolean)
}

function reviewCountDisplay(offer: OfferCardModel): string {
  const r = offer.reviewCount?.trim()
  if (!r) return ""
  return r.replace(/^\(|\)$/g, "")
}

/**
 * Spec-shaped view model for `_Place / Card / On Map - Opened` (documentation +
 * tests). {@link MapPlaceCardOpened} still accepts {@link OfferCardModel} at the boundary.
 */
export function mapOfferToRestaurantCardView(offer: OfferCardModel): RestaurantCardView {
  const c = offer.campaign
  const primary = hasCampaignBadges(c)
    ? {
        discount: c.discountLabel ?? "",
        time: c.timeWindow ?? "",
      }
    : null
  const extra = c.extraOffers ?? 0
  const ratingNum = Number.parseFloat(offer.rating.replace(",", "."))
  return {
    image: offer.image,
    name: offer.name,
    isOpen: offer.isOpen !== false,
    closesAt: offer.closesAt,
    cuisineTags: cuisineTagsFromOffer(offer),
    priceRange: offer.priceRange,
    rating: Number.isFinite(ratingNum) ? ratingNum : 0,
    reviewCount: reviewCountDisplay(offer),
    primaryOffer: primary,
    extraOffersCount: extra,
  }
}
