import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { cancelOffer } from "./claimOffer"
import { removeClaimedOfferById } from "./claimedOfferState"

function claim(offerId: string): ClaimedOffer {
  return {
    offerId,
    pin: "1234",
    offerWindowCloses: "2026-05-08T21:00:00.000Z",
    arrivalTime: "19:00",
    arrivalDate: "Monday, 8 May",
    guestCount: 2,
    paymentMethod: "dineout",
    discountPercent: 20,
    restaurantSlug: "neiburgs",
    claimedAt: 1_700_000_000_000,
    offerScheduleYmd: "2026-05-08",
    cashbackAmount: 2.5,
    tipPresetAmounts: [5, 10, 15, 20],
    discountAddPercent: 40,
  }
}

describe("claimed offer cancel (local state)", () => {
  it("removeClaimedOfferById clears the offer so banner can return to available", () => {
    const prev = { dinner: claim("dinner") }
    const next = removeClaimedOfferById(prev, "dinner")
    expect(next).toEqual({})
    expect("dinner" in next).toBe(false)
  })

  it("cancelOffer prototype resolves for a valid offer id", async () => {
    await expect(cancelOffer("valid-offer")).resolves.toBeUndefined()
  })

  it("cancelOffer rejects empty offer id", async () => {
    await expect(cancelOffer("")).rejects.toThrow("Offer not found")
  })
})
