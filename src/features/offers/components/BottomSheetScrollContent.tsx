import { useEffect, useRef, type RefObject } from "react"
import { Typography } from "@bolteu/kalep-react"
import type {
  ClaimedOffer,
  OfferCardModel,
  SheetSnap,
} from "@/features/offers/offers.types"
import { OfferBanner } from "@/features/restaurant/components/OfferBanner/OfferBanner"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import type { UserClaim } from "@/features/restaurant/utils/offerState"
import { OfferCard } from "./OfferCard"
import { SheetSectionHeader } from "./SheetSectionHeader"
import { SheetVerticalOfferSection } from "./SheetVerticalOfferSection"

export interface BottomSheetScrollContentProps {
  snap: SheetSnap
  beginDrag: (e: React.PointerEvent) => void
  carouselTodayRef: RefObject<HTMLDivElement | null>
  offersToday: OfferCardModel[]
  offersDinner: OfferCardModel[]
  offersNearYou: OfferCardModel[]
  offersAllRestaurants: OfferCardModel[]
  focusRestaurantId: string | null
  onClearFocus?: () => void
  /** Monotonic counter — when it changes, reset vertical scroll to the top. */
  scrollToTopSignal?: number
  /** User tapped “All” on a carousel section — open full list for that slice. */
  onSeeAllSection?: (payload: { title: string }) => void
  onRestaurantPress?: (slug: string) => void
  /** Most recently claimed offer row (Figma DINEOUT header `_ Offer Banner`). */
  homeClaimedOfferCard?: RestaurantOfferCardModel | null
  userClaims?: readonly UserClaim[]
  claimedOffersById?: Readonly<Record<string, ClaimedOffer>>
  onHomeClaimedOfferPress?: () => void
}

function offerSlug(o: OfferCardModel) {
  return o.restaurantSlug ?? o.id
}

export function BottomSheetScrollContent({
  snap,
  beginDrag,
  carouselTodayRef,
  offersToday,
  offersDinner,
  offersNearYou,
  offersAllRestaurants,
  focusRestaurantId,
  onClearFocus,
  scrollToTopSignal,
  onSeeAllSection,
  onRestaurantPress,
  homeClaimedOfferCard = null,
  userClaims = [],
  claimedOffersById = {},
  onHomeClaimedOfferPress,
}: BottomSheetScrollContentProps) {
  const isFull = snap === "full"
  const isMin = snap === "minimized"
  const scrollClass = isFull
    ? "overflow-y-auto [-webkit-overflow-scrolling:touch] pt-[1em]"
    : "overflow-y-hidden [overscroll-behavior:none]"
  const scrollRootRef = useRef<HTMLDivElement>(null)

  /*
   * Reset the bottom-sheet scroll position when the parent bumps
   * `scrollToTopSignal` (View map tap). We set `scrollTop` synchronously so the
   * sheet is already at the top by the time it animates open again.
   */
  useEffect(() => {
    if (!scrollToTopSignal) return
    const el = scrollRootRef.current
    if (!el) return
    el.scrollTop = 0
  }, [scrollToTopSignal])

  return (
    <div
      ref={scrollRootRef}
      className={`flex-1 min-h-0 min-w-0 box-border bg-layer-floor-1 overflow-x-hidden px-6 pb-7 flex flex-col gap-1 ${scrollClass}`}
      role="region"
      aria-label="DineOut offers"
    >
      <header
        className="p-0 m-0 cursor-grab touch-none select-none active:cursor-grabbing relative z-[1]"
        onPointerDown={beginDrag}
      >
        <Typography
          as="h1"
          variant="heading-l-accent"
          color="primary"
          inlineStyle={{ letterSpacing: "-0.044rem" }}
        >
          DineOut
        </Typography>
        <Typography
          variant="body-m-regular"
          color="secondary"
          inlineStyle={{ letterSpacing: "-0.011rem" }}
        >
          Go out to eat and save on your bill
        </Typography>
      </header>

      <div
        className={`flex min-h-0 flex-1 flex-col gap-1 ${isMin ? "pointer-events-none" : ""}`}
      >
        {homeClaimedOfferCard ? (
          <section
            className="flex flex-col gap-2 -mx-1 pb-2"
            aria-label="Your claimed offer"
          >
            <OfferBanner
              offer={homeClaimedOfferCard}
              userClaims={userClaims}
              claimedOffersById={claimedOffersById}
              onClaimedPress={onHomeClaimedOfferPress}
            />
          </section>
        ) : null}

        {offersToday.length > 0 ? (
        <section
          className="flex flex-col gap-4 pb-3"
          aria-label="Today's best offers"
        >
          <SheetSectionHeader
            title="Today's best offers"
            onAllClick={() =>
              onSeeAllSection?.({ title: "Today's best offers" })
            }
          />
          <div
            className="flex gap-3 overflow-x-auto pb-0 -mx-6 px-6 [scroll-snap-type:x_proximity] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            ref={carouselTodayRef}
          >
            {offersToday.map((o) => (
              <div
                key={o.id}
                id={`offer-card-${o.id}`}
                data-restaurant={offerSlug(o)}
              >
                <OfferCard
                  offer={o}
                  dimmed={
                    !!focusRestaurantId && offerSlug(o) !== focusRestaurantId
                  }
                  onClick={() => {
                    const slug = offerSlug(o)
                    if (onRestaurantPress && slug) {
                      onRestaurantPress(slug)
                      return
                    }
                    onClearFocus?.()
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {offersDinner.length > 0 ? (
        <section
          className="flex flex-col gap-4 pb-3"
          aria-label="Dinner destinations"
        >
          <SheetSectionHeader
            title="Dinner destinations"
            onAllClick={() =>
              onSeeAllSection?.({ title: "Dinner destinations" })
            }
          />
          <div className="flex gap-3 overflow-x-auto pb-0 -mx-6 px-6 [scroll-snap-type:x_proximity] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {offersDinner.map((o) => (
              <div
                key={o.id}
                id={`offer-card-${o.id}`}
                data-restaurant={offerSlug(o)}
              >
                <OfferCard
                  offer={o}
                  dimmed={
                    !!focusRestaurantId && offerSlug(o) !== focusRestaurantId
                  }
                  onClick={() => {
                    const slug = offerSlug(o)
                    if (onRestaurantPress && slug) onRestaurantPress(slug)
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {offersNearYou.length > 0 ? (
        <section className="flex flex-col gap-4 pb-3" aria-label="Near you">
          <SheetSectionHeader
            title="Near you"
            onAllClick={() =>
              onSeeAllSection?.({ title: "Near you" })
            }
          />
          <div className="flex gap-3 overflow-x-auto pb-0 -mx-6 px-6 [scroll-snap-type:x_proximity] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {offersNearYou.map((o) => (
              <div
                key={o.id}
                id={`offer-card-${o.id}`}
                data-restaurant={offerSlug(o)}
              >
                <OfferCard
                  offer={o}
                  dimmed={
                    !!focusRestaurantId && offerSlug(o) !== focusRestaurantId
                  }
                  onClick={() => {
                    const slug = offerSlug(o)
                    if (onRestaurantPress && slug) onRestaurantPress(slug)
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

        {offersAllRestaurants.length > 0 ? (
          <SheetVerticalOfferSection
            sectionAriaLabel="All restaurants"
            title="All restaurants"
            showAllLink={false}
            offers={offersAllRestaurants}
            focusRestaurantId={focusRestaurantId}
            onRestaurantPress={onRestaurantPress}
          />
        ) : null}
      </div>
    </div>
  )
}
