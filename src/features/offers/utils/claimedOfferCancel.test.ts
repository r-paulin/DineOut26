import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { cancelOffer } from "./claimOffer"
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
    discountAddPercent: 20,
  }
}

describe("claimed offer cancel (local state)", () => {
  it("removeClaimedOfferById clears the offer so banner can return to available", () => {
    const prev = { dinner: claim("dinner") }
    const next = removeClaimedOfferById(prev, "dinner")
    expect(next).toEqual({})
    expect("dinner" in next).toBe(false)
  })

  it("cancelOffer prototype does not throw (API stub)", () => {
    expect(() => cancelOffer("any-id")).not.toThrow()
  })
})
