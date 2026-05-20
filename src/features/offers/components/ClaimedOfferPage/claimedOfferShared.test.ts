import { describe, expect, it } from "vitest"
import {
  formatClaimedOfferFoodLabel,
  formatGuestCountLabel,
  formatWelcomeAtRestaurant,
} from "./claimedOfferShared"

describe("formatClaimedOfferFoodLabel", () => {
  it("formats percent and food copy per Figma", () => {
    expect(formatClaimedOfferFoodLabel(30)).toBe("30% discount on food")
  })
})

describe("formatGuestCountLabel", () => {
  it("uses singular for 1 guest", () => {
    expect(formatGuestCountLabel(1)).toBe("1 guest")
  })
  it("uses plural for other counts", () => {
    expect(formatGuestCountLabel(0)).toBe("0 guests")
    expect(formatGuestCountLabel(2)).toBe("2 guests")
    expect(formatGuestCountLabel(10)).toBe("10 guests")
  })
})

describe("formatWelcomeAtRestaurant", () => {
  it("uses 'Welcome at' phrasing (Figma 16123:18340)", () => {
    expect(formatWelcomeAtRestaurant("Neiburgs")).toBe("Welcome at Neiburgs")
  })
})
