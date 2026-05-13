import { useCallback, useRef } from "react"
import type { FilterKey, FilterState } from "@/features/search/filters.types"
import { FilterChip } from "./FilterChip"

export interface FilterChipRowProps {
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

const ROW_ORDER: FilterKey[] = [
  "date",
  "offer",
  "openNow",
  "offerTime",
  "price",
  "cuisine",
  "amenity",
]

/**
 * Horizontally scrolling filter chips for discover + search. Hosts a hidden
 * native `time` input when date ≠ Today so "Any time" / "At …" uses the OS picker.
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
  setOpenAtTime,
}: FilterChipRowProps) {
  const timeInputRef = useRef<HTMLInputElement>(null)

  const openNativeTimePicker = useCallback(() => {
    const el = timeInputRef.current
    if (!el) return
    if (typeof el.showPicker === "function") {
      void el.showPicker()
    } else {
      el.click()
    }
  }, [])

  const onOpenNowClick = useCallback(() => {
    if (filterState.date === "today") {
      if (openNowTrailing === "clear") {
        clearOpenNowFilter()
        return
      }
      toggleOpenNowToday()
      return
    }
    openNativeTimePicker()
  }, [
    clearOpenNowFilter,
    filterState.date,
    openNativeTimePicker,
    openNowTrailing,
    toggleOpenNowToday,
  ])

  const trailingFor = useCallback(
    (key: FilterKey): "chevron" | "clear" | "none" => {
      if (isChipLocked(key)) return "none"
      if (key === "openNow") {
        if (filterState.date === "today") {
          return openNowTrailing
        }
        return "chevron"
      }
      return "chevron"
    },
    [filterState.date, isChipLocked, openNowTrailing],
  )

  return (
    <div className="contents">
      <input
        ref={timeInputRef}
        type="time"
        aria-hidden
        tabIndex={-1}
        className="fixed w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
        value={filterState.openAt ?? ""}
        onChange={(e) => {
          const v = e.target.value
          setOpenAtTime(v === "" ? null : v)
        }}
      />
      <div
        className="flex flex-row items-center gap-2 w-max min-h-9 me-6 flex-none"
        role="list"
      >
        {ROW_ORDER.map((key) =>
          key === "openNow" ? (
            <div key={key} role="listitem">
              <FilterChip
                label={getChipLabel("openNow")}
                surface={surface}
                active={isChipActive("openNow")}
                trailing={trailingFor("openNow")}
                onClick={onOpenNowClick}
                pressed={
                  filterState.date === "today"
                    ? filterState.openNow
                    : undefined
                }
                aria-label={
                  filterState.date !== "today"
                    ? filterState.openAt
                      ? `Arrival time ${filterState.openAt}, tap to change`
                      : "Choose arrival time"
                    : undefined
                }
              />
            </div>
          ) : (
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
          ),
        )}
      </div>
    </div>
  )
}
