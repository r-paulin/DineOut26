import { describe, expect, it } from "vitest"
import { formatDateChipLabel, getDateOptions } from "./dateOptions"

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

    for (let i = 1; i <= 6; i++) {
      const expected = new Date(now)
      expected.setDate(expected.getDate() + i)
      expect(rows[i].id).toBe(localDateId(expected))
    }
  })

  it("returns original value for invalid stored date", () => {
    expect(formatDateChipLabel("not-a-date")).toBe("not-a-date")
  })
})
