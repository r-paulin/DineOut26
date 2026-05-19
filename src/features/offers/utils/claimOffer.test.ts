import { describe, expect, it } from "vitest"
import { claimOffer, computeOfferWindowCloseIso } from "./claimOffer"
import type { ClaimOfferInput } from "./claimOffer"

const baseClaim: ClaimOfferInput = {
  arrivalTime: "19:00",
  guestCount: 2,
  paymentMethod: "dineout",
  offerId: "test-offer",
  restaurantSlug: "neiburgs",
  discountPercent: 15,
  arrivalDateLabel: "Tuesday, 20 May 2026",
  isAllDay: false,
  workingHoursEnd: "23:00",
  offerEnd: "21:00",
}

describe("claimOffer offerWindowBaseDate", () => {
  it("anchors offerWindowCloses to the offer calendar day when base date is passed", () => {
    const baseDate = new Date(2026, 4, 20, 12, 0, 0, 0)
    const claimed = claimOffer({ ...baseClaim, offerWindowBaseDate: baseDate })
    const direct = computeOfferWindowCloseIso({
      baseDate,
      workingHoursEnd: "23:00",
      offerEnd: "21:00",
    })
    expect(claimed.offerWindowCloses).toBe(direct)
  })

  it("stores offerScheduleYmd from the offer calendar day", () => {
    const baseDate = new Date(2026, 4, 21, 12, 0, 0, 0)
    const claimed = claimOffer({
      ...baseClaim,
      offerWindowBaseDate: baseDate,
      offerScheduleYmd: "2026-05-21",
    })
    expect(claimed.offerScheduleYmd).toBe("2026-05-21")
  })
})
