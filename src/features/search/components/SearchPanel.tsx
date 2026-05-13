import type { FilterChipRowProps } from "./FilterChipRow"
import { FilterChipRow } from "./FilterChipRow"
import { MapSearchTrigger } from "./MapSearchTrigger"

export type SearchPanelProps = {
  onOpenSearch: () => void
  /** Grey search surface when bottom sheet is fully expanded (Figma). */
  sheetExpanded?: boolean
} & FilterChipRowProps

/**
 * Floats above the map at top of the home screen: search trigger pill plus a
 * horizontally-scrolling row of filter chips. Pointer events are disabled on
 * the wrapper so the map stays draggable in the empty space.
 */
export function SearchPanel({
  onOpenSearch,
  sheetExpanded = false,
  surface,
  getChipLabel,
  isChipActive,
  isChipLocked,
  openNowTrailing,
  openSheet,
  toggleOpenNowToday,
  clearOpenNowFilter,
  setOpenAtTime,
  filterState,
}: SearchPanelProps) {
  const wrapperBg = sheetExpanded ? "bg-layer-floor-1" : ""
  const filtersDropShadow =
    surface === "floating" && !sheetExpanded
      ? "[filter:drop-shadow(0_0.125rem_0.1875rem_rgba(0,0,0,0.16))]"
      : ""
  return (
    <div
      className={`absolute inset-x-0 top-0 z-30 pointer-events-none w-full min-w-0 [&>*]:pointer-events-auto ${wrapperBg}`}
    >
      <div
        className={`min-h-12 flex items-center px-6 pt-6 ${wrapperBg}`}
      >
        <MapSearchTrigger
          onOpenSearch={onOpenSearch}
          searchLike={sheetExpanded}
        />
      </div>
      <div
        className={`min-h-12 flex flex-row items-center pt-2 pb-3 px-6 w-full min-w-0 overflow-x-auto overflow-y-visible touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [overscroll-behavior-x:contain] ${wrapperBg} ${filtersDropShadow}`}
      >
        <FilterChipRow
          surface={surface}
          getChipLabel={getChipLabel}
          isChipActive={isChipActive}
          isChipLocked={isChipLocked}
          openNowTrailing={openNowTrailing}
          openSheet={openSheet}
          toggleOpenNowToday={toggleOpenNowToday}
          clearOpenNowFilter={clearOpenNowFilter}
          setOpenAtTime={setOpenAtTime}
          filterState={filterState}
        />
        <div
          className="shrink-0 w-5 self-stretch pointer-events-none"
          aria-hidden
        />
      </div>
    </div>
  )
}
