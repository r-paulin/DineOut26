import { describe, expect, it } from "vitest"
import { RESTAURANT_WEEKLY_OPEN_HOURS } from "@/features/restaurant/data/restaurantFixedOpenHours"
import {
  buildOpenHoursUiState,
  buildRestaurantHeroStatusPill,
  findNextOpening,
  HERO_STATUS_SOON_MINUTES,
  isOpenAt,
  todayDayName,
} from "@/features/restaurant/utils/restaurantOpenHoursUi"

function atDay(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): Date {
  return new Date(year, month, day, hour, minute, 0, 0)
}

/** Sunday 17 May 2026 */
function atSunday(hour: number, minute = 0): Date {
  return atDay(2026, 4, 17, hour, minute)
}

/** Wednesday 20 May 2026 */
function atWednesday(hour: number, minute = 0): Date {
  return atDay(2026, 4, 20, hour, minute)
}

/** Monday 18 May 2026 */
function atMonday(hour: number, minute = 0): Date {
  return atDay(2026, 4, 18, hour, minute)
}

describe("buildOpenHoursUiState", () => {
  it("open on Sunday 14:00 → Open now, Closes at 22:00", () => {
    const ui = buildOpenHoursUiState(atSunday(14, 0), RESTAURANT_WEEKLY_OPEN_HOURS)
    expect(ui.isOpenNow).toBe(true)
    expect(ui.openHoursSheetHeading).toBe("Open now")
    expect(ui.openHoursSheetSubtitle).toBe("Closes at 22:00")
    expect(ui.venueHoursRowSubtitle).toBe("Closes 22:00")
  })

  it("closed Sunday 09:00 before open → Opens at 11:00 (no day)", () => {
    const ui = buildOpenHoursUiState(atSunday(9, 0), RESTAURANT_WEEKLY_OPEN_HOURS)
    expect(ui.isOpenNow).toBe(false)
    expect(ui.openHoursSheetSubtitle).toBe("Opens at 11:00")
    expect(ui.venueHoursRowSubtitle).toBe("Opens 11:00")
  })

  it("closed Wednesday 22:00 after close → Opens Thursday at 11:00", () => {
    const ui = buildOpenHoursUiState(
      atWednesday(22, 0),
      RESTAURANT_WEEKLY_OPEN_HOURS,
    )
    expect(ui.isOpenNow).toBe(false)
    expect(ui.openHoursSheetSubtitle).toBe("Opens Thursday at 11:00")
    expect(ui.venueHoursRowSubtitle).toBe("Opens Thu 11:00")
  })

  it("closed Monday (closed day) → Opens Tuesday at 11:00", () => {
    const ui = buildOpenHoursUiState(atMonday(12, 0), RESTAURANT_WEEKLY_OPEN_HOURS)
    expect(ui.isOpenNow).toBe(false)
    expect(ui.openHoursSheetSubtitle).toBe("Opens Tuesday at 11:00")
    expect(ui.venueHoursRowSubtitle).toBe("Opens Tue 11:00")
  })
})

describe("findNextOpening", () => {
  it("returns today when before opening on an open day", () => {
    const next = findNextOpening(atSunday(9, 0), RESTAURANT_WEEKLY_OPEN_HOURS)
    expect(next?.isToday).toBe(true)
    expect(next?.dayName).toBe("Sunday")
    expect(next?.opensAtLabel).toBe("11:00")
  })

  it("skips closed days when scanning forward", () => {
    const next = findNextOpening(atMonday(14, 0), RESTAURANT_WEEKLY_OPEN_HOURS)
    expect(next?.dayName).toBe("Tuesday")
    expect(next?.isToday).toBe(false)
  })
})

describe("isOpenAt", () => {
  it("returns false on closed days", () => {
    const row = RESTAURANT_WEEKLY_OPEN_HOURS[0]!
    expect(isOpenAt(atMonday(14, 0), row)).toBe(false)
  })

  it("supports midnight close windows", () => {
    const row = { day: "Saturday", range: "11:00 – 00:00" }
    expect(isOpenAt(atDay(2026, 4, 16, 23, 0), row)).toBe(true)
    expect(isOpenAt(atDay(2026, 4, 16, 10, 0), row)).toBe(false)
  })
})

describe("todayDayName", () => {
  it("matches calendar weekday", () => {
    expect(todayDayName(atSunday(12, 0))).toBe("Sunday")
    expect(todayDayName(atWednesday(12, 0))).toBe("Wednesday")
  })
})

describe("buildRestaurantHeroStatusPill", () => {
  it("shows Open now and closes time when open with plenty of time left", () => {
    const pill = buildRestaurantHeroStatusPill(
      atSunday(14, 0),
      RESTAURANT_WEEKLY_OPEN_HOURS,
    )
    expect(pill.primary).toBe("Open now")
    expect(pill.secondary).toBe("Closes 22:00")
    expect(pill.showSecondary).toBe(true)
  })

  it("shows Closes soon within 30 minutes of closing", () => {
    const pill = buildRestaurantHeroStatusPill(
      atSunday(21, 45),
      RESTAURANT_WEEKLY_OPEN_HOURS,
    )
    expect(pill.primary).toBe("Closes soon")
    expect(pill.secondary).toBe("Closes 22:00")
    expect(HERO_STATUS_SOON_MINUTES).toBe(30)
  })

  it("shows Opens soon within 30 minutes of opening", () => {
    const pill = buildRestaurantHeroStatusPill(
      atSunday(10, 45),
      RESTAURANT_WEEKLY_OPEN_HOURS,
    )
    expect(pill.primary).toBe("Opens soon")
    expect(pill.secondary).toBe("Opens 11:00")
    expect(pill.showSecondary).toBe(true)
  })

  it("shows Closed and Opens at when before open and not soon", () => {
    const pill = buildRestaurantHeroStatusPill(
      atSunday(9, 0),
      RESTAURANT_WEEKLY_OPEN_HOURS,
    )
    expect(pill.primary).toBe("Closed")
    expect(pill.secondary).toBe("Opens at 11:00")
    expect(pill.showSecondary).toBe(true)
  })

  it("shows Closed and next day when after today's closing time", () => {
    const pill = buildRestaurantHeroStatusPill(
      atSunday(23, 30),
      RESTAURANT_WEEKLY_OPEN_HOURS,
    )
    expect(pill.primary).toBe("Closed")
    expect(pill.secondary).toBe("Opens Tuesday at 11:00")
    expect(pill.showSecondary).toBe(true)
  })
})
