import { useCallback, useEffect, useRef, useState } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { OfferBanner } from "@/features/restaurant/components/OfferBanner"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import type { UserClaim } from "@/features/restaurant/restaurantDetail.types"

export type HomeClaimedOfferItem = {
  offer: RestaurantOfferCardModel
  venueSlug: string
  claim: ClaimedOffer
}

export interface HomeClaimedOffersCarouselProps {
  items: readonly HomeClaimedOfferItem[]
  userClaims: readonly UserClaim[]
  claimedOffersById: Readonly<Record<string, ClaimedOffer>>
  onOfferPress?: (claim: ClaimedOffer) => void
}

const CARD_SNAP_SELECTOR = "[data-home-claimed-card]"
/** Figma `16671:55028` — first banner inset from sheet edge. */
const CAROUSEL_LEAD_INSET_PX = 24
const CARD_STEP_PX = 345 + 10

/**
 * Horizontal claimed-offer banners on home (Figma `16671:55011`, dots `16672:55973`).
 */
export function HomeClaimedOffersCarousel({
  items,
  userClaims,
  claimedOffersById,
  onOfferPress,
}: HomeClaimedOffersCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const multi = items.length > 1

  useEffect(() => {
    setActiveIndex(0)
  }, [items.length, items.map((i) => i.offer.id).join(",")])

  useEffect(() => {
    const root = scrollRef.current
    if (!root || !multi) return

    const cards = root.querySelectorAll<HTMLElement>(CARD_SNAP_SELECTOR)
    if (cards.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]?.target
        if (!top) return
        const idx = Number((top as HTMLElement).dataset.cardIndex)
        if (Number.isFinite(idx)) setActiveIndex(idx)
      },
      { root, threshold: [0.5, 0.75] },
    )

    cards.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [multi, items])

  const onScroll = useCallback(() => {
    if (!multi) return
    const el = scrollRef.current
    if (!el) return
    const index = Math.round(
      Math.max(0, el.scrollLeft - (multi ? CAROUSEL_LEAD_INSET_PX : 0)) / CARD_STEP_PX,
    )
    setActiveIndex(Math.min(Math.max(0, index), items.length - 1))
  }, [items.length, multi])

  if (items.length === 0) return null

  /**
   * Figma `16671:55028`: `-mx-6` full-width viewport; leading `w-6` spacer = 24px inset
   * (padding alone is unreliable with parent overflow-x-hidden + snap).
   */
  const scrollClass = multi
    ? "-mx-6 flex gap-[10px] overflow-x-auto pr-6 snap-x snap-mandatory scroll-pl-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    : "flex gap-[10px] overflow-x-auto px-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"

  return (
    <section className="flex flex-col gap-2 pb-2" aria-label="Your claimed offers">
      <div ref={scrollRef} onScroll={onScroll} className={scrollClass}>
        {multi ?
          <div className="w-6 shrink-0" aria-hidden />
        : null}
        {items.map(({ offer, venueSlug, claim }, i) => (
          <div
            key={offer.id}
            data-home-claimed-card
            data-card-index={i}
            role="button"
            tabIndex={0}
            aria-label={`Open ${offer.restaurantName ?? "restaurant"} restaurant`}
            className="min-w-[345px] max-w-[345px] shrink-0 snap-start cursor-pointer rounded-[12px] outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 [&_button]:pointer-events-none"
            onClick={() => onOfferPress?.(claim)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onOfferPress?.(claim)
              }
            }}
          >
            <OfferBanner
              context="home"
              offer={offer}
              venueSlug={venueSlug}
              userClaims={userClaims}
              claimedOffersById={claimedOffersById}
            />
          </div>
        ))}
      </div>
      {multi ?
        <div
          role="tablist"
          aria-label="Claimed offer pages"
          className="flex items-center justify-center gap-1.5 py-1.5"
        >
          {items.map((item, i) => (
            <span
              key={item.offer.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Offer ${i + 1} of ${items.length}`}
              className={`size-2 shrink-0 rounded-full transition-colors ${i === activeIndex ? "bg-action-primary" : "bg-neutral-secondary"}`}
            />
          ))}
        </div>
      : null}
    </section>
  )
}
