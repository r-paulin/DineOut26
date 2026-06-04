/** Product copy — discount scope (banners, claim modal, offer rows). */
export const OFFER_DISCOUNT_ON_MENU = "on menu" as const

function formatDiscountOnMenu(discountPercent: number): string {
  return `${discountPercent}% discount ${OFFER_DISCOUNT_ON_MENU}`
}

/** Headline for banners and claim UI (no "Claim" prefix). */
export function formatOfferDiscountTitle(
  discountPercent: number,
  _isAllDay: boolean,
): string {
  return formatDiscountOnMenu(discountPercent)
}

/** Card / modal title on restaurant offer rows. */
export function formatOfferClaimCardTitle(
  discountPercent: number,
  isAllDay: boolean,
): string {
  if (isAllDay && discountPercent === 10) {
    return formatOfferDiscountTitle(10, true)
  }
  return `Claim ${formatDiscountOnMenu(discountPercent)}`
}
