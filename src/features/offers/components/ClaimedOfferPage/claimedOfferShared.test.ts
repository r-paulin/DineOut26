import { describe, expect, it } from "vitest"
import {
  formatClaimedOfferFoodLabel,
  formatClaimedOfferPaymentLabel,
  formatGuestCountLabel,
  formatWelcomeAtRestaurant,
  isClaimCheckedIn,
} from "./claimedOfferShared"

describe("formatClaimedOfferFoodLabel", () => {
  it("formats percent and food copy per Figma", () => {
    expect(formatClaimedOfferFoodLabel(30)).toBe("30% off your bill")
  })
})

describe("formatGuestCountLabel", () => {
  it("uses singular for 1 person", () => {
    expect(formatGuestCountLabel(1)).toBe("1 person")
  })
  it("uses plural for other counts", () => {
    expect(formatGuestCountLabel(0)).toBe("0 people")
    expect(formatGuestCountLabel(2)).toBe("2 people")
    expect(formatGuestCountLabel(10)).toBe("10 people")
  })
})

describe("formatWelcomeAtRestaurant", () => {
  it("uses legacy welcome phrasing", () => {
    expect(formatWelcomeAtRestaurant("Neiburgs")).toBe("Welcome at Neiburgs")
  })
})

describe("formatClaimedOfferPaymentLabel", () => {
  it("uses Figma 17459 detail row copy", () => {
    expect(formatClaimedOfferPaymentLabel("dineout")).toBe("Pay with Bolt Food")
    expect(formatClaimedOfferPaymentLabel("card_or_cash")).toBe(
      "Pay by card or cash",
    )
  })
})

describe("isClaimCheckedIn", () => {
  it("returns false without checkedInAt", () => {
    expect(isClaimCheckedIn({})).toBe(false)
  })

  it("returns true when checkedInAt is set", () => {
    expect(isClaimCheckedIn({ checkedInAt: 1 })).toBe(true)
  })
})
