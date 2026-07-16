import { Typography } from "@bolteu/kalep-react"
import gsap from "gsap"
import { useCallback, useEffect, useRef } from "react"
import { MapViewFab } from "@/features/map"
import type { OfferCardModel } from "@/features/offers/offers.types"
import { OfferCard } from "@/features/offers/components/OfferCard"
import type { DateValue } from "@/features/search/filters.types"
import type { FilterChipBarProps } from "@/features/search/search.types"
import { FilterChipRow } from "@/features/search/components/FilterChipRow"
import { MapSearchTrigger } from "@/features/search/components/MapSearchTrigger"
import { venueCountLabel } from "@/features/search/utils/venueCountLabel"
import { useSlideInPanel } from "@/shared/hooks/useSlideInPanel"
import {
  EASE_EMPHASIZED_EXIT,
  MOTION_SHEET_SEQUENTIAL_GAP_S,
  MOTION_SNACKBAR_EXIT_S,
  motionReduced,
  registerMotion,
} from "@/shared/motion"
import { DiscoverFilteredEmptyState } from "./DiscoverFilteredEmptyState"
import { FilteredOffersListSkeleton } from "./FilteredOffersListSkeleton"

registerMotion()

/** FAB settles downward on dismiss (same family as snackbar exit). */
const MAP_VIEW_FAB_EXIT_Y_PX = 24

export interface FilteredOffersFullscreenProps extends FilterChipBarProps {
  offers: OfferCardModel[]
  loading: boolean
  selectedDate: DateValue
  liveNowFilter?: boolean
  onClose: () => void
  onOpenSearch: () => void
  onViewMap: () => void
  /** Clears filters; must keep the expanded list open. */
  onResetFilters: () => void
  onRestaurantPress?: (slug: string) => void
}

function offerSlug(o: OfferCardModel): string {
  return o.restaurantSlug ?? o.id
}

/**
 * Fullscreen filtered venue list — Figma `19444:55994` (skeleton),
 * `19444:56039` (results), `19444:56050` (empty).
 */
export function FilteredOffersFullscreen({
  offers,
  loading,
  selectedDate,
  liveNowFilter,
  onClose,
  onOpenSearch,
  onViewMap,
  onResetFilters,
  onRestaurantPress,
  surface,
  filterState,
  getChipLabel,
  isChipActive,
  isChipLocked,
  openNowTrailing,
  openSheet,
  toggleOpenNowToday,
  clearOpenNowFilter,
}: FilteredOffersFullscreenProps) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const fabRef = useRef<HTMLDivElement>(null)
  const exitingViewMapRef = useRef(false)

  const { rootRef, scrimRef, panelRef, runExit } = useSlideInPanel(
    { scrimOpacity: 0 },
    onCloseRef,
  )

  const handleViewMap = useCallback(() => {
    if (exitingViewMapRef.current) return
    exitingViewMapRef.current = true

    // Collapse discover sheet under the overlay first so exit reveals map-first home.
    onViewMap()

    const exitPage = () => {
      runExit(() => {
        onCloseRef.current()
      })
    }

    const fab = fabRef.current
    if (motionReduced() || !fab) {
      exitPage()
      return
    }

    // iOS sequential dismiss: FAB exits first, then the push panel.
    gsap.killTweensOf(fab)
    gsap.to(fab, {
      y: MAP_VIEW_FAB_EXIT_Y_PX,
      autoAlpha: 0,
      duration: MOTION_SNACKBAR_EXIT_S,
      ease: EASE_EMPHASIZED_EXIT,
      overwrite: true,
      onComplete: () => {
        const gapMs = Math.round(MOTION_SHEET_SEQUENTIAL_GAP_S * 1000)
        window.setTimeout(exitPage, gapMs)
      },
    })
  }, [onViewMap, runExit])

  /** Clear / Reset filters — stay in expanded list (View map exits). */
  const handleClearFilters = useCallback(() => {
    onResetFilters()
  }, [onResetFilters])

  const countTitle = venueCountLabel(offers.length)
  const showEmpty = !loading && offers.length === 0

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[120] mx-auto flex min-h-0 w-full max-w-[var(--shell-width)] flex-col box-border bg-layer-floor-1"
      role="dialog"
      aria-modal="true"
      aria-label="Filtered venues"
    >
      <div ref={scrimRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden />
      <div
        ref={panelRef}
        className="relative z-[1] flex min-h-0 w-full flex-1 flex-col bg-layer-floor-1"
      >
        <div className="w-full min-w-0 flex-none bg-layer-floor-1 px-6 pb-3 pt-6">
          <MapSearchTrigger
            onOpenSearch={onOpenSearch}
            placeholder="Search places to go..."
            searchLike
          />
        </div>
        <div className="flex min-w-0 w-full flex-none flex-row items-center overflow-x-auto overflow-y-visible bg-layer-floor-1 px-6 pb-3 pt-0 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [overscroll-behavior-x:contain]">
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
            className="pointer-events-none w-5 shrink-0 self-stretch"
            aria-hidden
          />
        </div>

        <div
          className={[
            "min-h-0 flex-1 overflow-y-auto bg-layer-floor-1",
            // Empty: no horizontal pad here — empty state owns 24px `px-6`.
            // Results: 24px pad; overflow-x visible so XL gallery `-mx-6` can peek.
            showEmpty ? "flex flex-col px-0" : "overflow-x-hidden px-6",
          ].join(" ")}
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)",
          }}
        >
          {loading ? <FilteredOffersListSkeleton /> : null}

          {showEmpty ? (
            <div className="content-reveal flex min-h-0 w-full flex-1 flex-col items-center justify-center">
              <DiscoverFilteredEmptyState onResetFilters={handleClearFilters} />
            </div>
          ) : null}

          {!loading && !showEmpty ? (
            <section
              className="content-reveal flex min-w-0 flex-col gap-4 overflow-x-visible pb-3"
              aria-label="Filtered venues"
            >
              <div className="flex w-full items-start justify-between gap-3 pt-3">
                <h2 className="m-0 min-w-0 flex-1 text-[1.75rem] font-semibold leading-9 tracking-[-0.0385rem] text-primary [font-variation-settings:'wght'_var(--font-weight-semibold)]">
                  {countTitle}
                </h2>
                <button
                  type="button"
                  className="shrink-0 cursor-pointer border-none bg-transparent p-0 pt-2"
                  onClick={handleClearFilters}
                >
                  <Typography
                    as="span"
                    variant="body-s-accent"
                    color="action-primary"
                  >
                    Reset
                  </Typography>
                </button>
              </div>
              <div className="flex min-w-0 flex-col overflow-x-visible">
                {offers.map((o) => (
                  <div
                    key={o.id}
                    className="min-w-0 w-full overflow-x-visible"
                    data-restaurant={offerSlug(o)}
                  >
                    <OfferCard
                      offer={o}
                      selectedDate={selectedDate}
                      liveNowFilter={liveNowFilter}
                      onClick={
                        onRestaurantPress ?
                          () => onRestaurantPress(offerSlug(o))
                        : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {!showEmpty ? (
          <MapViewFab
            ref={fabRef}
            onClick={handleViewMap}
            zClassName="z-[125]"
            aboveBottomNav={false}
          />
        ) : null}
      </div>
    </div>
  )
}
