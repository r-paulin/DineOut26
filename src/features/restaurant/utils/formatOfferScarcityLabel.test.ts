import { describe, expect, it } from "vitest"
import { formatOfferScarcityLabel } from "./formatOfferScarcityLabel"

describe("formatOfferScarcityLabel", () => {
  it('uses "Only 1 left" for a single spot', () => {
    expect(formatOfferScarcityLabel(1)).toBe("Only 1 left")
  })

  it('uses "{n} left" for multiple spots', () => {
    expect(formatOfferScarcityLabel(7)).toBe("7 left")
    expect(formatOfferScarcityLabel(12)).toBe("12 left")
  })
})
