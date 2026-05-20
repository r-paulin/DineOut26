import { describe, expect, it } from "vitest"
import { formatClaimedArrivalDate } from "./formatClaimedArrivalDate"

describe("formatClaimedArrivalDate", () => {
  it("formats weekday, day, and month per Figma 16123:18340", () => {
    const d = new Date(2026, 4, 8, 12, 0, 0, 0)
    expect(formatClaimedArrivalDate(d)).toBe("Friday, 8 May")
  })
})
