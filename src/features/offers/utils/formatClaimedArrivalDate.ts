import type { ClaimedOffer } from "@/features/offers/offers.types"
import { toLocalYmd } from "@/features/offers/utils/offerScheduleLocal"

/** Locale for Figma `16123:18340` date copy: "Monday, 8 May" (day before month). */
const CLAIMED_ARRIVAL_DATE_LOCALE = "en-GB"

/**
 * Figma `16123:18340` — claimed-offer date row value prefix, e.g. "Monday, 8 May".
 * Same calendar day as `now` → **Today** (offer banners + details).
 */
export function formatClaimedArrivalDate(
  date: Date,
  now: Date = new Date(),
): string {
  if (toLocalYmd(date) === toLocalYmd(now)) {
    return "Today"
  }

  const weekday = new Intl.DateTimeFormat(CLAIMED_ARRIVAL_DATE_LOCALE, {
    weekday: "long",
  }).format(date)
  const dayMonth = new Intl.DateTimeFormat(CLAIMED_ARRIVAL_DATE_LOCALE, {
    day: "numeric",
    month: "long",
  }).format(date)
  return `${weekday}, ${dayMonth}`
}

function resolveClaimScheduleYmd(
  claim: Pick<ClaimedOffer, "offerScheduleYmd" | "claimedAt">,
): string {
  return claim.offerScheduleYmd ?? toLocalYmd(new Date(claim.claimedAt))
}

/** True when the claim's offer day is the device-local calendar day of `nowMs`. */
export function isClaimedOfferForToday(
  claim: Pick<ClaimedOffer, "offerScheduleYmd" | "claimedAt">,
  nowMs: number = Date.now(),
): boolean {
  return resolveClaimScheduleYmd(claim) === toLocalYmd(new Date(nowMs))
}

/** Display label for a claimed offer's calendar day (overrides stored copy when still today). */
export function resolveClaimedOfferDateLabel(
  claim: Pick<ClaimedOffer, "arrivalDate" | "offerScheduleYmd" | "claimedAt">,
  nowMs: number = Date.now(),
): string {
  if (isClaimedOfferForToday(claim, nowMs)) {
    return "Today"
  }
  return claim.arrivalDate
}
