import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { effectivePayDiscountPercents } from "./payBillDiscounts"

function claim(partial: Partial<ClaimedOffer>): ClaimedOffer {
  return {
    pin: "1",
    offerWindowCloses: "",
    arrivalTime: "",
    arrivalDate: "",
    guestCount: 2,
    paymentMethod: "dineout",
    discountPercent: 0,
    restaurantSlug: "x",
    offerId: "o",
    claimedAt: 0,
    ...partial,
  }
}

describe("effectivePayDiscountPercents", () => {
  it("applies default DineOut add-on when there is no claim", () => {
    expect(effectivePayDiscountPercents(null)).toEqual({
      discountPercent: 0,
      discountAddPercent: DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
    })
  })

  it("uses claim discountAddPercent when set", () => {
    expect(
      effectivePayDiscountPercents(
        claim({ discountPercent: 10, discountAddPercent: 12 }),
      ),
    ).toEqual({ discountPercent: 10, discountAddPercent: 12 })
  })

  it("allows explicit 0 add-on on a claim", () => {
    expect(
      effectivePayDiscountPercents(
        claim({ discountPercent: 5, discountAddPercent: 0 }),
      ),
    ).toEqual({ discountPercent: 5, discountAddPercent: 0 })
  })

  it("disables add-on when not paying with DineOut", () => {
    expect(
      effectivePayDiscountPercents(
        claim({
          discountPercent: 20,
          discountAddPercent: 40,
          paymentMethod: "card_or_cash",
        }),
      ),
    ).toEqual({ discountPercent: 20, discountAddPercent: 0 })
  })
})
