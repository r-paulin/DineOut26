import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

/** Figma pay bill — amount entry screen title. */
export const BILL_AMOUNT_TITLE = "Enter bill total" as const

/** Figma pay bill — amount entry subtitle when paying with a claimed offer. */
export function formatBillAmountSubtitleClaimed(discountPercent: number): string {
  return `Check that your ${formatDiscountPercent(discountPercent)}% discount is shown on the receipt, then enter the final bill amount.`
}

export const BILL_AMOUNT_SUBTITLE_DEFAULT =
  "Enter the final amount from your receipt." as const
