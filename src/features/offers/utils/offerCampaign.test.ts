import { describe, expect, it } from "vitest"
import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"
import {
  computeOfferCardCampaign,
  restaurantVisibleForPreset,
} from "./offerCampaign"

describe("computeOfferCardCampaign", () => {
  it("picks highest discount; all-day primary", () => {
    const offers: RestaurantTimedOffer[] = [
      { discountPercent: 20, window: { kind: "all-day" } },
      { discountPercent: 10, window: { kind: "range", start: "12:00", end: "15:00" } },
    ]
    expect(computeOfferCardCampaign(offers)).toEqual({
      discountLabel: "-20%",
      timeWindow: "All day",
      extraOffers: 1,
    })
  })

  it("Neiburgs-like: primary -20% evening", () => {
    const offers: RestaurantTimedOffer[] = [
      { discountPercent: 20, window: { kind: "range", start: "19:00", end: "23:00" } },
      { discountPercent: 15, window: { kind: "range", start: "11:00", end: "14:00" } },
      { discountPercent: 10, window: { kind: "all-day" } },
    ]
    expect(computeOfferCardCampaign(offers)).toEqual({
      discountLabel: "-20%",
      timeWindow: "19:00–23:00",
      extraOffers: 2,
    })
  })

  it("tie-break keeps earlier offer when same percent", () => {
    const offers: RestaurantTimedOffer[] = [
      { discountPercent: 15, window: { kind: "range", start: "10:00", end: "11:00" } },
      { discountPercent: 15, window: { kind: "range", start: "14:00", end: "16:00" } },
    ]
    expect(computeOfferCardCampaign(offers).timeWindow).toBe("10:00–11:00")
  })

  it("three+ extra offers", () => {
    const offers: RestaurantTimedOffer[] = [
      { discountPercent: 25, window: { kind: "range", start: "18:00", end: "22:00" } },
      { discountPercent: 15, window: { kind: "range", start: "12:00", end: "15:00" } },
      { discountPercent: 10, window: { kind: "all-day" } },
    ]
    expect(computeOfferCardCampaign(offers).extraOffers).toBe(2)
  })

  it("empty offers returns no campaign fields", () => {
    expect(computeOfferCardCampaign([])).toEqual({})
  })

  it("Melna Bite-like: primary -30% timed window + all-day as extra", () => {
    const offers: RestaurantTimedOffer[] = [
      { discountPercent: 15, window: { kind: "all-day" } },
      { discountPercent: 30, window: { kind: "range", start: "10:00", end: "13:00" } },
    ]
    expect(computeOfferCardCampaign(offers)).toEqual({
      discountLabel: "-30%",
      timeWindow: "10:00–13:00",
      extraOffers: 1,
    })
  })
})

describe("restaurantVisibleForPreset", () => {
  const threeChefs: RestaurantTimedOffer[] = [
    { discountPercent: 25, window: { kind: "range", start: "18:00", end: "22:00" } },
    { discountPercent: 15, window: { kind: "range", start: "12:00", end: "15:00" } },
    { discountPercent: 10, window: { kind: "all-day" } },
  ]

  const maxCekot: RestaurantTimedOffer[] = [
    { discountPercent: 30, window: { kind: "range", start: "18:00", end: "21:00" } },
    { discountPercent: 15, window: { kind: "all-day" } },
  ]

  it("morning: 3 Pavāru hidden (no window overlap morning, all-day removed would hide — has -10% all day so visible)", () => {
    // Canonical data includes -10% all-day → visible for any preset
    expect(restaurantVisibleForPreset(threeChefs, "morning")).toBe(true)
  })

  it("morning: venue with only evening timed offers hidden", () => {
    const eveningOnly: RestaurantTimedOffer[] = [
      { discountPercent: 30, window: { kind: "range", start: "18:00", end: "21:00" } },
    ]
    expect(restaurantVisibleForPreset(eveningOnly, "morning")).toBe(false)
  })

  it("morning: Max Cekot visible due to All day offer", () => {
    expect(restaurantVisibleForPreset(maxCekot, "morning")).toBe(true)
  })

  it("lunch: Neiburgs 11–14 overlaps", () => {
    const neiburgs: RestaurantTimedOffer[] = [
      { discountPercent: 20, window: { kind: "range", start: "19:00", end: "23:00" } },
      { discountPercent: 15, window: { kind: "range", start: "11:00", end: "14:00" } },
      { discountPercent: 10, window: { kind: "all-day" } },
    ]
    expect(restaurantVisibleForPreset(neiburgs, "lunch")).toBe(true)
  })

  it("any: non-empty offers visible", () => {
    expect(restaurantVisibleForPreset(threeChefs, "any")).toBe(true)
  })
})
