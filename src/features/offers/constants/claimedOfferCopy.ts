import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

/** Figma `16364:29753` — pay footer promo under “Pay bill”. */
export function formatClaimedOfferFooterPromoText(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Pay with Bolt DineOut. Get ${formatDiscountPercent(percent)}% back.`
}

export const CLAIMED_OFFER_WELCOME_INSTRUCTION =
  "Let the waiter know before being seated that you're using DineOut. Dine as usual, then ask for the receipt and pay in the app." as const

export const CLAIMED_OFFER_PIN_LABEL =
  "Show this PIN to the waiter when you arrive" as const

/** Figma `16167:23901` — card/cash claimed offer fixed footer CTA. */
export const CLAIMED_OFFER_CARD_CASH_DONE_LABEL = "Mark as paid" as const
