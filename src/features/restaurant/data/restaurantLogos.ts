import type { RestaurantSlug } from "@/features/offers/data/restaurantOffers.types"
import { getMergedRestaurantCatalogEntry } from "@/features/restaurants/restaurantCatalogRuntime"
import { restaurantImageUrl } from "@/shared/utils/publicImageUrls"

function u(filename: string): string {
  return restaurantImageUrl(filename)
}

function unique(urls: string[]): string[] {
  return [...new Set(urls)]
}

/**
 * Ordered public URLs to try for the venue logo (`public/images/restaurants/`).
 * First successful load wins; on `onError`, advance to the next candidate, then
 * `logoFallbackUrl` in the header.
 *
 * Logos are raster PNGs (design exports). Alternate spellings cover case / OS
 * differences and legacy filenames.
 */
export function getRestaurantLogoCandidates(slug: RestaurantSlug): string[] {
  const entry = getMergedRestaurantCatalogEntry(slug)
  if (entry) {
    return unique(entry.logoFilenames.map(u))
  }
  return unique([u(`${slug}-logo.png`)])
}

/** First candidate URL (e.g. for links); prefer `getRestaurantLogoCandidates` in UI. */
export function restaurantLogoUrl(slug: RestaurantSlug | string): string {
  const list = getRestaurantLogoCandidates(slug as RestaurantSlug)
  return list[0] ?? u(`${slug}-logo.png`)
}
