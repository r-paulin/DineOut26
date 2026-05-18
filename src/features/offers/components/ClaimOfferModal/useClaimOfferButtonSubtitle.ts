import { useMemo } from "react"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import type { PaymentMethod } from "@/features/offers/offers.types"

export type ClaimOfferButtonSubtitle =
  | { mode: "single"; label: string }
  | { mode: "stacked"; basePercent: number; addPercent: number }

export function getClaimOfferButtonSubtitle(
  paymentMethod: PaymentMethod,
  discountPercent: number,
  discountAddPercent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): ClaimOfferButtonSubtitle {
  if (paymentMethod === "dineout") {
    return {
      mode: "stacked",
      basePercent: discountPercent,
      addPercent: discountAddPercent,
    }
  }
  return { mode: "single", label: `${discountPercent}%` }
}

export function useClaimOfferButtonSubtitle(
  paymentMethod: PaymentMethod,
  discountPercent: number,
  discountAddPercent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): ClaimOfferButtonSubtitle {
  return useMemo(
    () =>
      getClaimOfferButtonSubtitle(
        paymentMethod,
        discountPercent,
        discountAddPercent,
      ),
    [discountAddPercent, discountPercent, paymentMethod],
  )
}
