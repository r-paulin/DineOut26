import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { removeClaimedOfferById } from "./claimedOfferState"

function claim(offerId: string): ClaimedOffer {
  return {
    offerId,
    pin: "1234",
    offerWindowCloses: new Date().toISOString(),
    arrivalTime: "19:00",
    arrivalDate: "Monday, 8 May",
    guestCount: 2,
    paymentMethod: "dineout",
    discountPercent: 20,
    restaurantSlug: "neiburgs",
    claimedAt: Date.now(),
    offerScheduleYmd: "2026-05-08",
    cashbackAmount: 2.5,
    tipPresetAmounts: [5, 10, 15, 20],
    discountAddPercent: 40,
  }
}

describe("removeClaimedOfferById", () => {
  it("removes the matching offer id", () => {
    const prev = { a: claim("a"), b: claim("b") }
    expect(removeClaimedOfferById(prev, "a")).toEqual({ b: claim("b") })
  })

  it("returns the same reference when id is missing", () => {
    const prev = { a: claim("a") }
    expect(removeClaimedOfferById(prev, "missing")).toBe(prev)
  })
})
