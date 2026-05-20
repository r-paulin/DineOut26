import { Typography } from "@bolteu/kalep-react"
import { BoltDineOutLogo } from "@/features/offers/components/ClaimedOfferPage/BoltDineOutLogo"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  HERO_ON_DARK_TEXT_STYLE,
  SEMIBOLD,
  formatWelcomeAtRestaurant,
} from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import {
  CLAIMED_OFFER_PIN_LABEL,
  CLAIMED_OFFER_WELCOME_INSTRUCTION,
} from "@/features/offers/constants/claimedOfferCopy"
import { parseClaimPinForDisplay } from "@/features/offers/components/ClaimedOfferPage/parseClaimPinForDisplay"
import {
  formatOfferWindowClosesLabel,
  useOfferCountdown,
} from "@/features/offers/components/ClaimedOfferPage/useOfferCountdown"

/**
 * Includes Kalep heading defaults (`cv03`, `cv04`) so we don't strip them when
 * adding lining/proportional figure features for PIN digits.
 */
const PIN_FONT_FEAT = "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const PIN_DIGIT_STYLE = {
  fontFeatureSettings: PIN_FONT_FEAT,
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
  ...HERO_ON_DARK_TEXT_STYLE,
} as const

export interface ClaimedOfferHeroSectionProps {
  restaurantName: string
  /** Numeric PIN string (digits only). Non-digit characters trigger a dev warning. */
  pin: string
  offerWindowCloses: string
}

/** Figma `16144:200886` — live countdown inside PIN card. */
function ClaimedOfferPinCountdown({ offerWindowCloses }: { offerWindowCloses: string }) {
  const { expired, countdownHms } = useOfferCountdown(offerWindowCloses)
  const label = formatOfferWindowClosesLabel(expired, countdownHms)

  return (
    <div
      className={claimedOfferLayout.pinFrameCountdown}
      aria-live="polite"
      aria-atomic="true"
    >
      <Typography
        variant="body-s-regular"
        as="p"
        align="center"
        inlineStyle={HERO_ON_DARK_TEXT_STYLE}
      >
        {label}
      </Typography>
    </div>
  )
}

export function ClaimedOfferHeroSection({
  restaurantName,
  pin,
  offerWindowCloses,
}: ClaimedOfferHeroSectionProps) {
  const pinResult = parseClaimPinForDisplay(pin)

  return (
    <section data-mode="dark" className={claimedOfferLayout.hero}>
      <div className={claimedOfferLayout.heroLogoRow}>
        <BoltDineOutLogo variant="onDark" />
      </div>

      <div className={claimedOfferLayout.heroCopy}>
        <Typography
          variant="heading-s-accent"
          as="h1"
          align="center"
          inlineStyle={{ ...SEMIBOLD, ...HERO_ON_DARK_TEXT_STYLE }}
        >
          {formatWelcomeAtRestaurant(restaurantName)}
        </Typography>
        <Typography
          variant="body-m-regular"
          as="p"
          align="center"
          inlineStyle={HERO_ON_DARK_TEXT_STYLE}
        >
          {CLAIMED_OFFER_WELCOME_INSTRUCTION}
        </Typography>
      </div>

      <div className={claimedOfferLayout.pinBlock}>
        <div className={claimedOfferLayout.pinFrame}>
          <div className={claimedOfferLayout.pinFrameLabel}>
            <Typography
              variant="body-s-regular"
              as="p"
              align="center"
              inlineStyle={HERO_ON_DARK_TEXT_STYLE}
            >
              {CLAIMED_OFFER_PIN_LABEL}
            </Typography>
          </div>
          {pinResult.ok ?
            <div
              className={claimedOfferLayout.pinDigitsRow}
              role="group"
              aria-label={`PIN ${pinResult.digits.join(" ")}`}
            >
              {pinResult.digits.map((digit, index) => (
                <div
                  key={`${index}-${digit}`}
                  className={claimedOfferLayout.pinDigit}
                >
                  <Typography
                    variant="heading-m-accent"
                    as="span"
                    align="center"
                    inlineStyle={PIN_DIGIT_STYLE}
                  >
                    {digit}
                  </Typography>
                </div>
              ))}
            </div>
          : <Typography
              variant="body-s-regular"
              as="p"
              align="center"
              inlineStyle={HERO_ON_DARK_TEXT_STYLE}
            >
              {pinResult.message}
            </Typography>
          }
          <ClaimedOfferPinCountdown offerWindowCloses={offerWindowCloses} />
        </div>
      </div>
    </section>
  )
}
