import type { PaymentMethod } from "@/features/offers/offers.types"

export type ClaimOfferSuccessVariant = "dineout" | "card_or_cash"

export type ClaimOfferSuccessStep = {
  title: string
  subtitle: string
}

function dineOutSteps(discountPercent: number): ClaimOfferSuccessStep[] {
  const pct = String(discountPercent)
  return [
    {
      title: "Go to the restaurant",
      subtitle:
        "Arrive during the valid hours and let the staff know you’re using DineOut.",
    },
    {
      title: "Dine as usual",
      subtitle:
        "Ask for the menu, choose your dishes, and enjoy your meal.",
    },
    {
      title: "Ask for the receipt",
      subtitle:
        "Request the final bill from the waiter — say you’re paying with DineOut",
    },
    {
      title: "Pay in the app",
      subtitle: `Tap Pay bill, enter the receipt total, and confirm your payment. Make sure your ${pct}% discount is applied before paying.`,
    },
  ]
}

function cardOrCashSteps(discountPercent: number): ClaimOfferSuccessStep[] {
  const pct = String(discountPercent)
  return [
    {
      title: "Go to the restaurant",
      subtitle:
        "Arrive during the valid hours and let the staff know you’re using DineOut.",
    },
    {
      title: "Dine as usual",
      subtitle:
        "Ask for the menu, choose your dishes, and enjoy your meal.",
    },
    {
      title: "Ask for the receipt",
      subtitle:
        "After your meal, request the receipt and let them know you're using Bolt DineOut.",
    },
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
