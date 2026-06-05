import { describe, expect, it } from "vitest"
import {
  formatRestaurantOfferTabDiscountLabel,
  resolveRestaurantOfferTabDiscountLabel,
} from "./restaurantOfferTabDiscountLabel"

describe("formatRestaurantOfferTabDiscountLabel", () => {
  it("formats percent off copy", () => {
    expect(formatRestaurantOfferTabDiscountLabel(20)).toBe("20% off")
  })
})

describe("resolveRestaurantOfferTabDiscountLabel", () => {
  const cards = [
    { discountPercent: 20 },
    { discountPercent: 15 },
  ] as const

  it("uses highest tier for first offer day", () => {
    expect(resolveRestaurantOfferTabDiscountLabel(cards, 0)).toBe("20% off")
  })

  it("uses next tier for second offer day when multiple discounts exist", () => {
    expect(resolveRestaurantOfferTabDiscountLabel(cards, 1)).toBe("15% off")
  })

  it("returns null when no cards", () => {
    expect(resolveRestaurantOfferTabDiscountLabel([], 0)).toBeNull()
  })
})
