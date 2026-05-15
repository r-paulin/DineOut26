import { afterEach, describe, expect, it, vi } from "vitest"
import type { OfferCardModel } from "@/features/offers/offers.types"
import * as offerDisplayActive from "@/features/offers/utils/offerDisplayActive"
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
  it("sets timedOfferActiveNow from restaurantTimedOfferDisplayActiveNow", () => {
    const spy = vi
      .spyOn(offerDisplayActive, "restaurantTimedOfferDisplayActiveNow")
      .mockReturnValue(false)

    const markers = buildMapMarkersFromOffers([stubOffer("neiburgs")])

    expect(markers).toHaveLength(1)
    expect(markers[0]!.timedOfferActiveNow).toBe(false)
    expect(spy).toHaveBeenCalledWith("neiburgs", expect.any(Date))
  })

  it("passes true when timed offers are display-active", () => {
    vi.spyOn(offerDisplayActive, "restaurantTimedOfferDisplayActiveNow").mockReturnValue(true)

    const markers = buildMapMarkersFromOffers([stubOffer("melna-bite")])

    expect(markers[0]!.timedOfferActiveNow).toBe(true)
  })
})
