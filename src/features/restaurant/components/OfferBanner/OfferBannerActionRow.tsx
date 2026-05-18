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

export function OfferBannerActionRow({ action }: OfferBannerActionRowProps) {
  const textColor =
    action.disabled ? "tertiary" : "action-primary"
  const iconClass =
    action.disabled ? "text-tertiary" : "text-action-primary"

  return (
    <div className="flex h-5 items-center gap-1">
      <Typography
        variant="body-s-accent"
        color={textColor as "tertiary" | "action-primary"}
        as="span"
        noWrap
        inlineStyle={SEMIBOLD}
      >
        {action.label}
      </Typography>
      {action.kind === "claimed" ?
        <CheckCircle size="sm" className={`shrink-0 ${iconClass}`} aria-hidden />
      : <ArrowCircleRight size="sm" className={`shrink-0 ${iconClass}`} aria-hidden />}
    </div>
  )
}
