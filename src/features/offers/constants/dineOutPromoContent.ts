/** Figma `17481:187743` — MODAL / Offer - Claimed (how DineOut works sheet). */

export const DINEOUT_PROMO_TITLE = "How DineOut works" as const

export const DINEOUT_PROMO_INTRO =
  "Dine as usual. But get exclusive offers with DineOut." as const

export const DINEOUT_PROMO_CTA_LABEL = "Explore offers" as const

export type DineOutPromoStep = {
  id: string
  title: string
  subtitle: string
}

export const DINEOUT_PROMO_STEPS: DineOutPromoStep[] = [
  {
    id: "discover",
    title: "Discover exclusive offers",
    subtitle:
      "Find offers for new places or old favourites at times that suit you",
  },
  {
    id: "head-out",
    title: "Head out to eat",
    subtitle: "Enjoy food and drink as usual",
  },
  {
    id: "pay-save",
    title: "Pay with Bolt Food and save",
    subtitle:
      "Save on your bill and earn Bolt Balance when you pay on the Bolt Food app",
  },
]
