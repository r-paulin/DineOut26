import { describe, expect, it, vi } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { checkInClaimOffer } from "./claimOffer"

function baseClaim(overrides: Partial<ClaimedOffer> = {}): ClaimedOffer {
  return {
    offerId: "offer-1",
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
    discountAddPercent: 20,
    ...overrides,
  }
}

describe("checkInClaimOffer", () => {
  it("sets checkedInAt when not yet checked in", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-08T18:00:00.000Z"))

    const result = checkInClaimOffer(baseClaim())

    expect(result.checkedInAt).toBe(Date.parse("2026-05-08T18:00:00.000Z"))
    expect(result.pin).toBe("1234")

    vi.useRealTimers()
  })

  it("is idempotent when already checked in", () => {
    const checked = baseClaim({ checkedInAt: 1_700_000_100_000 })
    expect(checkInClaimOffer(checked)).toBe(checked)
  })
})
