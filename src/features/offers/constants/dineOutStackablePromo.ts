import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

/**
 * Bolt DineOut payment benefit (first two in-app bill payments), same as the
 * Restaurant detail “I'm at the venue” footer promo. Shown when the user selects
 * “Pay via Bolt Food app” in the claim flow and on the claimed-offer payment row.
 */
export function formatDineOutStackablePaymentPromoText(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Get ${formatDiscountPercent(percent)}% back in Bolt Balance on your first 2 DineOut payments`
}

/** @deprecated Prefer {@link formatDineOutStackablePaymentPromoText}. */
export const DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT =
  formatDineOutStackablePaymentPromoText() as string

/** Figma `_Cashback Banner (DineOut)` `16381:27984` — secondary line. */
export const DINEOUT_CASHBACK_BANNER_SECONDARY =
  "Your reward is added after payment" as const

/** Figma `_Cashback Banner (DineOut)` `16381:27984` — headline with cashback %. */
export function formatDineOutClaimCashbackBannerHeadline(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Pay in the app and earn ${formatDiscountPercent(percent)}% back`
}

/** @deprecated Use {@link formatDineOutClaimCashbackBannerHeadline}. */
export const DINEOUT_CASHBACK_BANNER_PRIMARY = "Eligible for cashback" as const

/** @deprecated Use {@link DINEOUT_CASHBACK_BANNER_PRIMARY}. */
export const DINEOUT_CLAIM_INLINE_PRIMARY = DINEOUT_CASHBACK_BANNER_PRIMARY

/** @deprecated Use {@link DINEOUT_CASHBACK_BANNER_SECONDARY}. */
export function formatDineOutClaimCashbackBannerSecondary(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Pay with Bolt DineOut at the venue and get ${formatDiscountPercent(percent)}% back in Bolt Balance`
}
