import { describe, expect, it } from "vitest"
import { formatOfferBannerValidityTime } from "./formatOfferBannerValidityTime"

describe("formatOfferBannerValidityTime", () => {
  it("strips Arrive between prefix and uses an en dash range", () => {
    expect(
      formatOfferBannerValidityTime("Arrive between 11:00 - 14:00"),
    ).toBe("11:00–14:00")
  })

  it("is case-insensitive on prefix", () => {
    expect(
      formatOfferBannerValidityTime("ARRIVE BETWEEN 10:00 - 17:00"),
    ).toBe("10:00–17:00")
  })

  it("normalizes spaced en/em dashes to a tight en dash", () => {
    expect(formatOfferBannerValidityTime("12:00 — 17:00")).toBe("12:00–17:00")
    expect(formatOfferBannerValidityTime("12:00 – 17:00")).toBe("12:00–17:00")
  })

  it("passes through All day", () => {
    expect(formatOfferBannerValidityTime("All day")).toBe("All day")
  })
})
