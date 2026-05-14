import { describe, expect, it } from "vitest"
import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"
import { buildTimedOfferBadgeModels } from "./offerBadgeStack"

function offer(
  discountPercent: number,
  window: RestaurantTimedOffer["window"],
): RestaurantTimedOffer {
  return { discountPercent, window }
}

describe("buildTimedOfferBadgeModels", () => {
  it("returns empty for no offers", () => {
    expect(buildTimedOfferBadgeModels([])).toEqual([])
  })

  it("maps a single offer", () => {
    const rows = buildTimedOfferBadgeModels([
      offer(20, { kind: "range", start: "12:00", end: "15:00" }),
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({
      kind: "offer",
      discountLabel: "-20%",
      timeWindow: "12:00–15:00",
    })
  })

  it("maps three offers without overflow row", () => {
    const rows = buildTimedOfferBadgeModels([
      offer(10, { kind: "all-day" }),
      offer(20, { kind: "range", start: "11:00", end: "14:00" }),
      offer(15, { kind: "range", start: "18:00", end: "22:00" }),
    ])
    expect(rows).toHaveLength(3)
    expect(rows.every((r) => r.kind === "offer")).toBe(true)
  })

  it("shows two highest-discount offers then overflow count", () => {
    const rows = buildTimedOfferBadgeModels([
      offer(10, { kind: "range", start: "09:00", end: "10:00" }),
      offer(25, { kind: "range", start: "11:00", end: "14:00" }),
      offer(20, { kind: "range", start: "18:00", end: "22:00" }),
      offer(15, { kind: "range", start: "12:00", end: "13:00" }),
    ])
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ kind: "offer", discountLabel: "-25%" })
    expect(rows[1]).toMatchObject({ kind: "offer", discountLabel: "-20%" })
    expect(rows[2]).toEqual({ kind: "overflow", count: 2 })
  })

  it("breaks ties by original index (stable)", () => {
    const rows = buildTimedOfferBadgeModels([
      offer(20, { kind: "range", start: "10:00", end: "11:00" }),
      offer(20, { kind: "range", start: "12:00", end: "13:00" }),
    ])
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ discountLabel: "-20%", timeWindow: "10:00–11:00" })
    expect(rows[1]).toMatchObject({ discountLabel: "-20%", timeWindow: "12:00–13:00" })
  })
})
