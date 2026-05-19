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
  const nowMs = may18_2026_14_00

  it("is false with no claims", () => {
    expect(hasOtherClaimAtVenue("o1", "today", [], nowMs)).toBe(false)
  })

  it("is false when only this offer is claimed", () => {
    expect(
      hasOtherClaimAtVenue(
        "o1",
        "today",
        [{ offerId: "o1", claimedAt: 1, scheduleYmd: "2026-05-18" }],
        nowMs,
      ),
    ).toBe(false)
  })

  it("is true when another offer is claimed on the same day", () => {
    expect(
      hasOtherClaimAtVenue(
        "o2",
        "today",
        [{ offerId: "o1", claimedAt: 1, scheduleYmd: "2026-05-18" }],
        nowMs,
      ),
    ).toBe(true)
  })

  it("is false when another offer is claimed on a different day", () => {
    expect(
      hasOtherClaimAtVenue(
        "o2",
        "2026-05-19",
        [{ offerId: "o1", claimedAt: 1, scheduleYmd: "2026-05-18" }],
        nowMs,
      ),
    ).toBe(false)
  })

  it("falls back to claimedAt local day when scheduleYmd is missing", () => {
    expect(
      hasOtherClaimAtVenue(
        "o2",
        "today",
        [{ offerId: "o1", claimedAt: may18_2026_14_00 }],
        nowMs,
      ),
    ).toBe(true)
  })
})
