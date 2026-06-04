import type { ClaimedOffer } from "@/features/offers/offers.types"
import type { DateValue } from "@/features/search/filters.types"
import { hasOtherClaimAtVenueOnDay } from "@/features/offers/utils/claimConflict"
import { resolveScheduleYmd } from "@/features/offers/utils/offerScheduleLocal"
import type { OfferForBanner } from "@/features/restaurant/utils/offerState"

export type OfferBannerWindowPhase = "active" | "prebook"

function pad2(value: number): string {
  return value.toString().padStart(2, "0")
}

function toLocalYmdFromMs(nowMs: number): string {
  const d = new Date(nowMs)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function hmToMinutes(hm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59)
    return null
  return h * 60 + min
}

function minutesFromMidnight(nowMs: number): number {
  const d = new Date(nowMs)
  return d.getHours() * 60 + d.getMinutes()
}

/**
 * Strict window phase for available banners: **active** only when the offer is
 * scheduled today and local time is inside [offerStart, offerEnd). Future
 * calendar days and “today but before start” → **prebook**.
 */
export function getOfferBannerWindowPhase(
  offer: Pick<
    OfferForBanner,
    "offerScheduleDate" | "isAllDay" | "offerStart" | "offerEnd"
  >,
  nowMs: number,
): OfferBannerWindowPhase {
  if (!offer.offerScheduleDate || !offer.offerEnd) return "active"

  const now = new Date(nowMs)
  const todayYmd = toLocalYmdFromMs(nowMs)
  const scheduleYmd = resolveScheduleYmd(offer.offerScheduleDate, now)

  if (scheduleYmd > todayYmd) return "prebook"
  if (scheduleYmd < todayYmd) return "prebook"

  if (offer.isAllDay) return "active"

  const endMin = hmToMinutes(offer.offerEnd)
  if (endMin == null) return "active"

  const startMin =
    offer.offerStart != null ? hmToMinutes(offer.offerStart) : null
  const nowMin = minutesFromMidnight(nowMs)

  if (startMin == null) {
    return nowMin < endMin ? "active" : "prebook"
  }

  if (endMin < startMin) {
    return nowMin >= startMin || nowMin < endMin ? "active" : "prebook"
  }

  return nowMin >= startMin && nowMin < endMin ? "active" : "prebook"
}

/**
 * True when the user claimed a different offer at **this** venue on the same
 * calendar day. Claims at other restaurants on the same day do not lock the banner.
 */
export function hasOtherClaimAtVenue(
  offerId: string,
  restaurantSlug: string,
  offerScheduleDate: DateValue | undefined,
  claimedByOfferId: Readonly<Record<string, ClaimedOffer>>,
  nowMs: number,
): boolean {
  return hasOtherClaimAtVenueOnDay({
    offerId,
    restaurantSlug,
    offerScheduleDate,
    claimedByOfferId,
    nowMs,
  })
}
