import { Typography } from "@bolteu/kalep-react"
import type { ClaimOfferButtonSubtitle } from "@/features/offers/components/ClaimOfferModal/useClaimOfferButtonSubtitle"

export interface ClaimOfferPrimaryButtonProps {
  subtitle: ClaimOfferButtonSubtitle
  onClick: () => void
  disabled?: boolean
}

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

const INVERTED = "primary-inverted" as const

/**
 * Figma `[Dine-out] Main-button` — primary label + optional percent subtitles.
 */
export function ClaimOfferPrimaryButton({
  subtitle,
  onClick,
  disabled = false,
}: ClaimOfferPrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full flex-col items-center justify-center gap-0 rounded-full bg-action-primary px-6 py-2 transition-opacity hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Typography
        as="span"
        variant="body-l-accent"
        color={INVERTED}
        inlineStyle={SEMIBOLD}
      >
        Claim offer
      </Typography>
      <ClaimOfferButtonSubtitleRow subtitle={subtitle} />
    </button>
  )
}

function ClaimOfferButtonSubtitleRow({
  subtitle,
}: {
  subtitle: ClaimOfferButtonSubtitle
}) {
  if (subtitle.mode === "single") {
    return (
      <Typography as="span" variant="body-xs-regular" color={INVERTED}>
        {subtitle.label}
      </Typography>
    )
  }

  return (
    <span className="flex items-center justify-center gap-1">
      <Typography as="span" variant="body-xs-regular" color={INVERTED}>
        {subtitle.basePercent}%
      </Typography>
      <Typography as="span" variant="body-xs-regular" color={INVERTED}>
        +
      </Typography>
      <Typography as="span" variant="body-xs-regular" color={INVERTED}>
        {subtitle.addPercent}%
      </Typography>
    </span>
  )
}
