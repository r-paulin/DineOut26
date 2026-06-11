import { Typography } from "@bolteu/kalep-react"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import { parseClaimPinForDisplay } from "@/features/offers/components/ClaimedOfferPage/parseClaimPinForDisplay"
import { CLAIMED_OFFER_PIN_LABEL } from "@/features/offers/constants/claimedOfferCopy"

const PIN_FONT_FEAT = "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const PIN_DIGIT_STYLE = {
  fontFeatureSettings: PIN_FONT_FEAT,
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
  color: "var(--color-static-content-key-light)",
} as const

const PIN_LABEL_STYLE = {
  color: "var(--color-content-primary-inverted)",
  fontFeatureSettings: PIN_FONT_FEAT,
} as const

export interface ClaimedOfferPinBannerProps {
  pin: string
}

/** Figma `17459:184404` — inline green PIN banner (visible only after check-in). */
export function ClaimedOfferPinBanner({ pin }: ClaimedOfferPinBannerProps) {
  const pinResult = parseClaimPinForDisplay(pin)

  return (
    <div className={claimedOfferLayout.pinBannerOuter}>
      <div className={claimedOfferLayout.pinBannerInner}>
        <div className={claimedOfferLayout.pinBannerLabel}>
          <Typography
            variant="body-s-regular"
            as="p"
            inlineStyle={PIN_LABEL_STYLE}
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
                  variant="heading-s-accent"
                  as="span"
                  align="center"
                  inlineStyle={PIN_DIGIT_STYLE}
                >
                  {digit}
                </Typography>
              </div>
            ))}
          </div>
        : <Typography variant="body-s-regular" as="p" inlineStyle={PIN_LABEL_STYLE}>
            {pinResult.message}
          </Typography>
        }
      </div>
    </div>
  )
}
