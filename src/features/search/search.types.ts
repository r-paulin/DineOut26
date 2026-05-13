import type { FilterKey, FilterState } from "@/features/search/filters.types"

export interface FilterChipBarProps {
  surface: "floating" | "flat"
  filterState: Pick<
    FilterState,
    "date" | "openNow" | "openAt" | "offerTimePreset"
  >
  getChipLabel: (key: FilterKey) => string
  isChipActive: (key: FilterKey) => boolean
  isChipLocked: (key: FilterKey) => boolean
  openNowTrailing: "none" | "clear" | "chevron"
  openSheet: (key: Exclude<FilterKey, "openNow">) => void
  toggleOpenNowToday: () => void
  clearOpenNowFilter: () => void
  setOpenAtTime: (time: string | null) => void
}

export interface SearchFullscreenProps extends FilterChipBarProps {
  onClose: () => void
  activeTab: string
  onTabChange: (id: string) => void
  onRestaurantPress?: (slug: string) => void
}
