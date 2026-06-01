import type { ClaimedOffer, PaymentMethod } from "@/features/offers/offers.types"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"

function discountAddPercentForMethod(method: PaymentMethod): number {
  return method === "dineout" ? DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT : 0
}

/** Keeps {@link ClaimedOffer.paymentMethod} and {@link ClaimedOffer.discountAddPercent} in sync. */
export function updateClaimedOfferPaymentMethod(
  claim: ClaimedOffer,
  paymentMethod: PaymentMethod,
): ClaimedOffer {
  if (claim.paymentMethod === paymentMethod) return claim
  return {
    ...claim,
    paymentMethod,
    discountAddPercent: discountAddPercentForMethod(paymentMethod),
  }
}
