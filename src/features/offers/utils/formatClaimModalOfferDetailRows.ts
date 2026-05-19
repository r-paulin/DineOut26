import type { ClaimOfferModalOffer } from "@/features/offers/offers.types"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import { formatOfferDetailAvailability } from "@/features/offers/utils/formatOfferDetailRows"

const DEFAULT_MIN_ORDER_EUR = 10

export type ClaimModalOfferDetailRow = {
  label: string
  value: string
}

/** Detail rows for claim modal (Figma `16123:18118`). */
export function formatClaimModalOfferDetailRows(
  offer: ClaimOfferModalOffer,
): ClaimModalOfferDetailRow[] {
  const min = offer.minOrderEur ?? DEFAULT_MIN_ORDER_EUR
  return [
    { label: "Minimum order", value: formatEurMajor(min) },
    {
      label: "Available",
      value: formatOfferDetailAvailability(offer.date, offer.timeWindow),
    },
    { label: "Applicable", value: "Food only" },
  ]
}
