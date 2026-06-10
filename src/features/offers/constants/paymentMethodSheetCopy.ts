import { formatDineOutClaimCashbackBannerHeadline } from "@/features/offers/constants/dineOutStackablePromo"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"
import type { PaymentMethod } from "@/features/offers/offers.types"

/** Figma `16142:22260` — claim modal payment section header. */
export const CLAIM_PAYMENT_SECTION_TITLE = "How will you pay?" as const

export const CLAIM_PAYMENT_SECTION_INTRO =
  "Select how you'll pay the bill after dining" as const

/** Figma `16142:22260` — card/cash radio primary label in claim flow. */
export const CLAIM_PAYMENT_VENUE_OPTION_LABEL = "Pay the venue directly" as const

/** Figma `16142:22260` — inline detail when venue payment is selected. */
export const CLAIM_PAYMENT_CARD_CASH_INLINE_DETAIL =
  "Pay by card or cash. No cashback." as const

/** Figma `16393:40712` — DineOut radio option (claim flow). */
export const PAYMENT_METHOD_DINEOUT_OPTION_LABEL =
  "Pay via Bolt Food app" as const

/** Same option when editing payment on claimed-offer sheet (present tense). */
export const PAYMENT_METHOD_DINEOUT_OPTION_LABEL_ACTIVE =
  "Paying via Bolt Food app" as const

/** Figma `16393:40712` — MODAL / Payment method. */
export const PAYMENT_METHOD_SHEET_TITLE = "Payment method" as const

export const PAYMENT_METHOD_SHEET_INTRO =
  "Pay at the venue after dining. Choose your preferred payment method." as const

export const PAYMENT_METHOD_CARD_CASH_DETAIL =
  "Pay directly at the venue. No cashback will be applied." as const

export function formatPaymentMethodDineoutDetail(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Pay via app and get ${formatDiscountPercent(percent)}% back in Bolt Balance after payment`
}

/** Secondary line under the selected radio (claimed-offer sheet). */
export function getPaymentMethodOptionDetail(
  method: PaymentMethod,
): string | undefined {
  if (method === "dineout") return formatPaymentMethodDineoutDetail()
  if (method === "card_or_cash") return PAYMENT_METHOD_CARD_CASH_DETAIL
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
