import { round2 } from "@/features/payBill/utils/discountCalc"

/** Default tip chip percentages (Figma PAY BILL / Add a tip). */
export const DEFAULT_TIP_PERCENT_PRESETS = [10, 15, 20] as const

/** Tip EUR from receipt total and integer percent (0–100). */
export function percentTipEur(receiptTotalEur: number, percent: number): number {
  return round2((receiptTotalEur * percent) / 100)
}
