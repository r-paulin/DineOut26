import { useCallback } from "react"
import type { FilterKey, FilterState } from "@/features/search/filters.types"
import { FilterChip } from "./FilterChip"

export interface FilterChipRowProps {
  surface: "floating" | "flat"
  filterState: Pick<FilterState, "date" | "openNow">
  getChipLabel: (key: FilterKey) => string
  isChipActive: (key: FilterKey) => boolean
  isChipLocked: (key: FilterKey) => boolean
  openNowTrailing: "none" | "clear" | "chevron"
  openSheet: (key: Exclude<FilterKey, "openNow">) => void
  toggleOpenNowToday: () => void
  clearOpenNowFilter: () => void
}

const ROW_ORDER: FilterKey[] = [
  "date",
  "offer",
  "openNow",
  "cuisine",
  "amenity",
  "price",
]

/**
 * Horizontally scrolling filter chips for discover + search.
 * Open now only appears when the date filter is Today.
 */
export function FilterChipRow({
  surface,
  filterState,
  getChipLabel,
  isChipActive,
  isChipLocked,
  openNowTrailing,
  openSheet,
  toggleOpenNowToday,
  clearOpenNowFilter,
}: FilterChipRowProps) {
  const dateIsToday = filterState.date === "today"

  const onOpenNowClick = useCallback(() => {
    if (!dateIsToday) return
    if (openNowTrailing === "clear") {
      clearOpenNowFilter()
      return
    }
    toggleOpenNowToday()
  }, [clearOpenNowFilter, dateIsToday, openNowTrailing, toggleOpenNowToday])

  const trailingFor = useCallback(
    (key: FilterKey): "chevron" | "clear" | "none" => {
      if (isChipLocked(key)) return "none"
      if (key === "openNow") return openNowTrailing
      return "chevron"
    },
    [isChipLocked, openNowTrailing],
  )

  return (
    <div className="contents">
      <div
        className="flex flex-row items-center gap-2 w-max min-h-9 me-6 flex-none"
        role="list"
      >
        {ROW_ORDER.map((key) => {
          if (key === "openNow" && !dateIsToday) return null

          if (key === "openNow") {
            return (
              <div key={key} role="listitem">
                <FilterChip
                  label={getChipLabel("openNow")}
                  surface={surface}
                  active={isChipActive("openNow")}
                  trailing={trailingFor("openNow")}
                  onClick={onOpenNowClick}
                  pressed={filterState.openNow}
                />
              </div>
            )
          }

          return (
            <div key={key} role="listitem">
              <FilterChip
                label={getChipLabel(key)}
                surface={surface}
                active={isChipActive(key)}
                trailing={trailingFor(key)}
                disabled={isChipLocked(key)}
                onClick={() => {
                  if (isChipLocked(key)) return
                  openSheet(key as Exclude<FilterKey, "openNow">)
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
