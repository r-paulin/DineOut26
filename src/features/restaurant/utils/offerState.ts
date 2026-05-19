/**
 * Restaurant offer banner: visibility tags vs banner interaction state.
 * Banner state is derived only from {@link getOfferBannerState} (see `docs/offer-banner-logic.md`).
 */

import type { DateValue } from "@/features/search/filters.types"

export type OfferTag = "claimed" | "expired" | "enabled" | string

/** Same three values as the product spec; do not extend. */
export type OfferState = "available" | "expired" | "claimed"

export type BannerState = OfferState

export interface UserClaim {
  offerId: string
  claimedAt: number
  /** Local `YYYY-MM-DD` for the offer day; scopes one-offer-per-venue-per-day. */
  scheduleYmd?: string
}

export interface OfferForBanner {
  id: string
  expiresAt: number
  /**
   * Device-local calendar anchor for the offer row (`"today"` or `YYYY-MM-DD`).
   * With `offerEnd`, the banner becomes `expired` after that local end time on that day.
   */
  offerScheduleDate?: DateValue
  isAllDay?: boolean
  offerStart?: string
  offerEnd?: string
}

/** Minimal card shape for {@link toOfferForBanner} without importing detail types (avoids cycles). */
export type OfferCardLikeForBanner = Pick<
  OfferForBanner,
  | "id"
  | "expiresAt"
  | "offerScheduleDate"
  | "isAllDay"
  | "offerStart"
  | "offerEnd"
>

export function toOfferForBanner(card: OfferCardLikeForBanner): OfferForBanner {
  return {
    id: card.id,
    expiresAt: card.expiresAt,
    offerScheduleDate: card.offerScheduleDate,
    isAllDay: card.isAllDay,
    offerStart: card.offerStart,
    offerEnd: card.offerEnd,
  }
}

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

/**
 * True when the offer’s scheduled day/window is entirely before the user’s
 * current local instant (device clock). Ignores `expiresAt`; combine in {@link getOfferBannerState}.
 */
export function isOfferPastByLocalDeviceClock(
  offer: Pick<
    OfferForBanner,
    "offerScheduleDate" | "offerStart" | "offerEnd"
  >,
  nowMs: number,
): boolean {
  if (!offer.offerScheduleDate || !offer.offerEnd) return false

  const todayYmd = toLocalYmdFromMs(nowMs)
  const scheduleYmd = resolveScheduleYmd(offer.offerScheduleDate, nowMs)

  if (scheduleYmd < todayYmd) return true
  if (scheduleYmd > todayYmd) return false

  const endMin = hmToMinutes(offer.offerEnd)
  if (endMin == null) return false

  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(scheduleYmd)
  if (!d) return false
  const y = Number(d[1])
  const mo = Number(d[2]) - 1
  const da = Number(d[3])
  const dayStartMs = new Date(y, mo, da, 0, 0, 0, 0).getTime()
  let endMs = dayStartMs + endMin * 60_000

  const startMin =
    offer.offerStart != null ? hmToMinutes(offer.offerStart) : null
  if (
    startMin != null &&
    endMin < startMin
  ) {
    endMs += 86_400_000
  }

  return nowMs > endMs
}

/**
 * Single source of truth for the offer banner (claim → expiry → available).
 * Claimed requires an explicit `offerId` match; it is never inferred from tags or defaults.
 */
export function getOfferBannerState(
  offer: OfferForBanner,
  userClaims: readonly UserClaim[],
  nowMs: number = Date.now(),
): BannerState {
  if (userClaims.some((c) => c.offerId === offer.id)) return "claimed"
  if (offer.expiresAt < nowMs) return "expired"
  if (isOfferPastByLocalDeviceClock(offer, nowMs)) return "expired"
  return "available"
}

export function shouldShowOfferBanner(tags: OfferTag[]): boolean {
  return (
    tags.includes("enabled") ||
    tags.includes("expired") ||
    tags.includes("claimed")
  )
}
