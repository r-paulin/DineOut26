import HelpCircle from "@bolteu/kalep-react-icons/dist/HelpCircle"
import { Typography } from "@bolteu/kalep-react"
import { useState } from "react"
import type {
  ClaimedOffer,
  OfferCardModel,
  SheetSnap,
} from "@/features/offers/offers.types"
import type { DateValue } from "@/features/search/filters.types"
import { useBottomSheet } from "@/features/offers/hooks/useBottomSheet"
import type { UserClaim } from "@/features/restaurant/utils/offerState"
import type { HomeClaimedOfferItem } from "@/features/discover/components/HomeClaimedOffersCarousel"
import { BottomSheetScrollContent } from "./BottomSheetScrollContent"
import { DINEOUT_PROMO_IMG_WRAP } from "./dineOutPromoFigmaAssets"
import { DineOutPromoSheet } from "./DineOutPromoSheet"

export type { SheetSnap } from "@/features/offers/offers.types"
export {
  SHEET_HEIGHT_MIN,
  SHEET_HEIGHT_PEEK,
} from "@/features/offers/utils/bottomSheetLayout"

export interface BottomSheetProps {
  snap: SheetSnap
  onSnapChange: (snap: SheetSnap) => void
  offersToday: OfferCardModel[]
  offersDinner: OfferCardModel[]
  offersNearYou: OfferCardModel[]
  offersAllRestaurants: OfferCardModel[]
  focusRestaurantId: string | null
  onClearFocus?: () => void
  /** Bumped to request a scroll-to-top of the sheet content (e.g. View map tap). */
  scrollToTopSignal?: number
  onSeeAllSection?: (payload: { title: string }) => void
  onRestaurantPress?: (slug: string) => void
  homeClaimedOffers?: readonly HomeClaimedOfferItem[]
  userClaims?: readonly UserClaim[]
  claimedOffersById?: Readonly<Record<string, ClaimedOffer>>
  onHomeClaimedOfferPress?: (claim: ClaimedOffer) => void
  /** Prototype admin catalog editor (persists to localStorage). */
  onOpenAdminPlaces?: () => void
  /** When true, sheet is `relative` inside a parent fixed bottom dock (HomeScreen). */
  docked?: boolean
  /** Bumps when discover search stack height is measured so sheet heights match layout. */
  discoverLayoutEpoch?: number
  selectedDate?: DateValue
  liveNowFilter?: boolean
  showFilteredEmpty?: boolean
  onResetFilters?: () => void
}

/**
 * Draggable bottom sheet with offer carousels. Snap heights follow Figma;
 * drag handle cycles minimized → peek → full on short taps.
 *
 * Note: This is the DineOut custom sheet, NOT Kalep's `<BottomSheet>`. Kalep's
 * is a `vaul` modal; we need a persistent peek/min/full sheet with the map
 * behind it (pan/zoom disabled in peek; tap map minimizes to enable gestures).
 */
export function BottomSheet({
  snap,
  onSnapChange,
  offersToday,
  offersDinner,
  offersNearYou,
  offersAllRestaurants,
  focusRestaurantId,
  onClearFocus,
  scrollToTopSignal,
  onSeeAllSection,
  onRestaurantPress,
  homeClaimedOffers = [],
  userClaims = [],
  claimedOffersById = {},
  onHomeClaimedOfferPress,
  onOpenAdminPlaces,
  docked = false,
  discoverLayoutEpoch = 0,
  selectedDate = "today",
  liveNowFilter = false,
  showFilteredEmpty = false,
  onResetFilters,
}: BottomSheetProps) {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)
  const {
    carouselTodayRef,
    displayHeight,
    dragging,
    beginDrag,
    onHeaderToggleKey,
    showStickyHeader,
    showDragHandle,
  } = useBottomSheet({
    snap,
    onSnapChange,
    focusRestaurantId,
    onClearFocus,
    discoverLayoutEpoch,
  })

  const isFull = snap === "full"
  const isPeek = snap === "peek"
  const transitionClass = dragging
    ? "transition-none"
    : "transition-[height] duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)]"

  const sheetShadow =
    "shadow-[0_-0.125rem_0.5rem_rgba(0,45,30,0.06),0_-0.5rem_1.5rem_rgba(0,0,0,0.08)]"
  const surfaceClass = isFull
    ? "rounded-none bg-layer-floor-1 shadow-[0_0.5rem_1.5rem_rgba(0,0,0,0.1)]"
    : isPeek
      ? `rounded-t-[var(--sheet-radius)] bg-action-primary ${sheetShadow}`
      : `rounded-t-[var(--sheet-radius)] bg-layer-floor-1 ${sheetShadow}`

  const positionClass = docked
    ? "relative z-20 w-full"
    : "fixed left-1/2 bottom-[var(--nav-layout-offset)] z-20 w-full max-w-[var(--shell-width)] -translate-x-1/2"

  return (
    <div
      className={`${positionClass} overflow-hidden flex flex-col box-border ${surfaceClass} ${transitionClass}`}
      style={{ height: `${displayHeight}px` }}
      data-snap={snap}
    >
      <DineOutPromoSheet
        isVisible={howItWorksOpen}
        onDismiss={() => setHowItWorksOpen(false)}
        heroImage={DINEOUT_PROMO_IMG_WRAP}
      />
      {showStickyHeader ? (
        <button
          type="button"
          className="flex-none min-h-8 box-border bg-action-primary px-4 pt-1 pb-4 flex items-center justify-center cursor-grab touch-none border-none w-full active:cursor-grabbing rounded-t-[var(--sheet-radius)]"
          onPointerDown={(e) =>
            beginDrag(e, {
              onShortTap: () => {
                setHowItWorksOpen(true)
                return true
              },
            })
          }
          onKeyDown={onHeaderToggleKey}
        >
          <span className="flex items-center justify-center gap-1 text-static-key-light">
            <Typography
              variant="body-m-regular"
              as="span"
              color="primary-inverted"
              inlineStyle={{ letterSpacing: "-0.011rem" }}
            >
              How DineOut works
            </Typography>
            <HelpCircle size="xs" className="shrink-0 text-static-key-light" />
          </span>
        </button>
      ) : null}
      {showDragHandle ? (
        <div
          className={`flex-none h-8 flex shrink-0 items-center justify-center border-0 border-b-0 shadow-none bg-layer-floor-1 cursor-grab touch-none active:cursor-grabbing rounded-t-[var(--sheet-radius)] ${
            showStickyHeader ? "-mt-4 -mb-px relative z-[1]" : ""
          }`}
          onPointerDown={beginDrag}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Drag to resize"
        >
          <span className="w-12 h-1.5 rounded-full bg-[var(--color-border-separator)]" />
        </div>
      ) : null}
      <div
        className={
          showStickyHeader && showDragHandle
            ? "-mt-px relative z-0 flex min-h-0 flex-1 flex-col"
            : "flex min-h-0 flex-1 flex-col"
        }
      >
        <BottomSheetScrollContent
          snap={snap}
          beginDrag={beginDrag}
          carouselTodayRef={carouselTodayRef}
          offersToday={offersToday}
          offersDinner={offersDinner}
          offersNearYou={offersNearYou}
          offersAllRestaurants={offersAllRestaurants}
          focusRestaurantId={focusRestaurantId}
          onClearFocus={onClearFocus}
          scrollToTopSignal={scrollToTopSignal}
          onSeeAllSection={onSeeAllSection}
          onRestaurantPress={onRestaurantPress}
          homeClaimedOffers={homeClaimedOffers}
          userClaims={userClaims}
          claimedOffersById={claimedOffersById}
          onHomeClaimedOfferPress={onHomeClaimedOfferPress}
          onOpenAdminPlaces={onOpenAdminPlaces}
          selectedDate={selectedDate}
          liveNowFilter={liveNowFilter}
          showFilteredEmpty={showFilteredEmpty}
          onResetFilters={onResetFilters}
        />
      </div>
    </div>
  )
}
