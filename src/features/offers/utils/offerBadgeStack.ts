import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"
import { isTimedOfferWindowLiveAt } from "@/features/discover/utils/filterDiscoverOffers"
import { RESTAURANT_WEEKLY_OPEN_HOURS } from "@/features/restaurant/data/restaurantFixedOpenHours"
import { buildOpenHoursUiState } from "@/features/restaurant/utils/restaurantOpenHoursUi"
import { formatTimeWindowLabel } from "@/features/offers/utils/offerCampaign"

export type BadgeStackMode = "default" | "liveNow"

/** Prototype cap: at most five timed offers per venue per day. */
export const MAX_BADGE_OFFERS_PER_VENUE = 5

export type TimedOfferBadgeRow =
  | {
      kind: "offer"
      discountLabel: string
      timeWindow: string
      iconActive: boolean
    }
  | {
      kind: "overflow"
      /** Hidden count = total eligible offers minus the one shown. */
      count: number
      iconActive: boolean
    }

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + (Number.isFinite(m) ? m : 0)
}

function minutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

/** Range offers past end (half-open [start, end)) are hidden; all-day stays eligible. */
export function isTimedOfferExpiredToday(
  offer: RestaurantTimedOffer,
  now: Date,
): boolean {
  const w = offer.window
  if (w.kind === "all-day") return false
  const m = minutesFromMidnight(now)
  return m >= hhmmToMinutes(w.end)
}

/** Shared prototype weekly grid until per-venue hours exist in catalog. */
export function isVenueOpenNow(now: Date): boolean {
  return buildOpenHoursUiState(now, RESTAURANT_WEEKLY_OPEN_HOURS).isOpenNow
}

/**
 * Live badge: ranged window contains now and venue is open.
 * All-day uses “All day” copy and is sorted as claimable, not live.
 */
export function isOfferLiveForBadge(
  offer: RestaurantTimedOffer,
  now: Date,
): boolean {
  if (offer.window.kind === "all-day") return false
  return (
    isTimedOfferWindowLiveAt(now, offer.window) && isVenueOpenNow(now)
  )
}

function offerStartMinutes(offer: RestaurantTimedOffer): number {
  if (offer.window.kind === "all-day") return 0
  return hhmmToMinutes(offer.window.start)
}

function compareOffersForBadgePriority(
  a: RestaurantTimedOffer,
  b: RestaurantTimedOffer,
): number {
  if (b.discountPercent !== a.discountPercent) {
    return b.discountPercent - a.discountPercent
  }
  return offerStartMinutes(a) - offerStartMinutes(b)
}

export function formatBadgeTimeLabel(
  offer: RestaurantTimedOffer,
  now: Date,
): string {
  const w = offer.window
  if (w.kind === "all-day") return "All day"
  if (isOfferLiveForBadge(offer, now)) {
    return `Until ${w.end}`
  }
  return formatTimeWindowLabel(w)
}

/**
 * Non-expired offers, live first, then highest %, then earlier start.
 * Capped at {@link MAX_BADGE_OFFERS_PER_VENUE}.
 */
export function sortOffersForBadgeDisplay(
  offers: readonly RestaurantTimedOffer[],
  now: Date,
): RestaurantTimedOffer[] {
  const eligible = offers
    .filter((o) => !isTimedOfferExpiredToday(o, now))
    .slice(0, MAX_BADGE_OFFERS_PER_VENUE)

  const liveCandidates = eligible
    .filter((o) => isOfferLiveForBadge(o, now))
    .sort(compareOffersForBadgePriority)
  const liveOffer = liveCandidates[0]
  const rest = eligible
    .filter((o) => o !== liveOffer)
    .sort(compareOffersForBadgePriority)

  return liveOffer ? [liveOffer, ...rest] : rest
}

/**
 * Badge stack: 1 → one pill; 2 → two pills; 3–5 → best offer + `+N offers` (N = total − 1).
 *
 * `liveNow` mode keeps only venue-open live windows, then the same stack rules.
 */
export function buildTimedOfferBadgeModels(
  offers: readonly RestaurantTimedOffer[],
  now: Date = new Date(),
  mode: BadgeStackMode = "default",
): TimedOfferBadgeRow[] {
  let ordered = sortOffersForBadgeDisplay(offers, now)

  if (mode === "liveNow") {
    ordered = ordered.filter((o) => isOfferLiveForBadge(o, now))
  }

  if (ordered.length === 0) return []

  const offerRow = (offer: RestaurantTimedOffer): TimedOfferBadgeRow => ({
    kind: "offer",
    discountLabel: `-${offer.discountPercent}%`,
    timeWindow: formatBadgeTimeLabel(offer, now),
    iconActive: true,
  })

  if (ordered.length === 1) {
    return [offerRow(ordered[0]!)]
  }

  if (ordered.length === 2) {
    return ordered.map(offerRow)
  }

  return [
    offerRow(ordered[0]!),
    {
      kind: "overflow",
      count: ordered.length - 1,
      iconActive: true,
    },
  ]
}
