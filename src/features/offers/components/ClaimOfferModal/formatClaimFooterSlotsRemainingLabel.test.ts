import { describe, expect, it } from "vitest"
import { formatClaimFooterSlotsRemainingLabel } from "./formatClaimFooterSlotsRemainingLabel"

describe("formatClaimFooterSlotsRemainingLabel", () => {
  it("uses Figma copy for multiple slots", () => {
    expect(formatClaimFooterSlotsRemainingLabel(2)).toBe("Only 2 offers left")
    expect(formatClaimFooterSlotsRemainingLabel(5)).toBe("Only 5 offers left")
  })

  it("uses urgency copy when one slot remains", () => {
    expect(formatClaimFooterSlotsRemainingLabel(1)).toBe(
      "Almost full — 1 offer left",
    )
  })
})
