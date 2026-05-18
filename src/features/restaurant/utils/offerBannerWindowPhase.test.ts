import { describe, expect, it } from "vitest"
import {
  getOfferBannerWindowPhase,
  hasOtherClaimAtVenue,
} from "@/features/restaurant/utils/offerBannerWindowPhase"

const may18_2026_14_00 = new Date(2026, 4, 18, 14, 0, 0, 0).getTime()

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
  it("is false with no claims", () => {
    expect(hasOtherClaimAtVenue("o1", [])).toBe(false)
  })

  it("is false when only this offer is claimed", () => {
    expect(
      hasOtherClaimAtVenue("o1", [{ offerId: "o1", claimedAt: 1 }]),
    ).toBe(false)
  })

  it("is true when another offer is claimed", () => {
    expect(
      hasOtherClaimAtVenue("o2", [{ offerId: "o1", claimedAt: 1 }]),
    ).toBe(true)
  })
})
