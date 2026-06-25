import { formatDineOutClaimCashbackBannerHeadline } from "@/features/offers/constants/dineOutStackablePromo"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"
import type { PaymentMethod } from "@/features/offers/offers.types"

/** Figma `16142:22260` — claim modal payment section header. */
export const CLAIM_PAYMENT_SECTION_TITLE = "How will you pay?" as const

export const CLAIM_PAYMENT_SECTION_INTRO =
  "Select how you'll pay the bill after dining" as const

/** Figma `16142:22260` — card/cash radio primary label in claim flow. */
export const CLAIM_PAYMENT_VENUE_OPTION_LABEL = "Pay by card or cash" as const

/** Figma `16142:22260` — inline detail when venue payment is selected. */
export const CLAIM_PAYMENT_CARD_CASH_INLINE_DETAIL =
  "Pay by card or cash. No cashback." as const

/** Figma `16393:40712` — DineOut radio option (claim flow). */
export const PAYMENT_METHOD_DINEOUT_OPTION_LABEL = "Pay with Bolt Food" as const

/** @deprecated Use {@link PAYMENT_METHOD_DINEOUT_OPTION_LABEL}. */
export const PAYMENT_METHOD_DINEOUT_OPTION_LABEL_ACTIVE =
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL

/** Figma claimed-offer payment sheet — “Choose how to pay”. */
export const PAYMENT_METHOD_SHEET_TITLE = "Choose how to pay" as const

export const PAYMENT_METHOD_SHEET_INTRO = "You won't be charged yet" as const

export const PAYMENT_METHOD_SHEET_CONFIRM_CTA = "Confirm" as const

/** Figma `16393:40712` — card/cash secondary line on claimed-offer payment sheet. */
export const PAYMENT_METHOD_CARD_CASH_SHEET_DETAIL =
  "Cashback doesn't apply" as const

/** @deprecated Use {@link PAYMENT_METHOD_CARD_CASH_SHEET_DETAIL}. */
export const PAYMENT_METHOD_CARD_CASH_DETAIL =
  PAYMENT_METHOD_CARD_CASH_SHEET_DETAIL

/** Selected Bolt Food row subtext on claimed-offer payment sheet. */
export function formatPaymentMethodDineoutDetail(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Earn ${formatDiscountPercent(percent)}% back as Bolt Balance`
}

/** Secondary line under each radio on the claimed-offer payment sheet. */
export function getPaymentMethodOptionDetail(
  method: PaymentMethod,
): string | undefined {
  if (method === "dineout") return formatPaymentMethodDineoutDetail()
  if (method === "card_or_cash") return PAYMENT_METHOD_CARD_CASH_SHEET_DETAIL
  return undefined
}

/** Inline detail under the selected radio in the claim modal (Figma `16142:22260`). */
export function getClaimPaymentOptionDetail(
  method: PaymentMethod,
): string | undefined {
  if (method === "dineout") return formatDineOutClaimCashbackBannerHeadline()
  if (method === "card_or_cash") return CLAIM_PAYMENT_CARD_CASH_INLINE_DETAIL
  return undefined
}
