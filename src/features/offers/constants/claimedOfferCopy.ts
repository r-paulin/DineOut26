import {
  CLAIM_PAYMENT_VENUE_OPTION_LABEL,
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL,
} from "@/features/offers/constants/paymentMethodSheetCopy"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"

/** Figma `17459:*` — hero subtitle before check-in. */
export const CLAIMED_OFFER_HERO_SUBTITLE_NOT_CHECKED_IN =
  "Check in and let the staff know you're using DineOut. Order and enjoy your meal as usual." as const

/** Figma `17459:*` — hero subtitle after check-in (same as pre check-in). */
export const CLAIMED_OFFER_HERO_SUBTITLE_CHECKED_IN =
  CLAIMED_OFFER_HERO_SUBTITLE_NOT_CHECKED_IN

/** Figma `17459:*` — ghost link under hero copy. */
export const CLAIMED_OFFER_HOW_IT_WORKS_LABEL = "How your offer works" as const

/** Claimed-offer hero sheet — same steps as post-claim success (`17327:*`). */
export const CLAIMED_OFFER_HOW_IT_WORKS_SHEET_TITLE = "How it works" as const

export const CLAIMED_OFFER_HOW_IT_WORKS_SHEET_SUBTITLE =
  "When you arrive at the venue, here's how you can use your offer" as const

export const CLAIMED_OFFER_PIN_LABEL =
  "Show this PIN to the waiter when you arrive" as const

/** Figma `17459:183419` — check-in footer promo (`body-s-accent` + `body-s-regular`). */
export const CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_LEAD = "At the venue?" as const

export const CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_TAIL =
  "Check in to reveal your offer PIN" as const

/** Figma `17459:183419` — check-in footer CTA. */
export const CLAIMED_OFFER_CHECK_IN_CTA = "Check in" as const

/** Figma `17504:35915` — snackbar after venue check-in. */
export const CLAIMED_OFFER_CHECK_IN_SNACKBAR_TITLE = "You're checked in" as const

export const CLAIMED_OFFER_CHECK_IN_SNACKBAR_DESCRIPTION =
  "Show your PIN to the staff and enjoy your meal as usual" as const

/** Figma `17459:185244` — checked-in Bolt Food footer promo (`body-s-accent` + regular). */
export const CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_LEAD = "Got your bill?" as const

export const CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_TAIL =
  "Pay and claim your cashback" as const

/** Figma `17459:185397` — checked-in card/cash footer promo (`body-s-accent` + regular). */
export const CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE_LEAD = "Paid the bill?" as const

export const CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE_TAIL =
  "Let us know to continue" as const

/** Figma `17459:185397` — checked-in card/cash footer CTA. */
export const CLAIMED_OFFER_IVE_PAID_LABEL = "I've paid" as const

/** Figma `17459:*` — payment method row trailing action. */
export const CLAIMED_OFFER_PAYMENT_CHANGE_LABEL = "Change" as const

/** Figma `17459:*` — payment detail row values. */
export const CLAIMED_OFFER_PAYMENT_ROW_DINEOUT =
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL

export const CLAIMED_OFFER_PAYMENT_ROW_VENUE = CLAIM_PAYMENT_VENUE_OPTION_LABEL

/** Figma `17475:185868` — venue payment confirmation alert. */
export const VENUE_PAYMENT_CONFIRM_TITLE =
  `${CLAIM_PAYMENT_VENUE_OPTION_LABEL}?` as const

export const VENUE_PAYMENT_CONFIRM_BODY =
  "You won't earn Bolt Balance if you pay by card or cash" as const

export const VENUE_PAYMENT_CONFIRM_PRIMARY_CTA = CLAIM_PAYMENT_VENUE_OPTION_LABEL

export const VENUE_PAYMENT_CONFIRM_SECONDARY_CTA =
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL

/** Figma `17459:183448` — disclaimer lines. */
export const CLAIMED_OFFER_DISCLAIMER_EXCLUDES =
  "Excludes alcohol and tobacco" as const

export const CLAIMED_OFFER_DISCLAIMER_VALIDITY =
  "Offers are valid only for the selected number of guests and arrival time. During busy periods, you may need to wait for a table." as const

export const CLAIMED_OFFER_DISCLAIMER_DISCOUNT_COMBINATION =
  "Only one discount can be used per bill. But cashback and other payment rewards can be combined where eligible." as const

/** @deprecated Old hero welcome copy — not used on Figma `17459` screen. */
export const CLAIMED_OFFER_WELCOME_INSTRUCTION =
  "Let the waiter know before being seated that you're using DineOut. Dine as usual, then ask for the receipt and pay in the app." as const

/** @deprecated Use {@link CLAIMED_OFFER_IVE_PAID_LABEL} on claimed-offer screen. */
export const CLAIMED_OFFER_CARD_CASH_DONE_LABEL = "Mark as paid" as const

/** @deprecated Replaced by {@link CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE}. */
export const CLAIMED_OFFER_CONFIRM_BILL_META =
  "Paid the bill? Confirm your discount and rate your experience" as const

/** @deprecated Use {@link CLAIMED_OFFER_PAYMENT_CHANGE_LABEL}. */
export const CLAIMED_OFFER_PAYMENT_METHOD_SWITCH_LABEL = "Switch" as const

/** @deprecated Old dineout footer promo — use {@link CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_LEAD}. */
export function formatClaimedOfferFooterPromoText(
  _percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `${CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_LEAD} ${CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_TAIL}`
}
