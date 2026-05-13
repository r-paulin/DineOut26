import type {
  OfferCardCampaign,
  OfferCardModel,
} from "@/features/offers/offers.types"
import type {
  OfferTimePreset,
  RestaurantTimedOffer,
  TimedOfferWindow,
} from "@/features/offers/data/restaurantOffers.types"
import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"

const EN_DASH = "\u2013"

/** Half-open interval [startMin, endMin) in minutes from midnight for filter presets. */
const PRESET_MINUTES: Record<Exclude<OfferTimePreset, "any">, [number, number]> =
  {
    morning: [8 * 60, 12 * 60],
    lunch: [11 * 60, 15 * 60],
    evening: [17 * 60, 23 * 60],
  }

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

/** Offer range as half-open [start, end) in minutes (end exclusive). */
function offerRangeMinutes(w: TimedOfferWindow): [number, number] | null {
  if (w.kind === "all-day") return null
  return [hhmmToMinutes(w.start), hhmmToMinutes(w.end)]
}

function rangesOverlapHalfOpen(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
): boolean {
  return a0 < b1 && b0 < a1
}

export function formatTimeWindowLabel(window: TimedOfferWindow): string {
  if (window.kind === "all-day") return "All day"
  return `${window.start}${EN_DASH}${window.end}`
}

/**
 * True if the restaurant should appear for the preset: any offer is all-day,
 * or any timed offer overlaps the preset window (half-open).
 */
export function restaurantVisibleForPreset(
  offers: RestaurantTimedOffer[],
  preset: OfferTimePreset,
): boolean {
  if (preset === "any") return offers.length > 0
  const [f0, f1] = PRESET_MINUTES[preset]
  for (const o of offers) {
    if (o.window.kind === "all-day") return true
    const r = offerRangeMinutes(o.window)
    if (r && rangesOverlapHalfOpen(r[0], r[1], f0, f1)) return true
  }
  return false
}

export function restaurantSlugVisibleForPreset(
  slug: string,
  preset: OfferTimePreset,
): boolean {
  return restaurantVisibleForPreset(getRestaurantOffers(slug), preset)
}

/**
 * Primary badge = highest discount %; tie-break: earlier in `offers` array.
 * `extraOffers` = total minus one when multiple offers exist.
 */
export function computeOfferCardCampaign(
  offers: RestaurantTimedOffer[],
): OfferCardCampaign {
  if (offers.length === 0) {
    return {}
  }

  let bestIndex = 0
  let bestPct = offers[0]!.discountPercent
  for (let i = 1; i < offers.length; i += 1) {
    const p = offers[i]!.discountPercent
    if (p > bestPct) {
      bestPct = p
      bestIndex = i
    }
  }

  const primary = offers[bestIndex]!
  const discountLabel = `-${primary.discountPercent}%`
  const timeWindow = formatTimeWindowLabel(primary.window)
  const extra =
    offers.length > 1 ? offers.length - 1 : undefined

  return {
    discountLabel,
    timeWindow,
    extraOffers: extra,
  }
}

export function computeOfferCardCampaignForSlug(slug: string): OfferCardCampaign {
  return computeOfferCardCampaign(getRestaurantOffers(slug))
}

export function filterOffersByTimePreset(
  offers: OfferCardModel[],
  preset: OfferTimePreset,
): OfferCardModel[] {
  return offers.filter((o) =>
    restaurantSlugVisibleForPreset(o.restaurantSlug ?? o.id, preset),
  )
}
