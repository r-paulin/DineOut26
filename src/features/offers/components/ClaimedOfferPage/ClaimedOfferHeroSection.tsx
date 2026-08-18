import { Typography } from "@bolteu/kalep-react"
import Directions from "@bolteu/kalep-react-icons/dist/Directions"
import { BoltDineOutLogo } from "@/features/offers/components/ClaimedOfferPage/BoltDineOutLogo"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import { SEMIBOLD } from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import { CLAIMED_OFFER_GET_DIRECTIONS_LABEL } from "@/features/offers/constants/claimedOfferCopy"

const HERO_TITLE_STYLE = {
  ...SEMIBOLD,
  color: "var(--color-static-content-key-light)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

/** Figma Body L/L Regular on `static/content/primary-light`. */
const HERO_DISCOUNT_STYLE = {
  color: "var(--color-static-content-primary-light)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

const DIRECTIONS_STYLE = {
  color: "var(--color-content-active-action-primary-inverted)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1",
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
  lineHeight: "var(--body-s-compact-line-height, 18px)",
} as const

export interface ClaimedOfferHeroSectionProps {
  restaurantName: string
  /** Discount line under the venue name, e.g. "30% off your bill". */
  discountLabel: string
  mapsHref: string
}

/** Figma `20886:109714` — logo, venue, discount, Get directions. */
export function ClaimedOfferHeroSection({
  restaurantName,
  discountLabel,
  mapsHref,
}: ClaimedOfferHeroSectionProps) {
  return (
    <section data-mode="dark" className={claimedOfferLayout.hero}>
      <BoltDineOutLogo />

      <div className={claimedOfferLayout.heroCopy}>
        <Typography
          variant="heading-m-accent"
          as="h1"
          align="center"
          inlineStyle={HERO_TITLE_STYLE}
        >
          {restaurantName}
        </Typography>
        <Typography
          variant="body-l-regular"
          as="p"
          align="center"
          inlineStyle={HERO_DISCOUNT_STYLE}
        >
          {discountLabel}
        </Typography>
      </div>

      <a
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className={claimedOfferLayout.getDirectionsRow}
        aria-label={`${CLAIMED_OFFER_GET_DIRECTIONS_LABEL} (opens Google Maps)`}
      >
        <Typography
          variant="body-s-accent"
          as="span"
          inlineStyle={DIRECTIONS_STYLE}
        >
          {CLAIMED_OFFER_GET_DIRECTIONS_LABEL}
        </Typography>
        <Directions
          size="sm"
          className="shrink-0 text-active-action-primary-inverted"
          aria-hidden
        />
      </a>
    </section>
  )
}
