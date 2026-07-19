import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

/**
 * Bolt DineOut payment benefit (first two in-app bill payments). Shown when the
 * user selects “Pay via Bolt Food app” in the claim flow and on the claimed-offer
 * payment row.
 */
export function formatDineOutStackablePaymentPromoText(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Get ${formatDiscountPercent(percent)}% back in Bolt Balance on your first 2 DineOut payments`
}

/** @deprecated Prefer {@link formatDineOutStackablePaymentPromoText}. */
export const DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT =
  formatDineOutStackablePaymentPromoText() as string

/** @deprecated Figma `17421:31531` — payment banner is single-line only. */
export const DINEOUT_CASHBACK_BANNER_SECONDARY =
  "Your reward is added after payment" as const

/** Figma `16123:18027` — restaurant Offers section cashback banner secondary. */
export const RESTAURANT_OFFERS_CASHBACK_BANNER_SECONDARY =
  "Pay via DineOut and earn Bolt Balance to use elsewhere on Bolt Food" as const

/** Figma `16123:20904` — subtext under the Offers section title. */
/** Figma `_Cashback Banner (DineOut)` `17421:31531` — headline accent (semibold). */
export function formatDineOutClaimCashbackBannerAccent(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Get ${formatDiscountPercent(percent)}% cashback `
}

/** Figma `_Cashback Banner (DineOut)` `17421:31531` — headline regular segment. */
export const DINEOUT_CASHBACK_BANNER_HEADLINE_SUFFIX =
  "on your total bill when you pay in the app (up to 100€)" as const

/** Full headline (inline claim-modal detail and aria). */
export function formatDineOutClaimCashbackBannerHeadline(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `${formatDineOutClaimCashbackBannerAccent(percent)}${DINEOUT_CASHBACK_BANNER_HEADLINE_SUFFIX}`
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
