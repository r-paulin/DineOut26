import {
  CLAIM_PAYMENT_VENUE_OPTION_LABEL,
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL,
} from "@/features/offers/constants/paymentMethodSheetCopy"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

/** Figma `19867:37819` — Get directions ghost link. */
export const CLAIMED_OFFER_GET_DIRECTIONS_LABEL = "Get directions" as const

/** Figma `19867:37819` — How to use section title. */
export const CLAIMED_OFFER_HOW_TO_USE_TITLE = "How to use your offer" as const

/** Figma `19867:37819` — step 1 list title. */
export function formatClaimedOfferCheckInStepTitle(
  discountPercent: number,
): string {
  return `Check in to use your ${formatDiscountPercent(discountPercent)}% discount`
}

/** Figma `19867:37819` — Arrived? PIN card. */
export const CLAIMED_OFFER_ARRIVED_TITLE = "Arrived?" as const

export const CLAIMED_OFFER_ARRIVED_PIN_HINT =
  "When you arrive, show this PIN to your waiter" as const

/** Figma `19867:37819` — step 2 list title. */
export function formatClaimedOfferPayStepTitle(
  cashbackPercent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Pay your bill and get ${formatDiscountPercent(cashbackPercent)}% cash back`
}

/** Figma `19867:37819` — pay card (disabled until check-in). */
export const CLAIMED_OFFER_PAY_CARD_TITLE = "Got your bill?" as const

export const CLAIMED_OFFER_PAY_CARD_HINT = "Pay and claim your cashback" as const

/** Figma `19867:37819` — disabled pay CTA before check-in. */
export const CLAIMED_OFFER_PAY_THE_BILL_CTA = "Pay the bill" as const

/** Figma `19867:38049` — enabled pay CTA after check-in (DineOut). */
export const CLAIMED_OFFER_PAY_BILL_CTA = "Pay bill" as const

/** @deprecated Replaced by offer label + Get directions on Figma `19867:37819`. */
export const CLAIMED_OFFER_HERO_SUBTITLE_NOT_CHECKED_IN =
  "Check in and let the staff know you're using DineOut. Order and enjoy your meal as usual." as const

/** @deprecated Use {@link CLAIMED_OFFER_HERO_SUBTITLE_NOT_CHECKED_IN}. */
export const CLAIMED_OFFER_HERO_SUBTITLE_CHECKED_IN =
  CLAIMED_OFFER_HERO_SUBTITLE_NOT_CHECKED_IN

/** @deprecated How-it-works link removed from hero on Figma `19867:37819`. */
export const CLAIMED_OFFER_HOW_IT_WORKS_LABEL = "How your offer works" as const

/** Claimed-offer hero sheet — same steps as post-claim success (`17327:*`). */
export const CLAIMED_OFFER_HOW_IT_WORKS_SHEET_TITLE = "How it works" as const

export const CLAIMED_OFFER_HOW_IT_WORKS_SHEET_SUBTITLE =
  "When you arrive at the venue, here's how you can use your offer" as const

export const CLAIMED_OFFER_HOW_IT_WORKS_SHEET_CTA = "OK" as const

export const CLAIMED_OFFER_PIN_LABEL =
  "Show this PIN to the waiter when you arrive" as const

/** Figma `17459:183419` — check-in footer promo (`body-s-accent` + `body-s-regular`). */
export const CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_LEAD = "At the venue?" as const

export const CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_TAIL =
  "Check in to reveal your offer PIN" as const

/** Figma `17459:183419` / `19867:37819` — check-in CTA. */
export const CLAIMED_OFFER_CHECK_IN_CTA = "Check in" as const

/** Figma `19867:38043` — step 1 after venue check-in. */
export const CLAIMED_OFFER_CHECKED_IN_STEP_TITLE = "You're checked in" as const

export const CLAIMED_OFFER_CHECKED_IN_STEP_SUBTITLE =
  "Order and enjoy your meal as usual." as const

/**
 * Figma `19867:38064` — snackbar after venue check-in.
 * Title is {@link formatWelcomeAtRestaurant} from claimedOfferShared.
 */
export const CLAIMED_OFFER_CHECK_IN_SNACKBAR_DESCRIPTION =
  "Dine as usual and ask for the bill when you're ready" as const

/** @deprecated Title moved to step list; snackbar uses welcome-at-restaurant. */
export const CLAIMED_OFFER_CHECK_IN_SNACKBAR_TITLE =
  CLAIMED_OFFER_CHECKED_IN_STEP_TITLE

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

/** Figma `17459:183448` / `19867:37819` — disclaimer lines. */
export const CLAIMED_OFFER_DISCLAIMER_EXCLUDES =
  "Excludes alcohol and tobacco" as const

export const CLAIMED_OFFER_DISCLAIMER_VALIDITY =
  "Claiming an offer doesn’t ensure a table booking and during busy periods, you may need to wait for a table." as const

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
