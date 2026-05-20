import { beforeEach, describe, expect, it } from "vitest"
import { buildEntryFromForm, parseTimedOffersFromJson } from "./catalogValidation"
import { getMergedRestaurantCatalogEntry } from "./restaurantCatalogRuntime"
import { useRestaurantCatalogStore } from "./restaurantCatalogStore"
import { RESTAURANTS_BY_SLUG } from "./restaurants.catalog"

beforeEach(() => {
  useRestaurantCatalogStore.getState().resetAll()
  globalThis.localStorage.clear()
})

describe("parseTimedOffersFromJson", () => {
  it("accepts valid ranged offers", () => {
    const json = JSON.stringify([
      {
        discountPercent: 10,
        window: { kind: "range", start: "10:00", end: "17:00" },
      },
      {
        discountPercent: 20,
        window: { kind: "range", start: "12:00", end: "15:00" },
        remainingSpots: 3,
      },
    ])
    const r = parseTimedOffersFromJson(json)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value).toHaveLength(2)
      expect(r.value[0]!.discountPercent).toBe(10)
      expect(r.value[1]!.remainingSpots).toBe(3)
    }
  })

  it("rejects all-day windows", () => {
    const r = parseTimedOffersFromJson(
      JSON.stringify([{ discountPercent: 10, window: { kind: "all-day" } }]),
    )
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error).toMatch(/not supported/i)
    }
  })

  it("rejects invalid JSON", () => {
    const r = parseTimedOffersFromJson("{")
    expect(r.ok).toBe(false)
  })

  it("rejects non-array", () => {
    const r = parseTimedOffersFromJson("{}")
    expect(r.ok).toBe(false)
  })
})

describe("buildEntryFromForm", () => {
  it("builds entry from valid form", () => {
    const base = RESTAURANTS_BY_SLUG["melna-bite"]
    const r = buildEntryFromForm({
      slug: "melna-bite",
      name: base.name,
      displayPrice: base.displayPrice,
      area: base.area,
      rating: base.rating,
      reviewSuffix: base.reviewSuffix,
      tags: base.tags,
      tagDescription: base.tagDescription,
      phone: base.phone,
      address: base.address,
      website: base.website,
      imagesPrimary: base.images.primary,
      imagesSideTop: base.images.sideTop,
      imagesSideBottom: base.images.sideBottom,
      logoFilenamesText: base.logoFilenames.join("\n"),
      whatWeServeText: base.whatWeServe.join("\n"),
      amenitiesText: base.amenities.join("\n"),
      timedOffersJson: JSON.stringify(base.timedOffers),
      primaryGrad: true,
    })
    expect(r.ok).toBe(true)
  })
})

describe("getMergedRestaurantCatalogEntry", () => {
  it("strips all-day offers from persisted snapshots", () => {
    const base = RESTAURANTS_BY_SLUG.neiburgs
    useRestaurantCatalogStore.getState().persistRestaurant("neiburgs", {
      ...base,
      timedOffers: [
        { discountPercent: 10, window: { kind: "all-day" } },
        ...base.timedOffers,
      ],
    })
    const merged = getMergedRestaurantCatalogEntry("neiburgs")!
    expect(merged.timedOffers.every((o) => o.window.kind === "range")).toBe(true)
    expect(merged.timedOffers).toHaveLength(base.timedOffers.length)
  })

  it("uses persisted snapshot when present", () => {
    const base = RESTAURANTS_BY_SLUG.neiburgs
    const overrideName = "Neiburgs Override Test"
    useRestaurantCatalogStore.getState().persistRestaurant("neiburgs", {
      ...base,
      name: overrideName,
    })
    expect(getMergedRestaurantCatalogEntry("neiburgs")?.name).toBe(overrideName)
    useRestaurantCatalogStore.getState().resetSlug("neiburgs")
    expect(getMergedRestaurantCatalogEntry("neiburgs")?.name).toBe(base.name)
  })
})
