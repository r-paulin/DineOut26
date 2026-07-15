import { OFFER_APPLICABLE_TOTAL_BILL } from "@/features/offers/constants/offerApplicabilityCopy"
import type { ClaimOfferModalOffer } from "@/features/offers/offers.types"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import { formatOfferBannerValidityTime } from "@/features/restaurant/utils/formatOfferBannerValidityTime"

const DEFAULT_MIN_ORDER_EUR = 10

export type ClaimModalOfferDetailRow = {
  label: string
  value: string
}

/** Figma `16142:22260` — `17 May · 15:00–16:00`. */
export function formatClaimModalOfferAvailability(
  date: string,
  timeWindow: string,
): string {
  const time = formatOfferBannerValidityTime(timeWindow)
  return `${date} · ${time}`
}

/** Detail rows for claim modal (Figma `16142:22260`). */
export function formatClaimModalOfferDetailRows(
  offer: ClaimOfferModalOffer,
): ClaimModalOfferDetailRow[] {
  const min = offer.minOrderEur ?? DEFAULT_MIN_ORDER_EUR
  return [
    { label: "Minimum order", value: formatEurMajor(min) },
    { label: "Applicable", value: OFFER_APPLICABLE_TOTAL_BILL },
    {
      label: "Available",
      value: formatClaimModalOfferAvailability(offer.date, offer.timeWindow),
    },
  ]
}
