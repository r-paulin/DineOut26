import type { DateValue } from "@/features/search/filters.types"
import type { OfferForBanner, UserClaim } from "@/features/restaurant/utils/offerState"

export type OfferBannerWindowPhase = "active" | "prebook"

function pad2(value: number): string {
  return value.toString().padStart(2, "0")
}

function toLocalYmdFromMs(nowMs: number): string {
  const d = new Date(nowMs)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function resolveScheduleYmd(
  offerScheduleDate: DateValue,
  nowMs: number,
): string {
  if (offerScheduleDate === "today") return toLocalYmdFromMs(nowMs)
  return offerScheduleDate
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

  const todayYmd = toLocalYmdFromMs(nowMs)
  const scheduleYmd = resolveScheduleYmd(offer.offerScheduleDate, nowMs)

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

/** True when the user already claimed a different offer at this venue. */
export function hasOtherClaimAtVenue(
  offerId: string,
  userClaims: readonly UserClaim[],
): boolean {
  return userClaims.some((c) => c.offerId !== offerId)
}
