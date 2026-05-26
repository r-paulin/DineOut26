import type { PaymentMethod } from "@/features/offers/offers.types"

export type ClaimOfferSuccessVariant = "dineout" | "card_or_cash"

export type ClaimOfferSuccessStep = {
  title: string
  subtitle: string
}

function sharedClaimSteps(discountPercent: number): ClaimOfferSuccessStep[] {
  const pct = String(discountPercent)
  return [
    {
      title: "Arrive during the offer hours",
      subtitle: "Your discount is available while the offer is active",
    },
    {
      title: "Tap I'm at venue",
      subtitle: "The button appears on the restaurant page once you arrive",
    },
    {
      title: "Show the PIN to the staff",
      subtitle: "This confirms your DineOut offer",
    },
    {
      title: "Enjoy your meal",
      subtitle: `Your ${pct}% discount applies to the final bill`,
    },
  ]
}

function dineOutSteps(discountPercent: number): ClaimOfferSuccessStep[] {
  return [
    ...sharedClaimSteps(discountPercent),
    {
      title: "Pay in the app",
      subtitle: "Enter the receipt total and confirm payment.",
    },
  ]
}

function cardOrCashSteps(discountPercent: number): ClaimOfferSuccessStep[] {
  const pct = String(discountPercent)
  return [
    ...sharedClaimSteps(discountPercent),
    {
      title: "Pay at the venue",
      subtitle: `Make sure the ${pct}% discount is applied to your bill, then pay by card or cash.`,
    },
  ]
}

export function getClaimOfferSuccessSteps(
  paymentMethod: PaymentMethod,
  discountPercent: number,
): ClaimOfferSuccessStep[] {
  return paymentMethod === "dineout" ?
      dineOutSteps(discountPercent)
    : cardOrCashSteps(discountPercent)
}

export function claimOfferSuccessVariant(
  paymentMethod: PaymentMethod,
): ClaimOfferSuccessVariant {
  return paymentMethod === "dineout" ? "dineout" : "card_or_cash"
}
