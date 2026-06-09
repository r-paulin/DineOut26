import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

/** Product copy — e.g. "20% off your bill" (banners, claim modal, offer rows). */
export function formatOfferBillDiscountTitle(discountPercent: number): string {
  return `${formatDiscountPercent(discountPercent)}% off your bill`
}

/** Headline for banners and claim UI (no "Claim" prefix). */
export function formatOfferDiscountTitle(
  discountPercent: number,
  _isAllDay: boolean,
): string {
  return formatOfferBillDiscountTitle(discountPercent)
}

/** Card / modal title on restaurant offer rows. */
export function formatOfferClaimCardTitle(
  discountPercent: number,
  isAllDay: boolean,
): string {
  if (isAllDay && discountPercent === 10) {
    return formatOfferDiscountTitle(10, true)
  }
  return `Claim ${formatOfferBillDiscountTitle(discountPercent)}`
}
