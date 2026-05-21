import { describe, expect, it } from "vitest"
import {
  filterFutureSlots,
  formatMinutesToHHMM,
  generateQuarterHourSlots,
  getTimePickerConfig,
  isOfferUnclaimableByClock,
  parseHHMMToMinutes,
} from "./offerTimePicker"

const baseOffer = {
  workingHoursStart: "12:00",
  workingHoursEnd: "23:00",
}

function at(h: number, m: number, s = 0): Date {
  return new Date(2026, 4, 12, h, m, s, 0)
}

describe("generateQuarterHourSlots", () => {
  it("includes start and end per 15-minute steps", () => {
    expect(generateQuarterHourSlots("10:00", "12:00")).toEqual([
      "10:00",
      "10:15",
      "10:30",
      "10:45",
      "11:00",
      "11:15",
      "11:30",
      "11:45",
      "12:00",
    ])
  })

  it("spans midnight for overnight windows", () => {
    expect(generateQuarterHourSlots("22:00", "02:00")).toEqual([
      "22:00",
      "22:15",
      "22:30",
      "22:45",
      "23:00",
      "23:15",
      "23:30",
      "23:45",
      "00:00",
      "00:15",
      "00:30",
      "00:45",
      "01:00",
      "01:15",
      "01:30",
      "01:45",
      "02:00",
    ])
  })
})

describe("getTimePickerConfig — all-day (native)", () => {
  it("uses native mode with min = max(opening, now) and max = closing", () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: true,
        offerStart: "00:00",
        offerEnd: "23:59",
      },
      at(10, 0),
    )
    expect(cfg.mode).toBe("native")
    expect(cfg.minTime).toBe("12:00")
    expect(cfg.maxTime).toBe("23:00")
    expect(cfg.initialValue).toBe("12:00")
  })

  it("min follows device clock when after opening", () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: true,
        offerStart: "00:00",
        offerEnd: "23:59",
      },
      at(15, 30),
    )
    expect(cfg.minTime).toBe("15:30")
    expect(cfg.initialValue).toBe("15:30")
  })
})

describe("getTimePickerConfig — limited window (slots)", () => {
  it("returns future slots when now is before window", () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: false,
        offerStart: "10:00",
        offerEnd: "12:00",
      },
      at(9, 0),
    )
    expect(cfg.mode).toBe("slots")
    expect(cfg.slots).toEqual(generateQuarterHourSlots("10:00", "12:00"))
    expect(cfg.initialValue).toBe("10:00")
  })

  it("returns overnight slots when end is before start on the clock", () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: false,
        offerStart: "22:00",
        offerEnd: "02:00",
      },
      at(21, 0),
    )
    expect(cfg.mode).toBe("slots")
    expect(cfg.slots).toEqual(generateQuarterHourSlots("22:00", "02:00"))
    expect(cfg.initialValue).toBe("22:00")
  })

  it("filters past slots when now falls mid-window", () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: false,
        offerStart: "11:00",
        offerEnd: "12:00",
      },
      at(11, 30),
    )
    expect(cfg.slots).toEqual(["11:45", "12:00"])
    expect(cfg.initialValue).toBe("11:45")
  })

  it("returns empty slots when now is past offer end", () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: false,
        offerStart: "11:00",
        offerEnd: "12:00",
      },
      at(16, 0),
    )
    expect(cfg.slots).toEqual([])
  })

  it("falls back to native when quarter-hour grid is empty but min/max still allow arrival", () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: false,
        offerStart: "11:00",
        offerEnd: "12:00",
      },
      at(12, 0),
    )
    expect(cfg.mode).toBe("native")
    expect(cfg.minTime).toBe("12:00")
    expect(cfg.maxTime).toBe("12:00")
    expect(cfg.initialValue).toBe("12:00")
  })
})

describe("getTimePickerConfig — scheduled calendar day (future / past)", () => {
  it("keeps full window slots for a future schedule when device clock is past that window today", () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: false,
        offerStart: "11:00",
        offerEnd: "14:00",
      },
      at(16, 0),
      { offerScheduleDate: "2026-05-20" },
    )
    expect(cfg.mode).toBe("slots")
    expect(cfg.slots).toEqual(generateQuarterHourSlots("11:00", "14:00"))
    expect(cfg.initialValue).toBe("11:00")
  })

  it("does not clamp all-day min to now on a future schedule day", () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: true,
        offerStart: "00:00",
        offerEnd: "23:59",
      },
      at(15, 30),
      { offerScheduleDate: "2026-05-20" },
    )
    expect(cfg.mode).toBe("native")
    expect(cfg.minTime).toBe("12:00")
    expect(cfg.initialValue).toBe("12:00")
  })

  it("returns empty slots for a past schedule day (limited window)", () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: false,
        offerStart: "11:00",
        offerEnd: "14:00",
      },
      at(12, 0),
      { offerScheduleDate: "2026-05-10" },
    )
    expect(cfg.mode).toBe("slots")
    expect(cfg.slots).toEqual([])
  })

  it('treats explicit "today" like the device local date', () => {
    const cfg = getTimePickerConfig(
      {
        ...baseOffer,
        isAllDay: false,
        offerStart: "11:00",
        offerEnd: "12:00",
      },
      at(11, 30),
      { offerScheduleDate: "today" },
    )
    expect(cfg.slots).toEqual(["11:45", "12:00"])
  })
})

describe("isOfferUnclaimableByClock", () => {
  it("is true when limited window has no future slots", () => {
    expect(
      isOfferUnclaimableByClock(
        { ...baseOffer, isAllDay: false, offerStart: "11:00", offerEnd: "12:00" },
        at(16, 0),
      ),
    ).toBe(true)
  })

  it("is false when limited window still has slots", () => {
    expect(
      isOfferUnclaimableByClock(
        { ...baseOffer, isAllDay: false, offerStart: "19:00", offerEnd: "21:00" },
        at(18, 0),
      ),
    ).toBe(false)
  })

  it("is true for all-day when now is past venue close (min > max)", () => {
    expect(
      isOfferUnclaimableByClock(
        {
          ...baseOffer,
          isAllDay: true,
          offerStart: "12:00",
          offerEnd: "23:00",
        },
        at(23, 15),
      ),
    ).toBe(true)
  })

  it("is false for all-day when still inside venue hours", () => {
    expect(
      isOfferUnclaimableByClock(
        {
          ...baseOffer,
          isAllDay: true,
          offerStart: "12:00",
          offerEnd: "23:00",
        },
        at(15, 0),
      ),
    ).toBe(false)
  })
})

describe("filterFutureSlots", () => {
  it("drops slot equal to current minute", () => {
    const slots = ["11:30", "11:45", "12:00"]
    expect(filterFutureSlots(slots, at(11, 30))).toEqual(["11:45", "12:00"])
  })
})

describe("parseHHMMToMinutes / formatMinutesToHHMM", () => {
  it("round-trips", () => {
    const m = parseHHMMToMinutes("09:05")
    expect(m).not.toBeNull()
    expect(formatMinutesToHHMM(m!)).toBe("09:05")
  })

  it("returns null for invalid input", () => {
    expect(parseHHMMToMinutes("")).toBeNull()
    expect(parseHHMMToMinutes("25:00")).toBeNull()
    expect(parseHHMMToMinutes("12:99")).toBeNull()
    expect(parseHHMMToMinutes("not-a-time")).toBeNull()
  })
})
