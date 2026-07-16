import {
  getDefaultFilterState,
  type FilterState,
} from "@/features/search/filters.types"

/** True when any discover chip differs from {@link getDefaultFilterState}. */
export function hasActiveDiscoverFilters(state: FilterState): boolean {
  const defaults = getDefaultFilterState()
  return (
    state.date !== defaults.date ||
    state.timeSlot !== defaults.timeSlot ||
    state.offer !== defaults.offer ||
    state.openNow !== defaults.openNow ||
    state.price !== defaults.price ||
    state.cuisine !== defaults.cuisine ||
    state.amenity !== defaults.amenity
  )
}

export function countActiveDiscoverFilters(state: FilterState): number {
  const defaults = getDefaultFilterState()
  let n = 0
  if (
    state.date !== defaults.date ||
    state.timeSlot !== defaults.timeSlot
  ) {
    n += 1
  }
  if (state.offer !== defaults.offer) n += 1
  if (state.openNow) n += 1
  if (state.price !== defaults.price) n += 1
  if (state.cuisine !== defaults.cuisine) n += 1
  if (state.amenity !== defaults.amenity) n += 1
  return n
}
