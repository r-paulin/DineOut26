import { describe, expect, it } from "vitest"
import {
  formatClaimedArrivalDate,
  isClaimedOfferForToday,
  resolveClaimedOfferDateLabel,
} from "./formatClaimedArrivalDate"

describe("formatClaimedArrivalDate", () => {
  it("formats weekday, day, and month per Figma 16123:18340", () => {
    const d = new Date(2026, 4, 8, 12, 0, 0, 0)
    const now = new Date(2026, 4, 7, 9, 0, 0, 0)
    expect(formatClaimedArrivalDate(d, now)).toBe("Friday, 8 May")
  })

  it("returns Today when date is the same local calendar day as now", () => {
    const d = new Date(2026, 5, 11, 13, 30, 0, 0)
    const now = new Date(2026, 5, 11, 9, 0, 0, 0)
    expect(formatClaimedArrivalDate(d, now)).toBe("Today")
  })
})

describe("isClaimedOfferForToday", () => {
  it("is true when offerScheduleYmd matches local today", () => {
    const nowMs = new Date(2026, 5, 11, 12, 0, 0, 0).getTime()
    expect(
      isClaimedOfferForToday(
        { offerScheduleYmd: "2026-06-11", claimedAt: nowMs },
        nowMs,
      ),
    ).toBe(true)
  })

  it("is false when offer is scheduled for another day", () => {
    const nowMs = new Date(2026, 5, 11, 12, 0, 0, 0).getTime()
    expect(
      isClaimedOfferForToday(
        { offerScheduleYmd: "2026-06-12", claimedAt: nowMs },
        nowMs,
      ),
    ).toBe(false)
  })

  it("falls back to claimedAt calendar day when schedule ymd is missing", () => {
    const claimedAt = new Date(2026, 5, 10, 18, 0, 0, 0).getTime()
    const nowMs = new Date(2026, 5, 10, 20, 0, 0, 0).getTime()
    expect(isClaimedOfferForToday({ claimedAt }, nowMs)).toBe(true)
    expect(
      isClaimedOfferForToday(
        { claimedAt },
        new Date(2026, 5, 11, 9, 0, 0, 0).getTime(),
      ),
    ).toBe(false)
  })
})

describe("resolveClaimedOfferDateLabel", () => {
  it("overrides stored weekday label when offer schedule is today", () => {
    const nowMs = new Date(2026, 5, 11, 12, 0, 0, 0).getTime()
    expect(
      resolveClaimedOfferDateLabel(
        {
          arrivalDate: "Thursday, 11 June",
          offerScheduleYmd: "2026-06-11",
          claimedAt: nowMs - 60_000,
        },
        nowMs,
      ),
    ).toBe("Today")
  })

  it("keeps stored label when offer schedule is not today", () => {
    const nowMs = new Date(2026, 5, 11, 12, 0, 0, 0).getTime()
    expect(
      resolveClaimedOfferDateLabel(
        {
          arrivalDate: "Friday, 12 June",
          offerScheduleYmd: "2026-06-12",
          claimedAt: nowMs,
        },
        nowMs,
      ),
    ).toBe("Friday, 12 June")
  })
})
