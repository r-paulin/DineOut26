import { useCallback, useState } from "react"
import { TimeSlotSheet } from "@/features/offers/components/ClaimOfferModal/TimeSlotSheet"
import { generateQuarterHourSlots } from "@/features/offers/utils/offerTimePicker"
import type { FilterKey, FilterState } from "@/features/search/filters.types"
import { useDeviceShell } from "@/shared/context/useDeviceShell"
import { FilterChip } from "./FilterChip"

/** Full-day quarter-hour grid for “open at” when browsing a non-today date. */
const OPEN_AT_TIME_SLOTS = generateQuarterHourSlots("00:00", "23:45")

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
 * Horizontally scrolling filter chips for discover + search. Non-today “open at”
 * uses the same quarter-hour bottom sheet as the claim flow (no native time input).
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
  const { portalRoot } = useDeviceShell()
  const [openAtSheetOpen, setOpenAtSheetOpen] = useState(false)

  const openOpenAtSheet = useCallback(() => {
    setOpenAtSheetOpen(true)
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
    openOpenAtSheet()
  }, [
    clearOpenNowFilter,
    filterState.date,
    openOpenAtSheet,
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
      <TimeSlotSheet
        variant="standalone"
        listTitle="Arrival time"
        isOpen={openAtSheetOpen}
        onOpenChange={setOpenAtSheetOpen}
        slots={OPEN_AT_TIME_SLOTS}
        value={filterState.openAt ?? ""}
        onChange={(t) => setOpenAtTime(t)}
        container={portalRoot ?? undefined}
      />
    </div>
  )
}
