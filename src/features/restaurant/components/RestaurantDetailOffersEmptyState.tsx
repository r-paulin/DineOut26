import { Typography } from "@bolteu/kalep-react"
import ChevronCircleRight from "@bolteu/kalep-react-icons/dist/ChevronCircleRight"
import { RESTAURANT_OFFERS_EMPTY_BROWSE_CTA } from "@/features/restaurant/constants/restaurantOffersSectionCopy"

/** Figma `19444:53627` — percent badge illustration. */
const EMPTY_ILLUSTRATION_SRC = "/images/restaurant-offers-empty.png"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

const FONT_FEAT = "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

/**
 * Empty state inside Offers tabpanel when the selected date has no offers.
 * Figma `19444:53627` — CTA returns to discover/home.
 */
export function RestaurantDetailOffersEmptyState({
  onBrowseNearbyOffers,
}: {
  onBrowseNearbyOffers?: () => void
}) {
  return (
    <div className="flex w-full flex-col items-center gap-3 pt-6 text-center">
      <img
        src={EMPTY_ILLUSTRATION_SRC}
        alt=""
        width={48}
        height={48}
        className="block size-12 object-contain"
        loading="lazy"
        decoding="async"
      />
      <div className="flex w-full flex-col items-center gap-1">
        <Typography
          variant="body-m-accent"
          color="primary"
          as="p"
          align="center"
          inlineStyle={{
            ...SEMIBOLD,
            letterSpacing: "-0.176px",
            fontFeatureSettings: FONT_FEAT,
          }}
        >
          No offers on this day
        </Typography>
        <Typography
          variant="body-s-regular"
          color="secondary"
          as="p"
          align="center"
          inlineStyle={{
            letterSpacing: "-0.084px",
            fontFeatureSettings: FONT_FEAT,
          }}
        >
          There are currently no offers in this venue. Try another location or
          check back soon.
        </Typography>
      </div>
      {onBrowseNearbyOffers ?
        <button
          type="button"
          className="flex w-fit items-center overflow-hidden border-none bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
          onClick={onBrowseNearbyOffers}
        >
          <Typography
            variant="body-s-accent"
            color="action-primary"
            as="span"
            inlineStyle={{
              ...SEMIBOLD,
              letterSpacing: "-0.084px",
              fontFeatureSettings: FONT_FEAT,
              lineHeight: "18px",
            }}
          >
            {RESTAURANT_OFFERS_EMPTY_BROWSE_CTA}
          </Typography>
          <ChevronCircleRight
            size="sm"
            className="ml-1.5 shrink-0 text-action-primary"
            aria-hidden
          />
        </button>
      : null}
    </div>
  )
}
