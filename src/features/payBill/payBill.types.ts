import type { ClaimedOffer } from "@/features/offers/offers.types"

export type PayBillStep =
  | "billAmount"
  | "tip"
  | "pay"
  | "success"
  | "confirmation"
  | "rating"

export type PayBillSnackbarIntent = "tip-added" | "no-tip" | null

export interface TipOption {
  id: string
  /** Primary line: formatted EUR or "Other". */
  label: string
  /** Second line for presets, e.g. "10%". */
  secondaryLabel?: string
  amount: number | null
  isCustom?: boolean
}

export type PayBillPaymentMethodUi = "bolt_balance" | "card"

/** Bill amount step venue / DineOut offer pill (Figma); hide row when null. */
export interface PayBillAmountBadges {
  /** Venue list or DineOut benefit line, e.g. "40% off" from first active tab card. */
  defaultLabel: string | null
}

export interface PayBillFlowEntry {
  restaurantName: string
  restaurantSlug: string
  /**
   * When set, user has a claimed offer (inline notice on bill / pay; no claimed %-off pill).
   * When `null`, user pays without a claim.
   */
  offer: ClaimedOffer | null
  /** Offer pills on bill amount screen; built when opening pay from restaurant detail. */
  billAmountBadges?: PayBillAmountBadges
}

/** Stable id for rating + mock payment when paying without a claimed offer. */
export function payBillSyntheticOfferId(restaurantSlug: string): string {
  return `dineout-pay-${restaurantSlug}`
}
