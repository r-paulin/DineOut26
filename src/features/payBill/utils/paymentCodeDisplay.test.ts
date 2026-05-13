import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { formatPaymentCodeDisplay } from "./paymentCodeDisplay"

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

describe("formatPaymentCodeDisplay", () => {
  it("uses claim pin with hash", () => {
    expect(formatPaymentCodeDisplay(claim({ pin: "HQYKIJ" }), "TXN-X")).toBe("#HQYKIJ")
  })

  it("keeps leading hash on pin", () => {
    expect(formatPaymentCodeDisplay(claim({ pin: "#ABC" }), "TXN-X")).toBe("#ABC")
  })

  it("falls back to transaction id tail", () => {
    expect(formatPaymentCodeDisplay(null, "TXN-MP333SHY")).toBe("#333SHY")
  })
})
