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

/** Figma `17481:187954` — paid confirmation cashback prefix. */
export const PAY_CONFIRM_CASHBACK_PREFIX = "You've received " as const

/** Figma `17481:187954` — paid confirmation semibold segment. */
export function formatPayConfirmCashbackAccent(cashbackEur: number): string {
  return `${formatEurMajor(cashbackEur)} cashback`
}

/** Figma `17481:187954` — paid confirmation cashback suffix. */
export const PAY_CONFIRM_CASHBACK_SUFFIX = " in your Bolt Food account." as const

/** Full single-line headline (aria). */
export function formatPayConfirmCashbackHeadline(cashbackEur: number): string {
  return `${PAY_CONFIRM_CASHBACK_PREFIX}${formatPayConfirmCashbackAccent(cashbackEur)}${PAY_CONFIRM_CASHBACK_SUFFIX}`
}
