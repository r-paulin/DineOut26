import { describe, expect, it } from "vitest"
import {
  formatDateChipLabel,
  formatDateTimeChipLabel,
  getDateOptions,
  normalizeFilterDate,
  toLocalDateId,
} from "./dateOptions"

function localDateId(value: Date): string {
  const year = value.getFullYear()
  const month = (value.getMonth() + 1).toString().padStart(2, "0")
  const day = value.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

describe("dateOptions", () => {
  it("builds date ids from local calendar days", () => {
    const now = new Date(2026, 0, 1, 23, 30, 0, 0)
    const rows = getDateOptions(now)

    expect(rows).toHaveLength(7)
    expect(rows[0]).toEqual({ id: "today", label: "Today" })
    expect(rows[1]?.label).toBe("Tomorrow")

    for (let i = 1; i <= 6; i++) {
      const expected = new Date(now)
      expected.setDate(expected.getDate() + i)
      expect(rows[i]?.id).toBe(localDateId(expected))
    }
  })

  it("returns original value for invalid stored date", () => {
    expect(formatDateChipLabel("not-a-date")).toBe("not-a-date")
  })

  it("formats combined date + time chip labels", () => {
    const rows = getDateOptions(new Date(2026, 0, 1, 12, 0, 0, 0))
    expect(formatDateTimeChipLabel("today", "Anytime", rows)).toBe(
      "Today, Anytime",
    )
    expect(
      formatDateTimeChipLabel(rows[1]!.id, "12:00–15:00", rows),
    ).toBe("Tomorrow, 12:00–15:00")
  })

  it("normalizes ISO that equals calendar today to today", () => {
    const now = new Date(2026, 6, 15, 9, 0, 0, 0)
    expect(normalizeFilterDate(toLocalDateId(now), now)).toBe("today")
  })

  it("drops past dates and dates outside the 7-day wheel", () => {
    const now = new Date(2026, 6, 15, 9, 0, 0, 0)
    expect(normalizeFilterDate("2026-07-14", now)).toBe("today")
    expect(normalizeFilterDate("2026-08-01", now)).toBe("today")
  })

  it("keeps in-window future ISO dates", () => {
    const now = new Date(2026, 6, 15, 9, 0, 0, 0)
    const tomorrow = new Date(2026, 6, 16, 12, 0, 0, 0)
    expect(normalizeFilterDate(toLocalDateId(tomorrow), now)).toBe(
      toLocalDateId(tomorrow),
    )
  })
})
