import { describe, expect, it } from "vitest"
import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"
import { buildTimedOfferBadgeModels } from "./offerBadgeStack"

const NOW = new Date(2024, 5, 15, 11, 50, 0, 0)

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

  it("maps a single offer with icon always active in default mode", () => {
    const rows = buildTimedOfferBadgeModels([
      offer(20, { kind: "range", start: "12:00", end: "15:00" }),
    ], NOW)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({
      kind: "offer",
      discountLabel: "-20%",
      timeWindow: "12:00–15:00",
      iconActive: true,
    })
  })

  it("maps three offers without overflow row", () => {
    const rows = buildTimedOfferBadgeModels([
      offer(10, { kind: "all-day" }),
      offer(20, { kind: "range", start: "11:00", end: "14:00" }),
      offer(15, { kind: "range", start: "18:00", end: "22:00" }),
    ], NOW)
    expect(rows).toHaveLength(3)
    expect(rows.every((r) => r.kind === "offer")).toBe(true)
    expect(rows.every((r) => r.iconActive === true)).toBe(true)
  })

  it("shows two highest-discount offers then overflow count", () => {
    const rows = buildTimedOfferBadgeModels([
      offer(10, { kind: "range", start: "09:00", end: "10:00" }),
      offer(25, { kind: "range", start: "11:00", end: "14:00" }),
      offer(20, { kind: "range", start: "18:00", end: "22:00" }),
      offer(15, { kind: "range", start: "12:00", end: "13:00" }),
    ], NOW)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({
      kind: "offer",
      discountLabel: "-25%",
      iconActive: true,
    })
    expect(rows[1]).toMatchObject({
      kind: "offer",
      discountLabel: "-20%",
      iconActive: true,
    })
    expect(rows[2]).toEqual({
      kind: "overflow",
      count: 2,
      iconActive: true,
    })
  })

  it("breaks ties by original index (stable)", () => {
    const rows = buildTimedOfferBadgeModels([
      offer(20, { kind: "range", start: "10:00", end: "11:00" }),
      offer(20, { kind: "range", start: "12:00", end: "13:00" }),
    ], NOW)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ discountLabel: "-20%", timeWindow: "10:00–11:00" })
    expect(rows[1]).toMatchObject({ discountLabel: "-20%", timeWindow: "12:00–13:00" })
  })

  it("liveNow mode hides non-live windows and recomputes overflow", () => {
    const noon = new Date(2024, 5, 15, 12, 30, 0, 0)
    const rows = buildTimedOfferBadgeModels(
      [
        offer(10, { kind: "range", start: "09:00", end: "10:00" }),
        offer(25, { kind: "range", start: "11:00", end: "14:00" }),
        offer(20, { kind: "range", start: "18:00", end: "22:00" }),
        offer(15, { kind: "range", start: "12:00", end: "13:00" }),
      ],
      noon,
      "liveNow",
    )
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      kind: "offer",
      discountLabel: "-25%",
      timeWindow: "11:00–14:00",
    })
    expect(rows[1]).toMatchObject({
      kind: "offer",
      discountLabel: "-15%",
      timeWindow: "12:00–13:00",
    })
  })

  it("liveNow mode returns empty when nothing is live", () => {
    const rows = buildTimedOfferBadgeModels(
      [offer(20, { kind: "range", start: "18:00", end: "22:00" })],
      NOW,
      "liveNow",
    )
    expect(rows).toEqual([])
  })
})
