import { describe, expect, it } from "vitest"
import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"
import { getRestaurantDetailDemo } from "./restaurantDetailDemo"

describe("getRestaurantDetailDemo offer date tabs", () => {
  it("shows today plus 6 days ahead (same length as getDateOptions)", () => {
    const model = getRestaurantDetailDemo("neiburgs")
    expect(model.offerDateTabs).toHaveLength(7)
    expect(model.offerDateTabs[0]?.id).toBe("today")
    expect(model.offerDateTabs[0]?.dayLabel).toBe("Today")
    expect(model.offerDateTabs[1]?.dayLabel).toBe("Tomorrow")
  })

  it("has offers only on the first three days; later tabs are no-offer with no cards", () => {
    const model = getRestaurantDetailDemo("three-chefs")
    const withCards = model.offerDateTabs.filter(
      (t) => (model.offersByTabId[t.id]?.length ?? 0) > 0,
    )
    expect(withCards).toHaveLength(3)

    const noOfferTabs = model.offerDateTabs.filter((t) => t.state === "no-offer")
    expect(noOfferTabs).toHaveLength(4)
    for (const t of noOfferTabs) {
      expect(model.offersByTabId[t.id] ?? []).toEqual([])
    }

    const offerDays = model.offerDateTabs.filter((t) => t.state !== "no-offer")
    expect(offerDays).toHaveLength(3)
  })

  it("assigns per-date discount labels from that day's highest offer", () => {
    const model = getRestaurantDetailDemo("neiburgs")
    const offerTabs = model.offerDateTabs.filter((t) => t.state !== "no-offer")
    expect(offerTabs[0]?.discountLabel).toBe("-20%")
    expect(offerTabs[1]?.discountLabel).toBe("-20%")
    expect(offerTabs[2]?.discountLabel).toBe("-20%")
  })

  it("each offer tab lists only cards derived from getRestaurantOffers (no synthetic extras)", () => {
    const slug = "three-chefs" as const
    const expected = getRestaurantOffers(slug).length
    const model = getRestaurantDetailDemo(slug)
    const offerTabs = model.offerDateTabs.filter((t) => t.state !== "no-offer")
    for (const t of offerTabs) {
      expect(model.offersByTabId[t.id]?.length).toBe(expected)
    }
  })
})
