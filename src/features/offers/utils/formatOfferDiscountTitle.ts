/** Headline for banners and claim UI (no "Claim" prefix). */
export function formatOfferDiscountTitle(
  discountPercent: number,
  isAllDay: boolean,
): string {
  if (isAllDay && discountPercent === 10) {
    return "10% discount on Daily menu"
  }
  return `${discountPercent}% discount on menu`
}

/** Card / modal title on restaurant offer rows. */
export function formatOfferClaimCardTitle(
  discountPercent: number,
  isAllDay: boolean,
): string {
  if (isAllDay && discountPercent === 10) {
    return formatOfferDiscountTitle(10, true)
  }
  return `Claim ${discountPercent}% discount on menu`
}
