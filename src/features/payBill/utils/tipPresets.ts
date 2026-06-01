import { round2 } from "@/features/payBill/utils/discountCalc"

/** Default tip chip percentages (Figma `15822:12199` — 5%, 10%, 15%). */
export const DEFAULT_TIP_PERCENT_PRESETS = [5, 10, 15] as const

/** Max percent presets shown on the tip screen (Figma: three tiles + No tip + Other). */
export const TIP_SCREEN_PERCENT_PRESET_LIMIT = 3

/** Tip EUR from receipt total and integer percent (0–100). */
export function percentTipEur(receiptTotalEur: number, percent: number): number {
  return round2((receiptTotalEur * percent) / 100)
}
