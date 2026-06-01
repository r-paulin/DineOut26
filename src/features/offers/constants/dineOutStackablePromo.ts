import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

/**
 * Bolt DineOut payment benefit (first two in-app bill payments), same as the
 * Restaurant detail “I'm at the venue” footer promo. Shown when the user selects
 * “Pay with Bolt DineOut” in the claim flow and on the claimed-offer payment row.
 */
export const DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT =
  "Enjoy 20% off your first 2 payments with DineOut" as const

/** Inline DineOut cashback banner — primary line (Figma `_Cashback` `16388:31188`). */
export const DINEOUT_CASHBACK_BANNER_PRIMARY = "Eligible for cashback" as const

/** @deprecated Use {@link DINEOUT_CASHBACK_BANNER_PRIMARY}. */
export const DINEOUT_CLAIM_INLINE_PRIMARY = DINEOUT_CASHBACK_BANNER_PRIMARY

/** Claim modal inline notification — secondary line (cashback in Bolt Balance). */
export function formatDineOutClaimCashbackBannerSecondary(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Pay with Bolt DineOut at the venue and get ${formatDiscountPercent(percent)}% back in Bolt Balance`
}
