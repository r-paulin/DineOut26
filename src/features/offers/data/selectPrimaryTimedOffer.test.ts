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
      { discountPercent: 10, window: { kind: "all-day" } },
      {
        discountPercent: 25,
        window: { kind: "range", start: "18:00", end: "22:00" },
      },
    ]
    expect(selectPrimaryTimedOffer(offers)?.discountPercent).toBe(25)
  })

  it("prefers lowest remaining spots between 1 and 5", () => {
    const offers: RestaurantTimedOffer[] = [
      {
        discountPercent: 30,
        window: { kind: "range", start: "10:00", end: "13:00" },
        remainingSpots: 7,
      },
      {
        discountPercent: 20,
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

  it("shows sticker only for 1–5", () => {
    expect(shouldShowScarcitySticker(1)).toBe(true)
    expect(shouldShowScarcitySticker(5)).toBe(true)
    expect(shouldShowScarcitySticker(6)).toBe(false)
    expect(shouldShowScarcitySticker(undefined)).toBe(false)
  })
})
