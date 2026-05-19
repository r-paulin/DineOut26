import { describe, expect, it } from "vitest"
import type { ClaimOfferModalOffer } from "@/features/offers/offers.types"
import { formatClaimModalOfferDetailRows } from "@/features/offers/utils/formatClaimModalOfferDetailRows"

const baseOffer: ClaimOfferModalOffer = {
  id: "o1",
  title: "Claim 20% discount",
  restaurantName: "Neiburgs",
  discountPercent: 20,
  date: "Today",
  offerStart: "19:00",
  offerEnd: "23:00",
  isAllDay: false,
  workingHoursStart: "12:00",
  workingHoursEnd: "23:00",
  timeWindow: "19:00 - 23:00",
  minOrderEur: 10,
}

describe("formatClaimModalOfferDetailRows", () => {
  it("returns minimum order, available, and applicable rows", () => {
    const rows = formatClaimModalOfferDetailRows(baseOffer)
    expect(rows).toEqual([
      { label: "Minimum order", value: "10,00 €" },
      { label: "Available", value: "Today, 19:00 - 23:00" },
      { label: "Applicable", value: "Food only" },
    ])
  })
})
