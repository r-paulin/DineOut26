import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { OfferCardModel } from "@/features/offers/offers.types"
import { getDefaultFilterState } from "@/features/search/filters.types"
import * as restaurantOffersData from "@/features/offers/data/restaurantOffers.data"
import { useRestaurantCatalogStore } from "@/features/restaurants/restaurantCatalogStore"
import {
  filterOfferCardsForDiscover,
  getEffectiveOfferForDiscover,
  isDiscoverEmptyTriggerFilter,
  isTimedOfferLiveNow,
  isTimedOfferWindowLiveAt,
  restaurantTimedOfferActiveAtTime,
  restaurantTimedOfferActiveNow,
  restaurantTimedOfferOverlapsTimeSlot,
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

describe("filterOfferCardsForDiscover date mode", () => {
  it("does not drop rows for non-today when live is selected (effective prebook)", () => {
    vi.spyOn(restaurantOffersData, "getRestaurantOffers").mockReturnValue([
      {
        discountPercent: 15,
        window: { kind: "range", start: "12:00", end: "15:00" },
        remainingSpots: 1,
      },
    ])
    const state = {
      ...getDefaultFilterState(),
      date: "2026-07-16",
      offer: "live" as const,
    }
    // Outside the lunch window — would fail if still treating as live-at-now.
    const now = new Date(2026, 6, 15, 20, 0)
    expect(
      filterOfferCardsForDiscover([stubCard("x")], state, now),
    ).toHaveLength(1)
  })
})

describe("isTimedOfferWindowLiveAt", () => {
  it("uses half-open range without pre-start grace", () => {
    const window = { kind: "range" as const, start: "12:00", end: "15:00" }
    expect(isTimedOfferWindowLiveAt(new Date(2026, 0, 7, 11, 44), window)).toBe(
      false,
    )
    expect(isTimedOfferWindowLiveAt(new Date(2026, 0, 7, 12, 0), window)).toBe(
      true,
    )
    expect(isTimedOfferWindowLiveAt(new Date(2026, 0, 7, 15, 0), window)).toBe(
      false,
    )
  })
})

describe("isTimedOfferLiveNow", () => {
  it("delegates to window live check", () => {
    const o = {
      discountPercent: 10,
      window: { kind: "all-day" as const },
      remainingSpots: 1,
    }
    expect(isTimedOfferLiveNow(o, new Date(2026, 0, 7, 3, 0))).toBe(true)
  })
})

describe("isDiscoverEmptyTriggerFilter", () => {
  it("is true for live, open now today, or price", () => {
    const base = getDefaultFilterState()
    expect(
      isDiscoverEmptyTriggerFilter({ ...base, offer: "live" }),
    ).toBe(true)
    expect(
      isDiscoverEmptyTriggerFilter({ ...base, openNow: true }),
    ).toBe(true)
    expect(
      isDiscoverEmptyTriggerFilter({ ...base, price: "u10" }),
    ).toBe(true)
  })

  it("is false for cuisine or amenity alone", () => {
    const base = getDefaultFilterState()
    expect(
      isDiscoverEmptyTriggerFilter({ ...base, cuisine: "italian" }),
    ).toBe(false)
    expect(
      isDiscoverEmptyTriggerFilter({ ...base, amenity: "outdoor-seating" }),
    ).toBe(false)
  })
})

describe("restaurantTimedOfferOverlapsTimeSlot", () => {
  it("matches offer windows that overlap the slot", () => {
    vi.spyOn(restaurantOffersData, "getRestaurantOffers").mockReturnValue([
      {
        discountPercent: 15,
        window: { kind: "range", start: "12:00", end: "15:00" },
        remainingSpots: 1,
      },
    ])
    expect(restaurantTimedOfferOverlapsTimeSlot("x", "any")).toBe(true)
    expect(restaurantTimedOfferOverlapsTimeSlot("x", "lunch")).toBe(true)
    expect(restaurantTimedOfferOverlapsTimeSlot("x", "evening")).toBe(false)
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

  it("applies time-slot overlap when slot is not Anytime", () => {
    vi.spyOn(restaurantOffersData, "getRestaurantOffers").mockReturnValue([
      {
        discountPercent: 15,
        window: { kind: "range", start: "18:00", end: "22:00" },
        remainingSpots: 1,
      },
    ])
    const lunch = {
      ...getDefaultFilterState(),
      timeSlot: "lunch" as const,
    }
    const evening = {
      ...getDefaultFilterState(),
      timeSlot: "evening" as const,
    }
    const now = new Date(2026, 0, 7, 12, 0)
    expect(filterOfferCardsForDiscover([stubCard("x")], lunch, now)).toHaveLength(
      0,
    )
    expect(
      filterOfferCardsForDiscover([stubCard("x")], evening, now),
    ).toHaveLength(1)
  })
})
