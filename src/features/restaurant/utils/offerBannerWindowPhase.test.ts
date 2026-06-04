import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import {
  getOfferBannerWindowPhase,
  hasOtherClaimAtVenue,
} from "@/features/restaurant/utils/offerBannerWindowPhase"

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

describe("getOfferBannerWindowPhase", () => {
  it("returns prebook for a future schedule date", () => {
    expect(
      getOfferBannerWindowPhase(
        {
          offerScheduleDate: "2026-05-19",
          offerStart: "10:00",
          offerEnd: "17:00",
        },
        may18_2026_14_00,
      ),
    ).toBe("prebook")
  })

  it("returns prebook on today before window start", () => {
    expect(
      getOfferBannerWindowPhase(
        {
          offerScheduleDate: "today",
          offerStart: "19:00",
          offerEnd: "23:00",
        },
        may18_2026_14_00,
      ),
    ).toBe("prebook")
  })

  it("returns active on today inside the window", () => {
    expect(
      getOfferBannerWindowPhase(
        {
          offerScheduleDate: "today",
          offerStart: "10:00",
          offerEnd: "17:00",
        },
        may18_2026_14_00,
      ),
    ).toBe("active")
  })

  it("returns active for all-day on today", () => {
    expect(
      getOfferBannerWindowPhase(
        {
          offerScheduleDate: "today",
          isAllDay: true,
          offerStart: "12:00",
          offerEnd: "23:59",
        },
        may18_2026_14_00,
      ),
    ).toBe("active")
  })
})

describe("hasOtherClaimAtVenue", () => {
  const nowMs = may18_2026_14_00
  const empty: Record<string, ClaimedOffer> = {}

  it("is false with no claims", () => {
    expect(hasOtherClaimAtVenue("o1", "venue-a", "today", empty, nowMs)).toBe(
      false,
    )
  })

  it("is false when only this offer is claimed at the venue", () => {
    expect(
      hasOtherClaimAtVenue(
        "o1",
        "venue-a",
        "today",
        { o1: claim({ offerId: "o1", restaurantSlug: "venue-a" }) },
        nowMs,
      ),
    ).toBe(false)
  })

  it("is false when another offer is claimed at a different venue on the same day", () => {
    expect(
      hasOtherClaimAtVenue(
        "o2",
        "venue-b",
        "today",
        { o1: claim({ offerId: "o1", restaurantSlug: "venue-a" }) },
        nowMs,
      ),
    ).toBe(false)
  })

  it("is true when another offer is claimed at the same venue on the same day", () => {
    expect(
      hasOtherClaimAtVenue(
        "o2",
        "venue-a",
        "today",
        { o1: claim({ offerId: "o1", restaurantSlug: "venue-a" }) },
        nowMs,
      ),
    ).toBe(true)
  })

  it("is false when another offer is claimed at the same venue on a different day", () => {
    expect(
      hasOtherClaimAtVenue(
        "o2",
        "venue-a",
        "2026-05-19",
        { o1: claim({ offerId: "o1", restaurantSlug: "venue-a" }) },
        nowMs,
      ),
    ).toBe(false)
  })
})
