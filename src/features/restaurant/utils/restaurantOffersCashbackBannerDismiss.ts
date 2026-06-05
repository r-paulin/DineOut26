const STORAGE_KEY_PREFIX = "dineout:offers-cashback-banner-dismissed:"

function storageKey(venueSlug: string): string {
  return `${STORAGE_KEY_PREFIX}${venueSlug}`
}

/** Whether the user dismissed the Offers-section cashback banner for this venue. */
export function isRestaurantOffersCashbackBannerDismissed(
  venueSlug: string,
): boolean {
  if (typeof localStorage === "undefined") return false
  try {
    return localStorage.getItem(storageKey(venueSlug)) === "1"
  } catch {
    return false
  }
}

export function dismissRestaurantOffersCashbackBanner(venueSlug: string): void {
  if (typeof localStorage === "undefined") return
  try {
    localStorage.setItem(storageKey(venueSlug), "1")
  } catch {
    /* quota / private mode */
  }
}
