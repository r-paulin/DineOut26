import type { ClaimedOffer } from "@/features/offers/offers.types"

export type PayBillStep =
  | "billAmount"
  | "tip"
  | "pay"
  | "success"
  | "confirmation"

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

export interface PayBillFlowEntry {
  restaurantName: string
  restaurantSlug: string
  /**
   * When set, user has a claimed offer (inline notice on bill / pay; no claimed %-off pill).
   * When `null`, user pays without a claim.
   */
  offer: ClaimedOffer | null
}

/** Stable offer id for mock payment when paying without a claimed offer. */
export function payBillSyntheticOfferId(restaurantSlug: string): string {
  return `dineout-pay-${restaurantSlug}`
}
