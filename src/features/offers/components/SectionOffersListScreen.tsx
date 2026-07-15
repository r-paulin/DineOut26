import { Typography } from "@bolteu/kalep-react"
import Search from "@bolteu/kalep-react-icons/dist/Search"
import { useCallback, useEffect, useRef } from "react"
import { MapViewFab } from "@/features/map"
import type { SearchFullscreenProps } from "@/features/search/search.types"
import { FilterChipRow } from "@/features/search/components/FilterChipRow"
import { SearchResultsStatic } from "@/features/search/components/SearchResultsStatic"
import { useSlideInPanel } from "@/shared/hooks/useSlideInPanel"

export interface SectionOffersListScreenProps extends SearchFullscreenProps {
  title: string
}

function preventBlurMouseDown(e: React.MouseEvent) {
  e.preventDefault()
}

export function SectionOffersListScreen({
  title,
  onClose,
  surface,
  filterState,
  getChipLabel,
  isChipActive,
  isChipLocked,
  openNowTrailing,
  openSheet,
  toggleOpenNowToday,
  clearOpenNowFilter,
  onRestaurantPress,
}: SectionOffersListScreenProps) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const { rootRef, scrimRef, panelRef, runExit } = useSlideInPanel(
    { scrimOpacity: 0 },
    onCloseRef,
  )

  const handleClose = useCallback(() => {
    runExit()
  }, [runExit])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[120] flex min-h-0 w-full max-w-[var(--shell-width)] mx-auto flex-col bg-layer-floor-1 box-border"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div ref={scrimRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden />
      <div
        ref={panelRef}
        className="relative z-[1] flex min-h-0 w-full flex-1 flex-col bg-layer-floor-1"
      >
        <div className="flex-none px-6 pt-6 bg-layer-floor-1 w-full min-w-0">
          <div className="flex items-center gap-3 min-h-12 w-full">
            <div className="flex-1 min-w-0 w-full h-12 flex items-center gap-[0.625rem] px-[0.875rem] pe-3 rounded-[var(--radius-search-field)] border bg-neutral-secondary border-transparent">
              <Search size="lg" className="shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 truncate">
                <Typography variant="body-m-regular" color="primary" as="span">
                  {title}
                </Typography>
              </span>
            </div>
            <button
              type="button"
              className="shrink-0 px-1 py-2 border-none bg-transparent text-sm leading-5 -tracking-[0.00375rem] text-primary cursor-pointer hover:opacity-85"
              onMouseDown={preventBlurMouseDown}
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </div>
        <div className="flex-none flex flex-row items-center pt-2 pb-3 px-6 bg-layer-floor-1 w-full min-w-0 overflow-x-auto overflow-y-visible touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [overscroll-behavior-x:contain]">
          <FilterChipRow
            surface={surface}
            filterState={filterState}
            getChipLabel={getChipLabel}
            isChipActive={isChipActive}
            isChipLocked={isChipLocked}
            openNowTrailing={openNowTrailing}
            openSheet={openSheet}
            toggleOpenNowToday={toggleOpenNowToday}
            clearOpenNowFilter={clearOpenNowFilter}
          />
          <div
            className="shrink-0 w-5 self-stretch pointer-events-none"
            aria-hidden
          />
        </div>
        <div
          className="flex-1 min-h-0 overflow-y-auto px-6 bg-layer-floor-1"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          }}
        >
          <div className="w-full min-w-0 pt-3">
            <SearchResultsStatic
              headingOverride={title}
              onRestaurantPress={onRestaurantPress}
            />
          </div>
        </div>
        <MapViewFab
          onClick={handleClose}
          zClassName="z-[125]"
          aboveBottomNav={false}
        />
      </div>
    </div>
  )
}
