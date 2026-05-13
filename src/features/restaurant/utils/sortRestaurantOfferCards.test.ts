import { describe, expect, it } from "vitest"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import { sortRestaurantOfferCardsByClaim } from "./sortRestaurantOfferCards"

const FAR_FUTURE_MS = 4102444800000

function offerCard(
  id: string,
  overrides: Partial<RestaurantOfferCardModel> = {},
): RestaurantOfferCardModel {
  return {
    id,
    expiresAt: FAR_FUTURE_MS,
    tags: ["enabled"],
    discountPercent: 10,
    title: "Claim 10% discount",
    date: "Today",
    timeWindow: "All day",
    restaurantImage: "/images/placeholder.png",
    ...overrides,
  }
}

describe("sortRestaurantOfferCardsByClaim", () => {
  it("places claimed offers first, then available, preserving order within each band", () => {
    const a = offerCard("neiburgs-today-offer-0")
    const b = offerCard("neiburgs-today-offer-1")
    const c = offerCard("neiburgs-today-offer-2")
    const claims = [{ offerId: "neiburgs-today-offer-1", claimedAt: 1 }]
    const sorted = sortRestaurantOfferCardsByClaim([a, b, c], claims)
    expect(sorted.map((x) => x.id)).toEqual([
      "neiburgs-today-offer-1",
      "neiburgs-today-offer-0",
      "neiburgs-today-offer-2",
    ])
  })

  it("places claimed first, then available, then expired", () => {
    const now = 1_700_000_000_000
    const available = offerCard("avail", { expiresAt: now + 1 })
    const expired = offerCard("exp", { expiresAt: now - 1 })
    const claimed = offerCard("cl", { expiresAt: now + 1 })
    const claims = [{ offerId: "cl", claimedAt: 1 }]
    const sorted = sortRestaurantOfferCardsByClaim(
      [expired, claimed, available],
      claims,
      now,
    )
    expect(sorted.map((x) => x.id)).toEqual(["cl", "avail", "exp"])
  })
})
