import { getMergedRestaurantCatalogEntry } from "@/features/restaurants/restaurantCatalogRuntime"
import { restaurantImageUrl } from "@/shared/utils/publicImageUrls"
import type { OfferCardModel } from "@/features/offers/offers.types"

/**
 * Ensures XL list cards have a multi-photo gallery (primary + side slots).
 * Discover carousel rows only ship a single `image` — expand from catalog.
 */
export function ensureOfferCardListGallery(
  offer: OfferCardModel,
): OfferCardModel {
  const existing = offer.galleryImages?.filter(Boolean) ?? []
  if (existing.length >= 2) {
    return { ...offer, layout: "list" }
  }

  const slug = offer.restaurantSlug ?? offer.id
  const entry = getMergedRestaurantCatalogEntry(slug)
  if (!entry) {
    return {
      ...offer,
      layout: "list",
      galleryImages: existing.length > 0 ? existing : [offer.image],
    }
  }

  const galleryImages = [
    restaurantImageUrl(entry.images.primary),
    restaurantImageUrl(entry.images.sideTop),
    restaurantImageUrl(entry.images.sideBottom),
  ].filter(Boolean)

  return {
    ...offer,
    layout: "list",
    image: galleryImages[0] ?? offer.image,
    galleryImages,
  }
}
