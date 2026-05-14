import { describe, expect, it } from "vitest"
import { DEFAULT_TIP_PERCENT_PRESETS, percentTipEur } from "./tipPresets"

describe("tipPresets", () => {
  it("computes rounded tip from receipt and percent", () => {
    expect(percentTipEur(50, 10)).toBe(5)
    expect(percentTipEur(50, 15)).toBe(7.5)
    expect(percentTipEur(50, 20)).toBe(10)
  })

  it("computes 5% tip", () => {
    expect(percentTipEur(100, 5)).toBe(5)
  })

  it("exports default presets matching Figma", () => {
    expect(DEFAULT_TIP_PERCENT_PRESETS).toEqual([5, 10, 15, 20])
  })
})
