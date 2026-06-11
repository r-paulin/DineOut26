import { formatEurMajor } from "@/features/payBill/utils/formatEur"

/** Figma `16364:30080` — caption under the pay hero amount. */
export const PAY_BILL_HERO_CAPTION = "Total with discount applied" as const

/** Figma `16381:28166` — pay-screen cashback upsell accent segment. */
export function formatPayCashbackUpsellAccent(cashbackEur: number): string {
  return `Earning ${formatEurMajor(cashbackEur)} back`
}

/** Figma `16381:28166` — pay-screen cashback upsell regular segment. */
export const PAY_CASHBACK_UPSELL_SUFFIX =
  " as Bolt Balance to use on Bolt Food" as const

/** Figma `_Cashback` `16413:122635` — paid confirmation headline. */
export const PAY_CONFIRM_CASHBACK_TITLE = "Cashback received" as const

/** Figma `_Cashback` `16413:122635` — paid confirmation subcopy. */
export function formatPayConfirmCashbackDescription(cashbackEur: number): string {
  return `${formatEurMajor(cashbackEur)} has been added to your Bolt Balance`
}
