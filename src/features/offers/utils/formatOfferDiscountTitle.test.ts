import { describe, expect, it } from "vitest"
import {
  formatOfferBillDiscountTitle,
  formatOfferClaimCardTitle,
  formatOfferDiscountTitle,
} from "@/features/offers/utils/formatOfferDiscountTitle"

describe("formatOfferBillDiscountTitle", () => {
  it("formats bill discount headline", () => {
    expect(formatOfferBillDiscountTitle(20)).toBe("20% off your bill")
  })
})

describe("formatOfferDiscountTitle", () => {
  it("uses bill copy for 10% all-day", () => {
    expect(formatOfferDiscountTitle(10, true)).toBe("10% off your bill")
  })

  it("uses bill copy for 10% timed window", () => {
    expect(formatOfferDiscountTitle(10, false)).toBe("10% off your bill")
  })

  it("uses bill copy for other all-day discounts", () => {
    expect(formatOfferDiscountTitle(20, true)).toBe("20% off your bill")
  })
})

describe("formatOfferClaimCardTitle", () => {
  it("matches discount title for 10% all-day without Claim prefix", () => {
    expect(formatOfferClaimCardTitle(10, true)).toBe("10% off your bill")
  })

  it("uses Claim prefix for standard offers", () => {
    expect(formatOfferClaimCardTitle(20, false)).toBe(
      "Claim 20% off your bill",
    )
  })
})
