import { afterEach, describe, expect, it, vi } from "vitest"
import * as filterDiscoverOffers from "@/features/discover/utils/filterDiscoverOffers"
import type { OfferCardModel } from "@/features/offers/offers.types"
import { buildMapMarkersFromOffers } from "./buildMapMarkersFromOffers"

afterEach(() => {
  vi.restoreAllMocks()
})

function stubOffer(slug: string): OfferCardModel {
  return {
    id: `${slug}-row`,
    restaurantSlug: slug,
    name: "Stub venue",
    priceRange: "€€",
    area: "Old Town",
    cuisine: "",
    rating: "4",
    image: "/x.jpg",
    campaign: {
      discountLabel: "-20%",
      timeWindow: "12:00–15:00",
    },
  }
}

describe("buildMapMarkersFromOffers", () => {
  it("enables all pins when time slot is Anytime", () => {
    const spy = vi
      .spyOn(filterDiscoverOffers, "restaurantTimedOfferOverlapsTimeSlot")
      .mockReturnValue(true)

    const markers = buildMapMarkersFromOffers([stubOffer("neiburgs")], "any")

    expect(markers).toHaveLength(1)
    expect(markers[0]!.timedOfferActiveNow).toBe(true)
    expect(spy).toHaveBeenCalledWith("neiburgs", "any")
  })

  it("marks pins grey when they miss the selected time slot", () => {
    vi.spyOn(
      filterDiscoverOffers,
      "restaurantTimedOfferOverlapsTimeSlot",
    ).mockReturnValue(false)

    const markers = buildMapMarkersFromOffers(
      [stubOffer("melna-bite")],
      "lunch",
    )

    expect(markers[0]!.timedOfferActiveNow).toBe(false)
  })

  it("marks pins enabled when they overlap the selected time slot", () => {
    vi.spyOn(
      filterDiscoverOffers,
      "restaurantTimedOfferOverlapsTimeSlot",
    ).mockReturnValue(true)

    const markers = buildMapMarkersFromOffers([stubOffer("neiburgs")], "lunch")

    expect(markers[0]!.timedOfferActiveNow).toBe(true)
  })
})
