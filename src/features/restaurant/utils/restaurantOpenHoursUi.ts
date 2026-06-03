import {
  isClosedDayRange,
  type RestaurantFixedOpenHoursRow,
} from "@/features/restaurant/data/restaurantFixedOpenHours"

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

export type DayName = (typeof DAY_NAMES)[number]

export function todayDayName(d: Date): DayName {
  return DAY_NAMES[d.getDay()]
}

function parseHm(s: string): number {
  const [h, rawM] = s.trim().split(":")
  const hh = Number.parseInt(h ?? "0", 10)
  const mm = Number.parseInt((rawM ?? "0").trim(), 10)
  if (Number.isNaN(hh)) return 0
  return hh * 60 + (Number.isNaN(mm) ? 0 : mm)
}

/** Parses `12:00 – 23:00` or `12:00 - 23:00` (en dash or hyphen). */
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

function abbrevDayName(full: string): string {
  return full.slice(0, 3)
}

function rowForDay(
  weekly: readonly RestaurantFixedOpenHoursRow[],
  name: DayName,
): RestaurantFixedOpenHoursRow {
  return weekly.find((r) => r.day === name) ?? weekly[0]!
}

function minutesNow(now: Date): number {
  return now.getHours() * 60 + now.getMinutes()
}

/** True when `now` falls inside today's opening window (supports midnight close). */
export function isOpenAt(
  now: Date,
  row: RestaurantFixedOpenHoursRow,
): boolean {
  if (isClosedDayRange(row.range)) return false
  const { open, close } = parseDayRangeMinutes(row.range)
  const mins = minutesNow(now)
  if (close <= open) {
    return mins >= open
  }
  return mins >= open && mins < close
}

export interface NextOpening {
  dayName: DayName
  opensAtLabel: string
  isToday: boolean
}

/** Next time the venue opens (for closed-state subtitles). */
export function findNextOpening(
  now: Date,
  weekly: readonly RestaurantFixedOpenHoursRow[],
): NextOpening | null {
  const today = todayDayName(now)
  const mins = minutesNow(now)
  const todayRow = rowForDay(weekly, today)

  if (!isClosedDayRange(todayRow.range)) {
    const { open } = parseDayRangeMinutes(todayRow.range)
    if (mins < open) {
      return {
        dayName: today,
        opensAtLabel: formatHm(open),
        isToday: true,
      }
    }
  }

  const startIdx = DAY_NAMES.indexOf(today)
  for (let offset = 1; offset <= 7; offset++) {
    const name = DAY_NAMES[(startIdx + offset) % 7]!
    const row = rowForDay(weekly, name)
    if (!isClosedDayRange(row.range)) {
      const { open } = parseDayRangeMinutes(row.range)
      return {
        dayName: name,
        opensAtLabel: formatHm(open),
        isToday: false,
      }
    }
  }
  return null
}

function formatSheetOpensSubtitle(next: NextOpening): string {
  return next.isToday
    ? `Opens at ${next.opensAtLabel}`
    : `Opens ${next.dayName} at ${next.opensAtLabel}`
}

function formatVenueOpensSubtitle(next: NextOpening): string {
  return next.isToday
    ? `Opens ${next.opensAtLabel}`
    : `Opens ${abbrevDayName(next.dayName)} ${next.opensAtLabel}`
}

export const HERO_STATUS_SOON_MINUTES = 30

export interface RestaurantOpenHoursUi {
  isOpenNow: boolean
  /** Value line for venue / About rows, e.g. `11:00 – 22:00`. */
  summaryRangeToday: string
  /** Sheet main title: `Open now` or `Closed`. */
  openHoursSheetHeading: string
  /** Sheet subtitle only; e.g. `Closes at 22:00` / `Opens Thursday at 11:00`. */
  openHoursSheetSubtitle: string
  /** Hero pill “Closes …” time, e.g. `22:00`. */
  closesAtLabel: string
  /** Same-day opening time label, e.g. `11:00`. */
  opensAtLabel: string
  /** Venue feed hours row subtitle (Figma `16123:18092`), e.g. `Closes 22:00`. */
  venueHoursRowSubtitle: string
}

/** Hero scrim pill — Figma `16004:24677`. */
export interface RestaurantHeroStatusPill {
  primary: string
  secondary: string | null
  showSecondary: boolean
  ariaLabel: string
}

/**
 * Derives open/closed and display strings from a weekly grid and “now”.
 */
export function buildOpenHoursUiState(
  now: Date,
  weekly: readonly RestaurantFixedOpenHoursRow[],
): RestaurantOpenHoursUi {
  const name = todayDayName(now)
  const row = rowForDay(weekly, name)
  const isOpenNow = isOpenAt(now, row)

  let closesAtLabel = "00:00"
  let opensAtLabel = "11:00"
  if (!isClosedDayRange(row.range)) {
    const { open, close } = parseDayRangeMinutes(row.range)
    closesAtLabel = formatHm(close)
    opensAtLabel = formatHm(open)
  }

  const openHoursSheetHeading = isOpenNow ? "Open now" : "Closed"
  let openHoursSheetSubtitle: string
  let venueHoursRowSubtitle: string

  if (isOpenNow) {
    openHoursSheetSubtitle = `Closes at ${closesAtLabel}`
    venueHoursRowSubtitle = `Closes ${closesAtLabel}`
  } else {
    const next = findNextOpening(now, weekly)
    if (next) {
      openHoursSheetSubtitle = formatSheetOpensSubtitle(next)
      venueHoursRowSubtitle = formatVenueOpensSubtitle(next)
    } else {
      openHoursSheetSubtitle = "Closed"
      venueHoursRowSubtitle = "Closed"
    }
  }

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
): {
  open: number
  close: number
  opensAtLabel: string
  closesAtLabel: string
  row: RestaurantFixedOpenHoursRow
} {
  const row = rowForDay(weekly, todayDayName(now))
  if (isClosedDayRange(row.range)) {
    return { open: 0, close: 0, opensAtLabel: "00:00", closesAtLabel: "00:00", row }
  }
  const { open, close } = parseDayRangeMinutes(row.range)
  return {
    open,
    close,
    opensAtLabel: formatHm(open),
    closesAtLabel: formatHm(close),
    row,
  }
}

/**
 * Hero status pill copy.
 * @see Figma `16004:24677`
 */
export function buildRestaurantHeroStatusPill(
  now: Date,
  weekly: readonly RestaurantFixedOpenHoursRow[],
): RestaurantHeroStatusPill {
  const hours = buildOpenHoursUiState(now, weekly)
  const { open, opensAtLabel, closesAtLabel, row } = todayRangeMinutes(now, weekly)
  const mins = minutesNow(now)
  const isOpenNow = hours.isOpenNow
  const todayClosed = isClosedDayRange(row.range)

  if (isOpenNow) {
    const { open, close } = parseDayRangeMinutes(row.range)
    const minsUntilClose = close <= open ? 24 * 60 - mins : close - mins
    if (minsUntilClose > 0 && minsUntilClose < HERO_STATUS_SOON_MINUTES) {
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

  if (!todayClosed && mins < open) {
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

  const next = findNextOpening(now, weekly)
  const secondary = next ? formatSheetOpensSubtitle(next) : "Closed"
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
  const { open, close, row } = todayRangeMinutes(now, weekly)
  const mins = minutesNow(now)
  const isOpenNow = isOpenAt(now, row)

  if (isOpenNow) {
    const effectiveClose = close <= open ? 24 * 60 : close
    const untilClose = effectiveClose - mins
    return untilClose > 0 && untilClose <= HERO_STATUS_SOON_MINUTES + 1
  }
  if (!isClosedDayRange(row.range) && mins < open) {
    const untilOpen = open - mins
    return untilOpen > 0 && untilOpen <= HERO_STATUS_SOON_MINUTES + 1
  }
  return false
}
