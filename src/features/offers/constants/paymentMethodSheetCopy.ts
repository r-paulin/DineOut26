import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"
import type { PaymentMethod } from "@/features/offers/offers.types"

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
