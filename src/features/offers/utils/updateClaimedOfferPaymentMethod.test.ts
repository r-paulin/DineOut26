import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { updateClaimedOfferPaymentMethod } from "./updateClaimedOfferPaymentMethod"

function claim(overrides: Partial<ClaimedOffer> = {}): ClaimedOffer {
  return {
    offerId: "dinner",
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
    discountAddPercent: DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
    ...overrides,
  }
}

describe("updateClaimedOfferPaymentMethod", () => {
  it("returns the same object when payment method is unchanged", () => {
    const c = claim()
    expect(updateClaimedOfferPaymentMethod(c, "dineout")).toBe(c)
  })

  it("sets discountAddPercent to default when switching to dineout", () => {
    const c = claim({ paymentMethod: "card_or_cash", discountAddPercent: 0 })
    const next = updateClaimedOfferPaymentMethod(c, "dineout")
    expect(next.paymentMethod).toBe("dineout")
    expect(next.discountAddPercent).toBe(DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT)
  })

  it("clears discountAddPercent when switching to card or cash", () => {
    const c = claim()
    const next = updateClaimedOfferPaymentMethod(c, "card_or_cash")
    expect(next.paymentMethod).toBe("card_or_cash")
    expect(next.discountAddPercent).toBe(0)
  })
})
