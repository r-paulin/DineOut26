import { describe, expect, it } from "vitest"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import {
  formatRestaurantOfferTabDiscountLabel,
  resolveRestaurantOfferTabDiscountLabel,
} from "./restaurantOfferTabDiscountLabel"

function offerCard(discountPercent: number): RestaurantOfferCardModel {
  return {
    id: `offer-${discountPercent}`,
    expiresAt: Number.MAX_SAFE_INTEGER,
    tags: ["enabled"],
    discountPercent,
    title: `Claim ${discountPercent}% discount`,
    date: "Today",
    timeWindow: "All day",
    restaurantImage: "/images/placeholder.png",
  }
}

describe("formatRestaurantOfferTabDiscountLabel", () => {
  it("formats percent off copy", () => {
    expect(formatRestaurantOfferTabDiscountLabel(20)).toBe("-20%")
  })
})

describe("resolveRestaurantOfferTabDiscountLabel", () => {
  const cards = [offerCard(20), offerCard(15)]

  it("uses highest discount from that date's offers", () => {
    expect(resolveRestaurantOfferTabDiscountLabel(cards)).toBe("-20%")
  })

  it("returns null when no cards", () => {
    expect(resolveRestaurantOfferTabDiscountLabel([])).toBeNull()
  })
})
