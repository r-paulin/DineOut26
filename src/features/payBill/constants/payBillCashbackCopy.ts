import { formatEurMajor } from "@/features/payBill/utils/formatEur"

/** Figma `16381:28166` — pay-screen cashback upsell headline prefix. */
export const PAY_CASHBACK_UPSELL_PREFIX =
  "Complete your payment to " as const

/** Figma `16381:28166` — pay-screen cashback upsell semibold segment. */
export function formatPayCashbackUpsellAccent(cashbackEur: number): string {
  return `get ${formatEurMajor(cashbackEur)} cashback`
}

/** Figma `16381:28166` — pay-screen cashback upsell headline suffix. */
export const PAY_CASHBACK_UPSELL_SUFFIX =
  " in your Bolt Food account." as const

/** Full single-line headline (aria). */
export function formatPayCashbackUpsellHeadline(cashbackEur: number): string {
  return `${PAY_CASHBACK_UPSELL_PREFIX}${formatPayCashbackUpsellAccent(cashbackEur)}${PAY_CASHBACK_UPSELL_SUFFIX}`
}

/** Figma `_Cashback` `16413:122635` — paid confirmation headline. */
export const PAY_CONFIRM_CASHBACK_TITLE = "Cashback received" as const

/** Figma `_Cashback` `16413:122635` — paid confirmation subcopy. */
export function formatPayConfirmCashbackDescription(cashbackEur: number): string {
  return `${formatEurMajor(cashbackEur)} has been added to your Bolt Balance`
}
