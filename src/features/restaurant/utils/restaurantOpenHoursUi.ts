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

export const HERO_STATUS_SOON_MINUTES = 30

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
  /** Same-day opening time label, e.g. `12:00`. */
  opensAtLabel: string
  /** Venue feed hours row subtitle (Figma `16123:18092`), e.g. `Closes 23:00`. */
  venueHoursRowSubtitle: string
}

/** Hero scrim pill — Figma `16004:24677`. */
export interface RestaurantHeroStatusPill {
  /** Left segment before the bullet (omitted when {@link showSecondary} is false). */
  primary: string
  /** Right segment after the bullet, e.g. `Closes 23:00`. */
  secondary: string | null
  showSecondary: boolean
  /** Full string for `aria-label`. */
  ariaLabel: string
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
  const opensAtLabel = formatHm(open)

  const openHoursSheetHeading = isOpenNow ? "Open now" : "Closed"
  const openHoursSheetSubtitle = isOpenNow
    ? `Closes at ${closesAtLabel}`
    : `Opens at ${opensAtLabel}`

  const venueHoursRowSubtitle = isOpenNow
    ? `Closes ${closesAtLabel}`
    : `Opens ${opensAtLabel}`

  return {
    isOpenNow,
    summaryRangeToday: row.range,
    openHoursSheetHeading,
    openHoursSheetSubtitle,
    closesAtLabel,
    opensAtLabel,
    venueHoursRowSubtitle,
  }
}

function todayRangeMinutes(
  now: Date,
  weekly: readonly RestaurantFixedOpenHoursRow[],
): { open: number; close: number; opensAtLabel: string; closesAtLabel: string } {
  const name = dayName(now)
  const row = weekly.find((r) => r.day === name) ?? weekly[1]!
  const { open, close } = parseDayRangeMinutes(row.range)
  return {
    open,
    close,
    opensAtLabel: formatHm(open),
    closesAtLabel: formatHm(close),
  }
}

/**
 * Hero status pill copy (prototype: same-day hours only).
 * @see Figma `16004:24677`
 */
export function buildRestaurantHeroStatusPill(
  now: Date,
  weekly: readonly RestaurantFixedOpenHoursRow[],
): RestaurantHeroStatusPill {
  const hours = buildOpenHoursUiState(now, weekly)
  const { open, close, opensAtLabel, closesAtLabel } = todayRangeMinutes(
    now,
    weekly,
  )
  const mins = now.getHours() * 60 + now.getMinutes()
  const isOpenNow = hours.isOpenNow

  if (isOpenNow) {
    const minsUntilClose = close - mins
    if (
      minsUntilClose > 0 &&
      minsUntilClose < HERO_STATUS_SOON_MINUTES
    ) {
      const secondary = `Closes ${closesAtLabel}`
      return {
        primary: "Closes soon",
        secondary,
        showSecondary: true,
        ariaLabel: `Closes soon, ${secondary}, working hours`,
      }
    }
    const secondary = `Closes ${closesAtLabel}`
    return {
      primary: "Open now",
      secondary,
      showSecondary: true,
      ariaLabel: `Open now, ${secondary}, working hours`,
    }
  }

  if (mins < open) {
    const minsUntilOpen = open - mins
    if (minsUntilOpen > 0 && minsUntilOpen < HERO_STATUS_SOON_MINUTES) {
      const secondary = `Opens ${opensAtLabel}`
      return {
        primary: "Opens soon",
        secondary,
        showSecondary: true,
        ariaLabel: `Opens soon, ${secondary}, working hours`,
      }
    }
  }

  const secondary = `Opens at ${opensAtLabel}`
  return {
    primary: "Closed",
    secondary,
    showSecondary: true,
    ariaLabel: `Closed, ${secondary}, working hours`,
  }
}

/** True when the pill may change within the next 31 minutes (for a light tick). */
export function heroStatusPillNeedsClockTick(
  now: Date,
  weekly: readonly RestaurantFixedOpenHoursRow[],
): boolean {
  const { open, close } = todayRangeMinutes(now, weekly)
  const mins = now.getHours() * 60 + now.getMinutes()
  const isOpenNow = close > open && mins >= open && mins < close

  if (isOpenNow) {
    const untilClose = close - mins
    return untilClose > 0 && untilClose <= HERO_STATUS_SOON_MINUTES + 1
  }
  if (mins < open) {
    const untilOpen = open - mins
    return untilOpen > 0 && untilOpen <= HERO_STATUS_SOON_MINUTES + 1
  }
  return false
}
