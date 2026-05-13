import { describe, expect, it } from "vitest"
import {
  discountAmountCompound,
  discountFirstEur,
  discountSecondEur,
  finalAmountCompound,
  round2,
  subtotalWithTip,
} from "./discountCalc"

describe("discountCalc", () => {
  it("round2", () => {
    expect(round2(1.005)).toBe(1.01)
    expect(round2(1.004)).toBe(1.0)
  })

  it("compound 30% then 0% on 50+5", () => {
    expect(subtotalWithTip(50, 5)).toBe(55)
    expect(finalAmountCompound(50, 5, 30, 0)).toBe(38.5)
    expect(discountAmountCompound(50, 5, 30, 0)).toBe(16.5)
  })

  it("compound 30% and 40% multiplicative", () => {
    const S = 55
    const f = S * 0.7 * 0.6
    expect(finalAmountCompound(50, 5, 30, 40)).toBe(round2(f))
    expect(discountAmountCompound(50, 5, 30, 40)).toBe(round2(S - f))
  })

  it("null tip uses receipt only", () => {
    expect(finalAmountCompound(100, null, 10, 10)).toBe(81)
  })

  it("split discount EURs sum to total discount (30% + 40%)", () => {
    const r = 50
    const t = 5
    const d1 = 30
    const d2 = 40
    const totalDisc = discountAmountCompound(r, t, d1, d2)
    const first = discountFirstEur(r, t, d1)
    const second = discountSecondEur(r, t, d1, d2)
    expect(round2(first + second)).toBe(totalDisc)
  })

  it("split discount when d2 is 0", () => {
    const r = 50
    const t = 5
    const d1 = 30
    const d2 = 0
    expect(discountFirstEur(r, t, d1)).toBe(16.5)
    expect(discountSecondEur(r, t, d1, d2)).toBe(0)
    expect(
      round2(
        discountFirstEur(r, t, d1) + discountSecondEur(r, t, d1, d2),
      ),
    ).toBe(discountAmountCompound(r, t, d1, d2))
  })

  it("split discount when d1 is 0", () => {
    const r = 100
    const t: number | null = null
    const d1 = 0
    const d2 = 20
    expect(discountFirstEur(r, t, d1)).toBe(0)
    expect(
      round2(
        discountFirstEur(r, t, d1) + discountSecondEur(r, t, d1, d2),
      ),
    ).toBe(discountAmountCompound(r, t, d1, d2))
  })
})
