import type { PaymentMethod } from "@/features/offers/offers.types"

export type ClaimOfferSuccessVariant = "dineout" | "card_or_cash"

export type ClaimOfferSuccessStep = {
  title: string
  subtitle: string
}

const CHECK_IN_STEP: ClaimOfferSuccessStep = {
  title: "Check in with your code",
  subtitle:
    "We'll give you a code when you arrive to share with staff at the venue",
}

/** Figma `17327:18233` / `17327:18251` — generic post-claim steps (no per-offer discount %). */
const ASK_FOR_BILL_STEP: ClaimOfferSuccessStep = {
  title: "Ask for the bill when ready",
  subtitle: "Check your offer has already been applied",
}

const PAY_VIA_DINEOUT_STEP: ClaimOfferSuccessStep = {
  title: "Pay via Bolt Food",
  subtitle: "Enter the total shown on the bill and complete the steps to pay",
}

const SETTLE_UP_STEP: ClaimOfferSuccessStep = {
  title: "Settle up as usual",
  subtitle:
    "Pay the venue directly with cash, card, or whatever payment methods they accept",
}

const DINEOUT_STEPS: ClaimOfferSuccessStep[] = [
  CHECK_IN_STEP,
  ASK_FOR_BILL_STEP,
  PAY_VIA_DINEOUT_STEP,
]

const CARD_OR_CASH_STEPS: ClaimOfferSuccessStep[] = [
  CHECK_IN_STEP,
  ASK_FOR_BILL_STEP,
  SETTLE_UP_STEP,
]

export function getClaimOfferSuccessSteps(
  paymentMethod: PaymentMethod,
): ClaimOfferSuccessStep[] {
  return paymentMethod === "dineout" ? DINEOUT_STEPS : CARD_OR_CASH_STEPS
}

export function claimOfferSuccessVariant(
  paymentMethod: PaymentMethod,
): ClaimOfferSuccessVariant {
  return paymentMethod === "dineout" ? "dineout" : "card_or_cash"
}
