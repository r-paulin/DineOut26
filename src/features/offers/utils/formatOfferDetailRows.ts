import type { ClaimOfferModalOffer } from "@/features/offers/offers.types"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import {
  roundMaxSavingEurUp,
} from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"
import { formatOfferBannerValidityTime } from "@/features/restaurant/utils/formatOfferBannerValidityTime"
import { formatOfferScarcityLabel } from "@/features/restaurant/utils/formatOfferScarcityLabel"

const DEFAULT_MIN_ORDER_EUR = 10
const DEFAULT_MAX_SAVING_EUR = 20

export type OfferDetailRow = {
  label: string
  value: string
}

function resolveMinMax(offer: ClaimOfferModalOffer): { min: number; max: number } {
  return {
    min: offer.minOrderEur ?? DEFAULT_MIN_ORDER_EUR,
    max: roundMaxSavingEurUp(offer.maxSavingEur ?? DEFAULT_MAX_SAVING_EUR),
  }
}

export function formatOfferDetailAvailability(
  date: string,
  timeWindow: string,
): string {
  const time = formatOfferBannerValidityTime(timeWindow)
  return `${date}, ${time}`
}

/** Detail rows for {@link OfferDetailsSheet} (Figma `16081:15861`). */
export function formatOfferDetailRows(offer: ClaimOfferModalOffer): OfferDetailRow[] {
  const { min, max } = resolveMinMax(offer)
  const rows: OfferDetailRow[] = [
    { label: "Maximum saving", value: formatEurMajor(max) },
    { label: "Minimum bill total", value: formatEurMajor(min) },
    {
      label: "Available",
      value: formatOfferDetailAvailability(offer.date, offer.timeWindow),
    },
  ]
  if (offer.remainingCount != null && offer.remainingCount > 0) {
    rows.push({
      label: "Limited availability",
      value: formatOfferScarcityLabel(offer.remainingCount),
    })
  }
  return rows
}
