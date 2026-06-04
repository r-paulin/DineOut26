import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import {
  claimWindowMs,
  findOverlappingActiveClaim,
  hasOtherClaimAtVenueOnDay,
  isClaimStillActive,
  prospectiveClaimWindowMs,
  windowsOverlap,
} from "./claimConflict"

const may18_2026_14_00 = new Date(2026, 4, 18, 14, 0, 0, 0).getTime()

function claim(
  partial: Partial<ClaimedOffer> & Pick<ClaimedOffer, "offerId" | "restaurantSlug">,
): ClaimedOffer {
  return {
    pin: "1234",
    offerWindowCloses: new Date(2026, 4, 18, 21, 0, 0, 0).toISOString(),
    arrivalTime: "14:00",
    arrivalDate: "Sunday, 18 May",
    guestCount: 2,
    paymentMethod: "dineout",
    discountPercent: 30,
    claimedAt: may18_2026_14_00,
    offerScheduleYmd: "2026-05-18",
    ...partial,
  }
}

describe("windowsOverlap", () => {
  it("detects overlapping intervals", () => {
    expect(windowsOverlap([10, 20], [15, 25])).toBe(true)
  })

  it("is false when one ends before the other starts", () => {
    expect(windowsOverlap([10, 15], [15, 20])).toBe(false)
    expect(windowsOverlap([10, 14], [14, 20])).toBe(false)
  })
})

describe("hasOtherClaimAtVenueOnDay", () => {
  it("is false for a claim at another restaurant on the same day", () => {
    const claimedByOfferId = {
      a: claim({ offerId: "a", restaurantSlug: "venue-a" }),
    }
    expect(
      hasOtherClaimAtVenueOnDay({
        offerId: "b",
        restaurantSlug: "venue-b",
        offerScheduleDate: "today",
        claimedByOfferId,
        nowMs: may18_2026_14_00,
      }),
    ).toBe(false)
  })

  it("is true for another offer at the same restaurant on the same day", () => {
    const claimedByOfferId = {
      a: claim({ offerId: "a", restaurantSlug: "venue-a" }),
    }
    expect(
      hasOtherClaimAtVenueOnDay({
        offerId: "b",
        restaurantSlug: "venue-a",
        offerScheduleDate: "today",
        claimedByOfferId,
        nowMs: may18_2026_14_00,
      }),
    ).toBe(true)
  })
})

describe("findOverlappingActiveClaim", () => {
  const offer = {
    id: "new-offer",
    title: "30% off",
    restaurantName: "Bistro",
    discountPercent: 30,
    date: "Today",
    offerScheduleDate: "today" as const,
    offerStart: "18:00",
    offerEnd: "21:00",
    isAllDay: false,
    workingHoursStart: "12:00",
    workingHoursEnd: "23:00",
    timeWindow: "18:00 - 21:00",
  }

  it("returns undefined when windows do not overlap", () => {
    const existing = claim({
      offerId: "existing",
      restaurantSlug: "other-venue",
      arrivalTime: "14:00",
      offerWindowCloses: new Date(2026, 4, 18, 17, 0, 0, 0).toISOString(),
    })
    const hit = findOverlappingActiveClaim({
      restaurantSlug: "new-venue",
      offerId: "new-offer",
      offer,
      claimData: { arrivalTime: "18:00", guestCount: 2, paymentMethod: "dineout" },
      claimedByOfferId: { existing },
      nowMs: may18_2026_14_00,
    })
    expect(hit).toBeUndefined()
  })

  it("returns blocking claim when arrival windows overlap at another venue", () => {
    const existing = claim({
      offerId: "existing",
      restaurantSlug: "other-venue",
      arrivalTime: "14:00",
      offerWindowCloses: new Date(2026, 4, 18, 21, 0, 0, 0).toISOString(),
    })
    const hit = findOverlappingActiveClaim({
      restaurantSlug: "new-venue",
      offerId: "new-offer",
      offer,
      claimData: { arrivalTime: "15:00", guestCount: 2, paymentMethod: "dineout" },
      claimedByOfferId: { existing },
      nowMs: may18_2026_14_00,
    })
    expect(hit?.offerId).toBe("existing")
  })

  it("ignores expired claims", () => {
    const existing = claim({
      offerId: "existing",
      restaurantSlug: "other-venue",
      arrivalTime: "10:00",
      offerWindowCloses: new Date(2026, 4, 18, 11, 0, 0, 0).toISOString(),
    })
    const hit = findOverlappingActiveClaim({
      restaurantSlug: "new-venue",
      offerId: "new-offer",
      offer,
      claimData: { arrivalTime: "14:00", guestCount: 2, paymentMethod: "dineout" },
      claimedByOfferId: { existing },
      nowMs: may18_2026_14_00,
    })
    expect(hit).toBeUndefined()
  })
})

describe("isClaimStillActive", () => {
  it("is false after offer window closes", () => {
    const c = claim({
      offerId: "x",
      restaurantSlug: "v",
      offerWindowCloses: new Date(2026, 4, 18, 12, 0, 0, 0).toISOString(),
    })
    expect(isClaimStillActive(c, may18_2026_14_00)).toBe(false)
  })
})

describe("claimWindowMs", () => {
  it("uses arrival time as window start", () => {
    const c = claim({
      offerId: "x",
      restaurantSlug: "v",
      arrivalTime: "16:30",
    })
    const [start] = claimWindowMs(c)
    const d = new Date(start)
    expect(d.getHours()).toBe(16)
    expect(d.getMinutes()).toBe(30)
  })
})

describe("prospectiveClaimWindowMs", () => {
  it("aligns with claimWindowMs after claim is recorded", () => {
    const offer = {
      id: "o1",
      title: "30%",
      restaurantName: "Test",
      discountPercent: 30,
      date: "Today",
      offerScheduleDate: "today" as const,
      offerStart: "12:00",
      offerEnd: "21:00",
      isAllDay: false,
      workingHoursStart: "12:00",
      workingHoursEnd: "23:00",
      timeWindow: "12:00 - 21:00",
    }
    const data = { arrivalTime: "14:00", guestCount: 2, paymentMethod: "dineout" as const }
    const prospective = prospectiveClaimWindowMs(offer, data, may18_2026_14_00)
    const recorded = claimWindowMs(
      claim({
        offerId: "o1",
        restaurantSlug: "v",
        arrivalTime: "14:00",
        offerWindowCloses: new Date(prospective[1]).toISOString(),
      }),
    )
    expect(prospective[0]).toBe(recorded[0])
  })
})
