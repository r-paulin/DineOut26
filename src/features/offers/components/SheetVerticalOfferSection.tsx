import type { ReactNode } from "react"
import type { OfferCardModel } from "@/features/offers/offers.types"
import { OfferCard } from "./OfferCard"
import { SheetSectionHeader } from "./SheetSectionHeader"

export interface SheetVerticalOfferSectionProps {
  /** Passed to the outer `<section>` for a11y. */
  sectionAriaLabel: string
  title: ReactNode
  showAllLink?: boolean
  onAllClick?: () => void
  offers: OfferCardModel[]
  focusRestaurantId?: string | null
  onRestaurantPress?: (slug: string) => void
}

function offerSlug(o: OfferCardModel) {
  return o.restaurantSlug ?? o.id
}

/**
 * Vertical stack of XL `OfferCard`s + `SheetSectionHeader`, matching the home
 * bottom sheet “All restaurants” block (Figma discover sheet content).
 */
export function SheetVerticalOfferSection({
  sectionAriaLabel,
  title,
  showAllLink = false,
  onAllClick,
  offers,
  focusRestaurantId,
  onRestaurantPress,
}: SheetVerticalOfferSectionProps) {
  return (
    <section
      className="flex min-w-0 flex-col gap-4 pb-3"
      aria-label={sectionAriaLabel}
    >
      <SheetSectionHeader
        title={title}
        showAllLink={showAllLink}
        onAllClick={onAllClick}
      />
      <div className="flex min-w-0 flex-col overflow-x-visible">
        {offers.map((o) => (
          <div
            key={o.id}
            className="min-w-0 w-full"
            data-restaurant={offerSlug(o)}
          >
            <OfferCard
              offer={o}
              dimmed={
                !!focusRestaurantId && offerSlug(o) !== focusRestaurantId
              }
              onClick={
                onRestaurantPress && offerSlug(o)
                  ? () => onRestaurantPress(offerSlug(o))
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </section>
  )
}
