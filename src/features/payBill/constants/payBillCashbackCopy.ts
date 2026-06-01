import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

/** Figma `16364:30080` — caption under the pay hero amount. */
export const PAY_BILL_HERO_CAPTION = "Total with discount applied" as const

/** Figma `16364:30054` — cashback upsell headline. */
export function formatPayCashbackUpsellHeadline(cashbackEur: number): string {
  return `Enjoy ${formatEurMajor(cashbackEur)} back`
}

/** Figma `16364:30055` — cashback upsell subcopy. */
export function formatPayCashbackUpsellSecondary(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `${formatDiscountPercent(percent)}% will be added to your Bolt Balance after payment`
}

/** Figma `_Cashback` `16413:122635` — paid confirmation headline. */
export const PAY_CONFIRM_CASHBACK_TITLE = "Cashback received" as const

/** Figma `_Cashback` `16413:122635` — paid confirmation subcopy. */
export function formatPayConfirmCashbackDescription(cashbackEur: number): string {
  return `${formatEurMajor(cashbackEur)} has been added to your Bolt Balance`
}
