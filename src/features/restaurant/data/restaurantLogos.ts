import type { RestaurantSlug } from "@/features/offers/data/restaurantOffers.types"
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
  switch (slug) {
    case "neiburgs":
      return unique([u("Neiburgs-logo.png"), u("neiburgs-logo.png")])
    case "melna-bite":
      return unique([
        u("Melna Bite logo.png"),
        u("Melna-Bite-logo.png"),
        u("melna-bite-logo.png"),
      ])
    case "three-chefs":
      return unique([u("3pavarurestorans-logo.png"), u("three-chefs-logo.png")])
    case "kolonade":
      return unique([u("Kolonade-logo.png"), u("kolonade-logo.png")])
    case "max-cekot":
      return unique([u("max-cekot-logo.png"), u("Max-cekot-logo.png")])
    case "rozengrals":
      return unique([u("Rozengrals-logo.png"), u("rozengrals-logo.png")])
    default:
      return unique([u(`${slug}-logo.png`)])
  }
}

/** First candidate URL (e.g. for links); prefer `getRestaurantLogoCandidates` in UI. */
export function restaurantLogoUrl(slug: RestaurantSlug | string): string {
  const list = getRestaurantLogoCandidates(slug as RestaurantSlug)
  return list[0] ?? u(`${slug}-logo.png`)
}
