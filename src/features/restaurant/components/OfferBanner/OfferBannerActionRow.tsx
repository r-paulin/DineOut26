import { Typography } from "@bolteu/kalep-react"
import ArrowCircleRight from "@bolteu/kalep-react-icons/dist/ArrowCircleRight"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import type { OfferBannerAction } from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface OfferBannerActionRowProps {
  action: OfferBannerAction
}

/**
 * Figma `[Eater] Action Button` on `_OfferCards`:
 * - Claim offer (enabled): primary text + green ArrowCircleRight
 * - Active / Claimed: action-primary + ArrowCircleRight
 * - Paid: action-primary + CheckCircle
 * - Disabled: tertiary + ArrowCircleRight
 */
export function OfferBannerActionRow({ action }: OfferBannerActionRowProps) {
  const isClaimCta =
    action.kind === "claim-now" || action.kind === "pre-book-now"
  const textColor =
    action.disabled ? "tertiary"
    : isClaimCta ? "primary"
    : "action-primary"
  const iconClass =
    action.disabled ? "text-tertiary" : "text-action-primary"
  const showCheck = action.kind === "paid"

  return (
    <div className="flex h-5 items-center gap-1">
      <Typography
        variant="body-s-accent"
        color={textColor as "tertiary" | "primary" | "action-primary"}
        as="span"
        noWrap
        inlineStyle={SEMIBOLD}
      >
        {action.label}
      </Typography>
      {showCheck ?
        <CheckCircle size="sm" className={`shrink-0 ${iconClass}`} aria-hidden />
      : <ArrowCircleRight
          size="sm"
          className={`shrink-0 ${iconClass}`}
          aria-hidden
        />}
    </div>
  )
}
