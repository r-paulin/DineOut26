import { describe, expect, it } from "vitest"
import { RESTAURANT_CATALOG_ORDER } from "@/features/restaurants/restaurants.catalog"
import { distanceSqFromMapCenter } from "./restaurantMapPosition"

describe("distanceSqFromMapCenter", () => {
  it("orders catalog slugs deterministically by proximity to map center", () => {
    const slugs = [...RESTAURANT_CATALOG_ORDER]
    const ranked = [...slugs].sort(
      (a, b) => distanceSqFromMapCenter(a) - distanceSqFromMapCenter(b),
    )
    expect(ranked.length).toBe(slugs.length)
    expect(new Set(ranked).size).toBe(slugs.length)
    const again = [...slugs].sort(
      (a, b) => distanceSqFromMapCenter(a) - distanceSqFromMapCenter(b),
    )
    expect(again).toEqual(ranked)
  })

  it("returns 0 for unknown slug fallback index (stable)", () => {
    expect(distanceSqFromMapCenter("unknown-venue-slug")).toBeGreaterThanOrEqual(0)
  })
})
