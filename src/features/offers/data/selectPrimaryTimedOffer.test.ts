import { describe, expect, it } from "vitest"
import {
  clampRemainingSpotsForDisplay,
  selectPrimaryTimedOffer,
  shouldShowScarcitySticker,
} from "@/features/offers/data/selectPrimaryTimedOffer"
import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"

describe("selectPrimaryTimedOffer", () => {
  it("ignores all-day and picks highest discount when no scarcity band", () => {
    const offers: RestaurantTimedOffer[] = [
      { discountPercent: 20, window: { kind: "all-day" } },
      {
        discountPercent: 35,
        window: { kind: "range", start: "18:00", end: "22:00" },
      },
    ]
    expect(selectPrimaryTimedOffer(offers)?.discountPercent).toBe(35)
  })

  it("prefers lowest remaining spots between 1 and 5", () => {
    const offers: RestaurantTimedOffer[] = [
      {
        discountPercent: 40,
        window: { kind: "range", start: "10:00", end: "13:00" },
        remainingSpots: 7,
      },
      {
        discountPercent: 30,
        window: { kind: "range", start: "19:00", end: "23:00" },
        remainingSpots: 3,
      },
    ]
    expect(selectPrimaryTimedOffer(offers)?.remainingSpots).toBe(3)
  })
})

describe("scarcity helpers", () => {
  it("clamps display spots to 5", () => {
    expect(clampRemainingSpotsForDisplay(12)).toBe(5)
    expect(clampRemainingSpotsForDisplay(3)).toBe(3)
    expect(clampRemainingSpotsForDisplay(0)).toBeUndefined()
  })

  it("shows sticker only when two or fewer spots remain", () => {
    expect(shouldShowScarcitySticker(1)).toBe(true)
    expect(shouldShowScarcitySticker(2)).toBe(true)
    expect(shouldShowScarcitySticker(3)).toBe(false)
    expect(shouldShowScarcitySticker(5)).toBe(false)
    expect(shouldShowScarcitySticker(undefined)).toBe(false)
  })
})
