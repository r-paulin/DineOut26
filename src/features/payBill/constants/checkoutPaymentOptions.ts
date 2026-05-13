/**
 * Checkout “change payment” screen — stable ids aligned with Figma Payment list.
 * Default matches Figma: Google Pay pre-selected.
 */
export const CHECKOUT_PAYMENT_DEFAULT_OPTION_ID = "google_pay" as const

export const CHECKOUT_PAYMENT_RADIO_OPTIONS = [
  { id: "google_pay", label: "Google Pay" },
  { id: "card_4728", label: "Mastercard •••• 4728" },
  { id: "card_3329", label: "Mastercard •••• 3329" },
  { id: "cash", label: "Cash" },
] as const

export type CheckoutPaymentOptionId =
  (typeof CHECKOUT_PAYMENT_RADIO_OPTIONS)[number]["id"]

export function checkoutPaymentOptionLabel(id: string): string {
  const row = CHECKOUT_PAYMENT_RADIO_OPTIONS.find((o) => o.id === id)
  return row?.label ?? CHECKOUT_PAYMENT_RADIO_OPTIONS[0].label
}

export function narrowCheckoutPaymentOptionId(id: string): CheckoutPaymentOptionId {
  const ok = CHECKOUT_PAYMENT_RADIO_OPTIONS.some((o) => o.id === id)
  return ok ? (id as CheckoutPaymentOptionId) : CHECKOUT_PAYMENT_DEFAULT_OPTION_ID
}
