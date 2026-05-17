import { describe, expect, it } from "vitest"
import { RESTAURANT_WEEKLY_OPEN_HOURS } from "@/features/restaurant/data/restaurantFixedOpenHours"
import {
  buildRestaurantHeroStatusPill,
  HERO_STATUS_SOON_MINUTES,
} from "@/features/restaurant/utils/restaurantOpenHoursUi"

/** Sunday 17 May 2026 — matches prototype weekly grid. */
function atSunday(hour: number, minute = 0): Date {
  const d = new Date(2026, 4, 17, hour, minute, 0, 0)
  expect(d.getDay()).toBe(0)
  return d
}

describe("buildRestaurantHeroStatusPill", () => {
  it("shows Open now and closes time when open with plenty of time left", () => {
    const pill = buildRestaurantHeroStatusPill(
      atSunday(14, 0),
      RESTAURANT_WEEKLY_OPEN_HOURS,
    )
    expect(pill.primary).toBe("Open now")
    expect(pill.secondary).toBe("Closes 23:00")
    expect(pill.showSecondary).toBe(true)
  })

  it("shows Closes soon within 30 minutes of closing", () => {
    const pill = buildRestaurantHeroStatusPill(
      atSunday(22, 45),
      RESTAURANT_WEEKLY_OPEN_HOURS,
    )
    expect(pill.primary).toBe("Closes soon")
    expect(pill.secondary).toBe("Closes 23:00")
    expect(HERO_STATUS_SOON_MINUTES).toBe(30)
  })

  it("shows Opens soon within 30 minutes of opening", () => {
    const pill = buildRestaurantHeroStatusPill(
      atSunday(11, 45),
      RESTAURANT_WEEKLY_OPEN_HOURS,
    )
    expect(pill.primary).toBe("Opens soon")
    expect(pill.secondary).toBe("Opens 12:00")
    expect(pill.showSecondary).toBe(true)
  })

  it("shows Closed when before open and not soon", () => {
    const pill = buildRestaurantHeroStatusPill(
      atSunday(9, 0),
      RESTAURANT_WEEKLY_OPEN_HOURS,
    )
    expect(pill.primary).toBe("Closed")
    expect(pill.showSecondary).toBe(false)
    expect(pill.secondary).toBeNull()
  })
})
