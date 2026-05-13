import type { RestaurantFixedOpenHoursRow } from "@/features/restaurant/data/restaurantFixedOpenHours"

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

function dayName(d: Date): (typeof DAY_NAMES)[number] {
  return DAY_NAMES[d.getDay()]
}

function parseHm(s: string): number {
  const [h, rawM] = s.trim().split(":")
  const hh = Number.parseInt(h ?? "0", 10)
  const mm = Number.parseInt((rawM ?? "0").trim(), 10)
  if (Number.isNaN(hh)) return 0
  return hh * 60 + (Number.isNaN(mm) ? 0 : mm)
}

/** Parses `12:00 – 23:00` or `12:00 - 23:00` (en dash or hyphen). Same-day window only (prototype). */
export function parseDayRangeMinutes(range: string): { open: number; close: number } {
  const parts = range.split(/\s*[–-]\s*/)
  const open = parseHm(parts[0] ?? "0:00")
  const close = parseHm(parts[1] ?? "0:00")
  return { open, close }
}

export function formatHm(totalMin: number): string {
  const h = Math.floor(totalMin / 60) % 24
  const m = totalMin % 60
  return `${h}:${String(m).padStart(2, "0")}`
}

export interface RestaurantOpenHoursUi {
  isOpenNow: boolean
  /** Value line for venue / About rows, e.g. `12:00 – 23:00`. */
  summaryRangeToday: string
  /** Sheet main title: `Open now` or `Closed`. */
  openHoursSheetHeading: string
  /** Sheet subtitle only (no open state); e.g. `Closes at 23:00` / `Opens at 12:00`. */
  openHoursSheetSubtitle: string
  /** Hero pill “Closes …” time, e.g. `23:00`. */
  closesAtLabel: string
}

/**
 * Derives open/closed and display strings from a weekly grid and “now”
 * (prototype: local clock, same-day ranges only).
 */
export function buildOpenHoursUiState(
  now: Date,
  weekly: readonly RestaurantFixedOpenHoursRow[],
): RestaurantOpenHoursUi {
  const name = dayName(now)
  const row = weekly.find((r) => r.day === name) ?? weekly[1]!
  const { open, close } = parseDayRangeMinutes(row.range)
  const mins = now.getHours() * 60 + now.getMinutes()
  const isOpenNow = close > open && mins >= open && mins < close
  const closesAtLabel = formatHm(close)

  const openHoursSheetHeading = isOpenNow ? "Open now" : "Closed"
  const openHoursSheetSubtitle = isOpenNow
    ? `Closes at ${closesAtLabel}`
    : `Opens at ${formatHm(open)}`

  return {
    isOpenNow,
    summaryRangeToday: row.range,
    openHoursSheetHeading,
    openHoursSheetSubtitle,
    closesAtLabel,
  }
}
