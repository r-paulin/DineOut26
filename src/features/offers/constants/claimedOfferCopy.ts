import { PAYMENT_METHOD_DINEOUT_OPTION_LABEL } from "@/features/offers/constants/paymentMethodSheetCopy"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

/** Figma `16364:29753` — pay footer promo under “Pay bill”. */
export function formatClaimedOfferFooterPromoText(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `${PAYMENT_METHOD_DINEOUT_OPTION_LABEL}. Get ${formatDiscountPercent(percent)}% back.`
}

export const CLAIMED_OFFER_WELCOME_INSTRUCTION =
  "Let the waiter know before being seated that you're using DineOut. Dine as usual, then ask for the receipt and pay in the app." as const

export const CLAIMED_OFFER_PIN_LABEL =
  "Show this PIN to the waiter when you arrive" as const

/** Figma `16389:29235` — card/cash claimed offer fixed footer CTA. */
export const CLAIMED_OFFER_CARD_CASH_DONE_LABEL = "Mark as paid" as const

/** Figma `16389:29235` — meta copy under Mark as paid CTA. */
export const CLAIMED_OFFER_CONFIRM_BILL_META =
  "Paid the bill? Confirm your discount and rate your experience" as const

/** Figma `16996:19863` — payment method row trailing action. */
export const CLAIMED_OFFER_PAYMENT_METHOD_SWITCH_LABEL = "Switch" as const
