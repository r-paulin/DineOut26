import type {
  ClaimData,
  ClaimedOffer,
  ClaimOfferModalOffer,
} from "@/features/offers/offers.types"
import type { DateValue } from "@/features/search/filters.types"
import { computeOfferWindowCloseIso } from "@/features/offers/utils/claimOffer"
import { parseHHMMToMinutes } from "@/features/offers/utils/offerTimePicker"
import {
  localDateAtNoon,
  resolveScheduleYmd,
  toLocalYmd,
} from "@/features/offers/utils/offerScheduleLocal"

export type ClaimWindowMs = readonly [startMs: number, endMs: number]

function toLocalYmdFromMs(nowMs: number): string {
  return toLocalYmd(new Date(nowMs))
}

function arrivalMsOnDay(ymd: string, arrivalTime: string): number | null {
  const minutes = parseHHMMToMinutes(arrivalTime)
  if (minutes == null) return null
  const d = localDateAtNoon(ymd)
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return d.getTime()
}

function scheduleYmdForOffer(
  offerScheduleDate: DateValue | undefined,
  nowMs: number,
): string {
  if (offerScheduleDate != null) {
    return resolveScheduleYmd(offerScheduleDate, new Date(nowMs))
  }
  return toLocalYmdFromMs(nowMs)
}

/** Active window: arrival → offer window closes (device-local). */
export function claimWindowMs(claim: ClaimedOffer): ClaimWindowMs {
  const ymd = claim.offerScheduleYmd ?? toLocalYmdFromMs(claim.claimedAt)
  const start = arrivalMsOnDay(ymd, claim.arrivalTime) ?? claim.claimedAt
  const end = new Date(claim.offerWindowCloses).getTime()
  return [start, end]
}

/** Prospective window for a claim the user is about to submit. */
export function prospectiveClaimWindowMs(
  offer: ClaimOfferModalOffer,
  claimData: ClaimData,
  nowMs: number = Date.now(),
): ClaimWindowMs {
  const ymd = scheduleYmdForOffer(offer.offerScheduleDate, nowMs)
  const baseDate = localDateAtNoon(ymd)
  const start = arrivalMsOnDay(ymd, claimData.arrivalTime) ?? baseDate.getTime()
  const end = new Date(
    computeOfferWindowCloseIso({
      baseDate,
      workingHoursEnd: offer.workingHoursEnd,
      offerEnd: offer.offerEnd,
      offerStart: offer.isAllDay ? undefined : offer.offerStart,
    }),
  ).getTime()
  return [start, end]
}

export function windowsOverlap(a: ClaimWindowMs, b: ClaimWindowMs): boolean {
  return a[0] < b[1] && b[0] < a[1]
}

export function isClaimStillActive(claim: ClaimedOffer, nowMs: number): boolean {
  const [, endMs] = claimWindowMs(claim)
  return nowMs < endMs
}

export function hasOtherClaimAtVenueOnDay(args: {
  offerId: string
  restaurantSlug: string
  offerScheduleDate: DateValue | undefined
  claimedByOfferId: Readonly<Record<string, ClaimedOffer>>
  nowMs: number
}): boolean {
  const offerDayYmd = scheduleYmdForOffer(args.offerScheduleDate, args.nowMs)

  return Object.values(args.claimedByOfferId).some((c) => {
    if (c.offerId === args.offerId) return false
    if (c.restaurantSlug !== args.restaurantSlug) return false
    const claimDayYmd = c.offerScheduleYmd ?? toLocalYmdFromMs(c.claimedAt)
    return claimDayYmd === offerDayYmd
  })
}

export function findOverlappingActiveClaim(args: {
  restaurantSlug: string
  offerId: string
  offer: ClaimOfferModalOffer
  claimData: ClaimData
  claimedByOfferId: Readonly<Record<string, ClaimedOffer>>
  nowMs?: number
}): ClaimedOffer | undefined {
  const nowMs = args.nowMs ?? Date.now()
  const newWindow = prospectiveClaimWindowMs(args.offer, args.claimData, nowMs)

  for (const claim of Object.values(args.claimedByOfferId)) {
    if (claim.offerId === args.offerId) continue
    if (claim.restaurantSlug === args.restaurantSlug) continue
    if (!isClaimStillActive(claim, nowMs)) continue
    if (windowsOverlap(newWindow, claimWindowMs(claim))) return claim
  }
  return undefined
}
