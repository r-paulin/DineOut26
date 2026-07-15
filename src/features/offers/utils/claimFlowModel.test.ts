import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { findActiveClaimForRestaurant } from "@/features/offers/utils/claimFlowModel"
import type { RestaurantDetailModel } from "@/features/restaurant/restaurantDetail.types"

const nowMs = new Date(2026, 6, 15, 12, 0, 0, 0).getTime()

const model = {
  slug: "neiburgs",
  offersByTabId: {
    tomorrow: [{ id: "offer-tomorrow" }],
    today: [{ id: "offer-today" }],
  },
} as unknown as RestaurantDetailModel

function claim(overrides: Partial<ClaimedOffer>): ClaimedOffer {
  return {
    pin: "1234",
    offerWindowCloses: new Date(nowMs + 3_600_000).toISOString(),
    arrivalTime: "12:00",
    arrivalDate: "Today",
    guestCount: 2,
    paymentMethod: "dineout",
    discountPercent: 15,
    restaurantSlug: "neiburgs",
    offerId: "offer-today",
    claimedAt: nowMs,
    offerScheduleYmd: "2026-07-15",
    ...overrides,
  }
}

describe("findActiveClaimForRestaurant", () => {
  it("returns a claim scheduled for today", () => {
    const claimed = {
      "offer-today": claim({ offerId: "offer-today", offerScheduleYmd: "2026-07-15" }),
    }
    expect(
      findActiveClaimForRestaurant("neiburgs", model, claimed, nowMs)?.offerId,
    ).toBe("offer-today")
  })

  it("ignores future-day claims so the at-venue bar stays hidden", () => {
    const claimed = {
      "offer-tomorrow": claim({
        offerId: "offer-tomorrow",
        offerScheduleYmd: "2026-07-16",
        arrivalDate: "Thursday, 16 July",
      }),
    }
    expect(
      findActiveClaimForRestaurant("neiburgs", model, claimed, nowMs),
    ).toBeUndefined()
  })

  it("prefers today’s claim when a future claim also exists", () => {
    const claimed = {
      "offer-tomorrow": claim({
        offerId: "offer-tomorrow",
        offerScheduleYmd: "2026-07-16",
      }),
      "offer-today": claim({
        offerId: "offer-today",
        offerScheduleYmd: "2026-07-15",
      }),
    }
    expect(
      findActiveClaimForRestaurant("neiburgs", model, claimed, nowMs)?.offerId,
    ).toBe("offer-today")
  })
})
