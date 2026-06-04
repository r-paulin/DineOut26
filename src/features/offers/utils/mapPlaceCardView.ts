import type { OfferCardCampaign, OfferCardModel, RestaurantCardView } from "../offers.types"
import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"
import { restaurantTimedOfferActiveNow } from "@/features/discover/utils/filterDiscoverOffers"

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
 *
 * `isOpen` follows timed-offer activity vs the device clock when the merged catalog
 * lists timed offers for the slug (same rule as discover “open now”); otherwise
 * it falls back to {@link OfferCardModel.isOpen}.
 */
export function mapOfferToRestaurantCardView(
  offer: OfferCardModel,
  now: Date = new Date(),
): RestaurantCardView {
  const c = offer.campaign
  const primary = hasCampaignBadges(c)
    ? {
        discount: c.discountLabel ?? "",
        time: c.timeWindow ?? "",
      }
    : null
  const extra = c.extraOffers ?? 0
  const ratingNum = Number.parseFloat(offer.rating.replace(",", "."))
  const slug = offer.restaurantSlug ?? offer.id
  const timed = getRestaurantOffers(slug)
  /** Match discover “open now”: timed-offer windows vs clock when catalog has offers; else card flags. */
  const isOpen =
    timed.length > 0 ?
      restaurantTimedOfferActiveNow(slug, now)
    : offer.isOpen !== false

  return {
    image: offer.image,
    name: offer.name,
    isOpen,
    closesAt: offer.closesAt,
    cuisineTags: cuisineTagsFromOffer(offer),
    priceRange: offer.priceRange,
    rating: Number.isFinite(ratingNum) ? ratingNum : 0,
    reviewCount: reviewCountDisplay(offer),
    primaryOffer: primary,
    extraOffersCount: extra,
  }
}
