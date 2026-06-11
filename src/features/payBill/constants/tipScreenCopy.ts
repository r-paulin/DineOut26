import { formatEurMajor } from "@/features/payBill/utils/formatEur"

/** Figma `15935:24418` — custom tip sheet heading. */
export const CUSTOM_TIP_HEADING = "Enter a custom tip" as const

/** Figma pay bill — tip screen subtitle. */
export const TIP_SCREEN_SUBTITLE = "We don't deduct anything from tips" as const

/** Figma pay bill — tip screen bill total caption. */
export function formatTipScreenBillTotalLabel(amount: number): string {
  return `Bill total: ${formatEurMajor(amount)}`
}
