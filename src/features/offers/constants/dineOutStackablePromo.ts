import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

/**
 * Bolt DineOut payment benefit (first two in-app bill payments), same as the
 * Restaurant detail “I'm at the venue” footer promo. Shown when the user selects
 * “Pay with Bolt DineOut” in the claim flow and on the claimed-offer payment row.
 */
export const DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT =
  "Enjoy 20% off your first 2 payments with DineOut" as const

/** Claim modal inline notification — primary line (Figma MODAL / Claiming offer). */
export const DINEOUT_CLAIM_INLINE_PRIMARY = "Cashback applied." as const

/** Claim modal inline notification — secondary line (cashback in Bolt Balance). */
export function formatDineOutClaimCashbackBannerSecondary(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Pay with Bolt DineOut at the venue and get ${formatDiscountPercent(percent)}% back in Bolt Balance`
}
