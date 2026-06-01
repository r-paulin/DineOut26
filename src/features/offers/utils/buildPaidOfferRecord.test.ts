import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import {
  buildPaidOfferRecordFromClaim,
  buildPaidOfferRecordFromPaySnapshot,
  isPaidOfferPaymentDetailsAvailable,
  paidOfferRecordToClaimStub,
} from "@/features/offers/utils/buildPaidOfferRecord"
import type { PayBillCompletionSnapshot } from "@/features/payBill/payBill.types"

const claim: ClaimedOffer = {
  pin: "1234",
  offerWindowCloses: new Date(Date.now() + 7200_000).toISOString(),
  arrivalTime: "10:00",
  arrivalDate: "Today",
  guestCount: 2,
  paymentMethod: "card_or_cash",
  discountPercent: 30,
  restaurantSlug: "neiburgs",
  offerId: "o1",
  claimedAt: Date.now(),
}

describe("buildPaidOfferRecordFromClaim", () => {
  it("maps claim fields to a paid record", () => {
    const record = buildPaidOfferRecordFromClaim(claim)
    expect(record.offerId).toBe("o1")
    expect(record.restaurantSlug).toBe("neiburgs")
    expect(record.discountPercent).toBe(30)
    expect(record.paymentMethod).toBe("card_or_cash")
    expect(record.paidAt).toBeGreaterThan(0)
  })
})

describe("buildPaidOfferRecordFromPaySnapshot", () => {
  const snapshot: PayBillCompletionSnapshot = {
    restaurantSlug: "neiburgs",
    restaurantName: "Neiburgs",
    offerId: "o1",
    discountPercent: 30,
    discountAddPercent: 15,
    paidAmount: 48,
    cashbackEarnedEur: 5,
    receiptTotalEur: 40,
    tipEur: 2,
    paymentCode: "4829",
  }

  it("returns null when offerId is missing", () => {
    expect(
      buildPaidOfferRecordFromPaySnapshot({ ...snapshot, offerId: null }),
    ).toBeNull()
  })

  it("maps DineOut payment snapshot", () => {
    const record = buildPaidOfferRecordFromPaySnapshot(snapshot)
    expect(record).toEqual({
      offerId: "o1",
      restaurantSlug: "neiburgs",
      restaurantName: "Neiburgs",
      discountPercent: 30,
      paymentMethod: "dineout",
      paidAmountEur: 48,
      cashbackEarnedEur: 5,
      paymentCode: "4829",
      receiptTotalEur: 40,
      tipEur: 2,
      discountAddPercent: 15,
      paidAt: expect.any(Number),
    })
  })

  it("omits cashback when zero", () => {
    const record = buildPaidOfferRecordFromPaySnapshot({
      ...snapshot,
      cashbackEarnedEur: 0,
    })
    expect(record?.cashbackEarnedEur).toBeUndefined()
  })
})

describe("isPaidOfferPaymentDetailsAvailable", () => {
  it("is true for DineOut records with payment code", () => {
    const record = buildPaidOfferRecordFromPaySnapshot({
      restaurantSlug: "neiburgs",
      restaurantName: "Neiburgs",
      offerId: "o1",
      discountPercent: 30,
      discountAddPercent: 15,
      paidAmount: 48,
      cashbackEarnedEur: 5,
      receiptTotalEur: 40,
      tipEur: null,
      paymentCode: "4829",
    })!
    expect(isPaidOfferPaymentDetailsAvailable(record)).toBe(true)
  })

  it("is false for card/cash paid records", () => {
    expect(isPaidOfferPaymentDetailsAvailable(buildPaidOfferRecordFromClaim(claim))).toBe(false)
  })
})

describe("paidOfferRecordToClaimStub", () => {
  it("returns claim stub for DineOut paid records", () => {
    const record = buildPaidOfferRecordFromPaySnapshot({
      restaurantSlug: "neiburgs",
      restaurantName: "Neiburgs",
      offerId: "o1",
      discountPercent: 30,
      discountAddPercent: 15,
      paidAmount: 48,
      cashbackEarnedEur: 5,
      receiptTotalEur: 40,
      tipEur: null,
      paymentCode: "4829",
    })!
    const stub = paidOfferRecordToClaimStub(record)
    expect(stub?.paymentMethod).toBe("dineout")
    expect(stub?.discountAddPercent).toBe(15)
  })
})
