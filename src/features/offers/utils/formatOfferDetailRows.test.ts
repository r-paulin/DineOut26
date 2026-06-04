import { describe, expect, it } from "vitest"
import type { ClaimOfferModalOffer } from "@/features/offers/offers.types"
import { formatOfferDetailRows } from "@/features/offers/utils/formatOfferDetailRows"

const baseOffer: ClaimOfferModalOffer = {
  id: "o1",
  title: "30% discount on menu",
  restaurantName: "Test Restaurant",
  discountPercent: 30,
  date: "Today",
  offerStart: "11:00",
  offerEnd: "15:00",
  isAllDay: false,
  workingHoursStart: "12:00",
  workingHoursEnd: "23:00",
  timeWindow: "Arrive between 11:00 - 15:00",
  minOrderEur: 20,
  maxSavingEur: 40,
}

describe("formatOfferDetailRows", () => {
  it("returns min, max, and availability rows", () => {
    const rows = formatOfferDetailRows(baseOffer)
    expect(rows.map((r) => r.label)).toEqual([
      "Maximum saving",
      "Minimum bill total",
      "Available",
    ])
    expect(rows[0]?.value).toBe("40,00 €")
    expect(rows[1]?.value).toBe("20,00 €")
    expect(rows[2]?.value).toBe("Today, 11:00 - 15:00")
  })

  it("adds limited availability when remainingCount is positive", () => {
    const rows = formatOfferDetailRows({ ...baseOffer, remainingCount: 2 })
    expect(rows.at(-1)).toEqual({
      label: "Limited availability",
      value: "2 left",
    })
  })

  it("omits limited availability when count is zero or absent", () => {
    expect(formatOfferDetailRows({ ...baseOffer, remainingCount: 0 })).toHaveLength(
      3,
    )
    expect(formatOfferDetailRows(baseOffer)).toHaveLength(3)
  })
})
