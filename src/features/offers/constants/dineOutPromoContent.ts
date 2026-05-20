/** Figma `16084:48918` — DineOut promo / how-it-works sheet copy. */

export const DINEOUT_PROMO_TITLE = "Dine smarter with DineOut" as const

export const DINEOUT_PROMO_INTRO =
  "Dine as usual. Pay with DineOut and enjoy the savings." as const

export const DINEOUT_PROMO_CTA_LABEL = "Explore offers" as const

export type DineOutPromoStep = {
  id: string
  title: string
  subtitle: string
}

export const DINEOUT_PROMO_STEPS: DineOutPromoStep[] = [
  {
    id: "search-claim",
    title: "Search dining deals and claim yours",
    subtitle:
      "Unlock dining offers only available through Bolt Food DineOut",
  },
  {
    id: "go",
    title: "Go to the restaurant",
    subtitle:
      "Arrive during the valid offer hours. Let the staff know you're using Bolt DineOut.",
  },
  {
    id: "dine",
    title: "Dine as usual",
    subtitle:
      "Ask for the menu, choose your dishes, and enjoy your meal.",
  },
  {
    id: "receipt",
    title: "Ask for the receipt",
    subtitle:
      "Request the final bill from the waiter. Review applied offers or rewards.",
  },
  {
    id: "pay",
    title: "Tap “Pay bill” in the app",
    subtitle:
      "Enter the total amount shown on your receipt and complete your payment in the app.",
  },
]
