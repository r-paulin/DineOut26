import { Typography } from "@bolteu/kalep-react"
import HelpCircle from "@bolteu/kalep-react-icons/dist/HelpCircle"
import { BoltDineOutLogo } from "@/features/offers/components/ClaimedOfferPage/BoltDineOutLogo"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import { HERO_SUBTITLE_STYLE, SEMIBOLD } from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import {
  CLAIMED_OFFER_HERO_SUBTITLE_CHECKED_IN,
  CLAIMED_OFFER_HERO_SUBTITLE_NOT_CHECKED_IN,
  CLAIMED_OFFER_HOW_IT_WORKS_LABEL,
} from "@/features/offers/constants/claimedOfferCopy"

const HERO_TITLE_STYLE = {
  ...SEMIBOLD,
  color: "var(--color-static-content-key-light)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

const HOW_IT_WORKS_STYLE = {
  color: "var(--color-content-active-action-primary-inverted)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1",
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface ClaimedOfferHeroSectionProps {
  restaurantName: string
  checkedIn: boolean
  onHowItWorksPress?: () => void
}

/** Figma `17459:*` — logo, restaurant name, check-in-dependent subtitle, help link. */
export function ClaimedOfferHeroSection({
  restaurantName,
  checkedIn,
  onHowItWorksPress,
}: ClaimedOfferHeroSectionProps) {
  const subtitle =
    checkedIn ?
      CLAIMED_OFFER_HERO_SUBTITLE_CHECKED_IN
    : CLAIMED_OFFER_HERO_SUBTITLE_NOT_CHECKED_IN

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
          variant="body-s-regular"
          as="p"
          align="center"
          inlineStyle={HERO_SUBTITLE_STYLE}
        >
          {subtitle}
        </Typography>
      </div>

      <button
        type="button"
        className={claimedOfferLayout.howItWorksRow}
        onClick={onHowItWorksPress}
      >
        <Typography
          variant="body-s-accent"
          as="span"
          inlineStyle={HOW_IT_WORKS_STYLE}
        >
          {CLAIMED_OFFER_HOW_IT_WORKS_LABEL}
        </Typography>
        <HelpCircle
          size="sm"
          className="shrink-0 text-active-action-primary-inverted"
          aria-hidden
        />
      </button>
    </section>
  )
}
