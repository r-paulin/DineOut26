import { describe, expect, it } from "vitest"
import {
  formatOfferClaimCardTitle,
  formatOfferDiscountTitle,
} from "@/features/offers/utils/formatOfferDiscountTitle"

describe("formatOfferDiscountTitle", () => {
  it("uses food copy for 10% all-day", () => {
    expect(formatOfferDiscountTitle(10, true)).toBe("10% discount on menu")
  })

  it("uses food copy for 10% timed window", () => {
    expect(formatOfferDiscountTitle(10, false)).toBe("10% discount on menu")
  })

  it("uses food copy for other all-day discounts", () => {
    expect(formatOfferDiscountTitle(20, true)).toBe("20% discount on menu")
  })
})

describe("formatOfferClaimCardTitle", () => {
  it("matches discount title for 10% all-day without Claim prefix", () => {
    expect(formatOfferClaimCardTitle(10, true)).toBe("10% discount on menu")
  })

  it("uses Claim prefix for standard offers", () => {
    expect(formatOfferClaimCardTitle(20, false)).toBe(
      "Claim 20% discount on menu",
    )
  })
})
