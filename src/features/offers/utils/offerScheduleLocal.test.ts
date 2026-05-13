import { describe, expect, it } from "vitest"
import {
  compareYmd,
  localDateAtNoon,
  offerWindowBaseDateFromSchedule,
  resolveScheduleYmd,
  toLocalYmd,
} from "./offerScheduleLocal"

describe("offerScheduleLocal", () => {
  const may12 = new Date(2026, 4, 12, 10, 0, 0, 0)

  it("toLocalYmd formats device local calendar", () => {
    expect(toLocalYmd(may12)).toBe("2026-05-12")
  })

  it("resolveScheduleYmd maps today to local YMD", () => {
    expect(resolveScheduleYmd("today", may12)).toBe("2026-05-12")
  })

  it("compareYmd orders lexicographically", () => {
    expect(compareYmd("2026-05-10", "2026-05-12")).toBe(-1)
    expect(compareYmd("2026-05-12", "2026-05-12")).toBe(0)
    expect(compareYmd("2026-05-20", "2026-05-12")).toBe(1)
  })

  it("localDateAtNoon returns noon local", () => {
    const d = localDateAtNoon("2026-05-20")
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(4)
    expect(d.getDate()).toBe(20)
    expect(d.getHours()).toBe(12)
  })

  it("offerWindowBaseDateFromSchedule returns undefined when schedule absent", () => {
    expect(offerWindowBaseDateFromSchedule(undefined, may12)).toBeUndefined()
  })

  it("offerWindowBaseDateFromSchedule resolves today", () => {
    const d = offerWindowBaseDateFromSchedule("today", may12)!
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(4)
    expect(d.getDate()).toBe(12)
    expect(d.getHours()).toBe(12)
  })
})
