import { describe, expect, it } from "vitest"
import { getDefaultFilterState } from "@/features/search/filters.types"
import {
  countActiveDiscoverFilters,
  hasActiveDiscoverFilters,
} from "./hasActiveDiscoverFilters"

describe("hasActiveDiscoverFilters", () => {
  it("is false for defaults", () => {
    expect(hasActiveDiscoverFilters(getDefaultFilterState())).toBe(false)
    expect(countActiveDiscoverFilters(getDefaultFilterState())).toBe(0)
  })

  it("is true when date+time or other chips differ", () => {
    const base = getDefaultFilterState()
    expect(
      hasActiveDiscoverFilters({ ...base, timeSlot: "lunch" }),
    ).toBe(true)
    expect(
      hasActiveDiscoverFilters({ ...base, cuisine: "italian" }),
    ).toBe(true)
    expect(countActiveDiscoverFilters({ ...base, openNow: true, price: "u10" })).toBe(
      2,
    )
  })
})
