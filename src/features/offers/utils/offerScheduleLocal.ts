import type { DateValue } from "@/features/search/filters.types"

function pad2(value: number): string {
  return value.toString().padStart(2, "0")
}

/** Device-local calendar day `YYYY-MM-DD` for `date`. */
export function toLocalYmd(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/**
 * Resolves `"today"` to the local YMD of `now`; passes through `YYYY-MM-DD`.
 */
export function resolveScheduleYmd(
  offerScheduleDate: DateValue,
  now: Date,
): string {
  if (offerScheduleDate === "today") return toLocalYmd(now)
  return offerScheduleDate
}

/** Lexicographic compare of `YYYY-MM-DD` strings. */
export function compareYmd(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Local noon on `ymd` (`YYYY-MM-DD`) — stable anchor for same-day ISO math
 * (e.g. {@link computeOfferWindowCloseIso}).
 */
export function localDateAtNoon(ymd: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return new Date(ymd)
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  return new Date(y, mo, d, 12, 0, 0, 0)
}

/** Local noon on the offer’s calendar day; `undefined` if schedule is unknown. */
export function offerWindowBaseDateFromSchedule(
  offerScheduleDate: DateValue | undefined,
  now: Date,
): Date | undefined {
  if (offerScheduleDate == null) return undefined
  return localDateAtNoon(resolveScheduleYmd(offerScheduleDate, now))
}
