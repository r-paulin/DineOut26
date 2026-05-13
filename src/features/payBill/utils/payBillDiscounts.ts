import type { ClaimedOffer } from "@/features/offers/offers.types"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"

/**
 * Effective % discounts for pay: claimed offer `d1`, DineOut payment add-on `d2`.
 * `d2` uses {@link DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT} when paying with DineOut and the claim
 * does not pin `discountAddPercent` (including `offer === null`).
 */
export function effectivePayDiscountPercents(offer: ClaimedOffer | null): {
  discountPercent: number
  discountAddPercent: number
} {
  const discountPercent = offer?.discountPercent ?? 0
  const method = offer?.paymentMethod ?? "dineout"
  if (method !== "dineout") {
    return { discountPercent, discountAddPercent: 0 }
  }
  const discountAddPercent =
    offer != null && typeof offer.discountAddPercent === "number" ?
      offer.discountAddPercent
    : DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT
  return { discountPercent, discountAddPercent }
}
