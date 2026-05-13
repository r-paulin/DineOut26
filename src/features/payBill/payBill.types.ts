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

/** Bill amount step offer pills (Figma); both optional — hide row when both null. */
export interface PayBillAmountBadges {
  /** Venue list offer, e.g. "40% off" from first active tab card. */
  defaultLabel: string | null
  /** User’s claimed offer for this venue, e.g. promo line or "10% off". */
  claimedLabel: string | null
}

export interface PayBillFlowEntry {
  restaurantName: string
  restaurantSlug: string
  /**
   * When set, receipt shows offer discount and %-off sticker.
   * When `null`, user can still pay with DineOut (no claimed offer / no venue offer row).
   */
  offer: ClaimedOffer | null
  /** Offer pills on bill amount screen; built when opening pay from restaurant detail. */
  billAmountBadges?: PayBillAmountBadges
}

/** Stable id for rating + mock payment when paying without a claimed offer. */
export function payBillSyntheticOfferId(restaurantSlug: string): string {
  return `dineout-pay-${restaurantSlug}`
}
