/** Figma `16942:16608` — active offer conflict bottom sheet. */

export const ACTIVE_OFFER_CONFLICT_SHEET_TITLE =
  "You already have an active offer"

export function activeOfferConflictSheetBody(restaurantName: string): string {
  return `You can only use one offer at a time. Cancel your offer at ${restaurantName} to claim this one.`
}

export const ACTIVE_OFFER_CONFLICT_CANCEL_CTA = "Cancel offer"

export const ACTIVE_OFFER_CONFLICT_KEEP_CTA = "Keep current offer"
