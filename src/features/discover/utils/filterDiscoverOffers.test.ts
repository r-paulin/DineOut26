import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { OfferCardModel } from "@/features/offers/offers.types"
import { getDefaultFilterState } from "@/features/search/filters.types"
import * as restaurantOffersData from "@/features/offers/data/restaurantOffers.data"
import { useRestaurantCatalogStore } from "@/features/restaurants/restaurantCatalogStore"
import {
  filterOfferCardsForDiscover,
  getEffectiveOfferForDiscover,
  restaurantTimedOfferActiveAtTime,
  restaurantTimedOfferActiveNow,
} from "./filterDiscoverOffers"

beforeEach(() => {
  useRestaurantCatalogStore.getState().resetAll()
  globalThis.localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function stubCard(slug: string): OfferCardModel {
  return {
    id: slug,
    restaurantSlug: slug,
    name: "Stub",
    priceRange: "€€",
    area: "Old Town",
    cuisine: "X",
    rating: "4",
    image: "/x.jpg",
    campaign: {},
  }
}

describe("restaurantTimedOfferActiveNow", () => {
  it("is false when there are no timed offers", () => {
    vi.spyOn(restaurantOffersData, "getRestaurantOffers").mockReturnValue([])
    expect(restaurantTimedOfferActiveNow("x", new Date(2026, 0, 7, 12, 0))).toBe(
      false,
    )
  })

  it("treats range windows as half-open [start, end)", () => {
    vi.spyOn(restaurantOffersData, "getRestaurantOffers").mockReturnValue([
      {
        discountPercent: 15,
        window: { kind: "range", start: "12:00", end: "15:00" },
        remainingSpots: 1,
      },
    ])
    expect(restaurantTimedOfferActiveNow("x", new Date(2026, 0, 7, 12, 0))).toBe(
      true,
    )
    expect(restaurantTimedOfferActiveNow("x", new Date(2026, 0, 7, 14, 59))).toBe(
      true,
    )
    expect(restaurantTimedOfferActiveNow("x", new Date(2026, 0, 7, 15, 0))).toBe(
      false,
    )
    expect(restaurantTimedOfferActiveNow("x", new Date(2026, 0, 7, 11, 59))).toBe(
      false,
    )
  })

  it("is true for all-day at any clock time", () => {
    vi.spyOn(restaurantOffersData, "getRestaurantOffers").mockReturnValue([
      {
        discountPercent: 10,
        window: { kind: "all-day" },
        remainingSpots: 2,
      },
    ])
    expect(restaurantTimedOfferActiveNow("x", new Date(2026, 0, 7, 3, 15))).toBe(
      true,
    )
  })

  it("matches if any offer window contains now", () => {
    vi.spyOn(restaurantOffersData, "getRestaurantOffers").mockReturnValue([
      {
        discountPercent: 10,
        window: { kind: "range", start: "09:00", end: "11:00" },
        remainingSpots: 1,
      },
      {
        discountPercent: 20,
        window: { kind: "range", start: "18:00", end: "22:00" },
        remainingSpots: 1,
      },
    ])
    expect(restaurantTimedOfferActiveNow("x", new Date(2026, 0, 7, 10, 0))).toBe(
      true,
    )
    expect(restaurantTimedOfferActiveNow("x", new Date(2026, 0, 7, 19, 30))).toBe(
      true,
    )
    expect(restaurantTimedOfferActiveNow("x", new Date(2026, 0, 7, 14, 0))).toBe(
      false,
    )
  })
})

describe("restaurantTimedOfferActiveAtTime", () => {
  it("uses the same half-open overlap for HH:MM", () => {
    vi.spyOn(restaurantOffersData, "getRestaurantOffers").mockReturnValue([
      {
        discountPercent: 15,
        window: { kind: "range", start: "12:00", end: "15:00" },
        remainingSpots: 1,
      },
    ])
    const day = new Date(2026, 0, 10, 0, 0)
    expect(restaurantTimedOfferActiveAtTime("x", "14:30", day)).toBe(true)
    expect(restaurantTimedOfferActiveAtTime("x", "15:00", day)).toBe(false)
  })
})

describe("getEffectiveOfferForDiscover", () => {
  it("forces prebook when date is not today", () => {
    const base = getDefaultFilterState()
    expect(
      getEffectiveOfferForDiscover({ ...base, date: "today", offer: "live" }),
    ).toBe("live")
    expect(
      getEffectiveOfferForDiscover({ ...base, date: "2026-02-01", offer: "live" }),
    ).toBe("prebook")
  })
})

describe("filterOfferCardsForDiscover", () => {
  it("drops rows when live is effective and no window contains now", () => {
    vi.spyOn(restaurantOffersData, "getRestaurantOffers").mockReturnValue([
      {
        discountPercent: 15,
        window: { kind: "range", start: "12:00", end: "15:00" },
        remainingSpots: 1,
      },
    ])
    const state = { ...getDefaultFilterState(), date: "today" as const, offer: "live" as const }
    const now = new Date(2026, 0, 7, 20, 0)
    expect(filterOfferCardsForDiscover([stubCard("x")], state, now)).toHaveLength(
      0,
    )
    expect(
      filterOfferCardsForDiscover([stubCard("x")], state, new Date(2026, 0, 7, 13, 0)),
    ).toHaveLength(1)
  })
})
