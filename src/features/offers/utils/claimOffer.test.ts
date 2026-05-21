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

describe("computeOfferWindowCloseIso", () => {
  it("closes same day at earlier of venue end and offer end", () => {
    const baseDate = new Date(2026, 4, 12, 12, 0, 0, 0)
    const iso = computeOfferWindowCloseIso({
      baseDate,
      workingHoursEnd: "23:00",
      offerEnd: "21:00",
    })
    expect(new Date(iso).getHours()).toBe(21)
    expect(new Date(iso).getMinutes()).toBe(0)
    expect(new Date(iso).getDate()).toBe(12)
  })

  it("uses venue close when earlier on an overnight window", () => {
    const baseDate = new Date(2026, 4, 12, 22, 0, 0, 0)
    const iso = computeOfferWindowCloseIso({
      baseDate,
      workingHoursEnd: "23:00",
      offerEnd: "02:00",
      offerStart: "22:00",
    })
    const close = new Date(iso)
    expect(close.getDate()).toBe(12)
    expect(close.getHours()).toBe(23)
    expect(close.getMinutes()).toBe(0)
  })

  it("uses next-day offer end when venue closes after midnight on overnight window", () => {
    const baseDate = new Date(2026, 4, 12, 22, 0, 0, 0)
    const iso = computeOfferWindowCloseIso({
      baseDate,
      workingHoursEnd: "01:00",
      offerEnd: "02:00",
      offerStart: "22:00",
    })
    const close = new Date(iso)
    expect(close.getDate()).toBe(13)
    expect(close.getHours()).toBe(1)
    expect(close.getMinutes()).toBe(0)
  })
})

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
