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

  return formatClaimedArrivalWeekdayDate(date)
}

/** Always weekday + day + month (never “Today”) — success screen subtitle. */
export function formatClaimedArrivalWeekdayDate(date: Date): string {
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

function parseLocalYmdToDate(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  const date = new Date(y, mo, d, 12, 0, 0, 0)
  return Number.isFinite(date.getTime()) ? date : null
}

function resolveClaimCalendarDate(
  claim: Pick<ClaimedOffer, "offerScheduleYmd" | "claimedAt">,
): Date {
  const ymd = resolveClaimScheduleYmd(claim)
  return parseLocalYmdToDate(ymd) ?? new Date(claim.claimedAt)
}

/**
 * Figma `17421:31561` — e.g. `Monday, 17 May at 19:00`.
 * Uses weekday format even when the offer day is today.
 */
export function formatClaimOfferSuccessArrivalSubtitle(
  claim: Pick<
    ClaimedOffer,
    "arrivalTime" | "offerScheduleYmd" | "claimedAt"
  >,
): string {
  const dateLabel = formatClaimedArrivalWeekdayDate(resolveClaimCalendarDate(claim))
  return `${dateLabel} at ${claim.arrivalTime}`
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
