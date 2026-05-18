import { Typography } from "@bolteu/kalep-react"
import Lock from "@bolteu/kalep-react-icons/dist/Lock"
import PercentCircle from "@bolteu/kalep-react-icons/dist/PercentCircle"
import Time from "@bolteu/kalep-react-icons/dist/Time"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { useOfferCountdown } from "@/features/offers/components/ClaimedOfferPage/useOfferCountdown"
import type { OfferBannerSticker } from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"

/** Figma `Offer / Sticker` — 8px gap, left-aligned; icon 16×16. */
const STICKER_ROW_CLASS =
  "flex w-full items-center justify-start gap-2 px-3 pb-1.5 pt-1"

const STICKER_ICON_CLASS = "size-4 shrink-0"

export interface OfferBannerStickerRowProps {
  sticker: OfferBannerSticker
  claimed?: boolean
  claim?: ClaimedOffer
}

export function OfferBannerStickerRow({
  sticker,
  claimed = false,
  claim,
}: OfferBannerStickerRowProps) {
  const iconClass = claimed ? "text-primary-inverted" : "text-primary"

  if (sticker.kind === "countdown" && claim) {
    return (
      <OfferBannerCountdownSticker claim={claim} iconClass={iconClass} />
    )
  }

  return (
    <div className={STICKER_ROW_CLASS}>
      {sticker.kind === "scarcity" ?
        <PercentCircle
          className={`${STICKER_ICON_CLASS} ${iconClass}`}
          aria-hidden
        />
      : sticker.kind === "locked" ?
        <Lock className={`${STICKER_ICON_CLASS} ${iconClass}`} aria-hidden />
      : <Time className={`${STICKER_ICON_CLASS} ${iconClass}`} aria-hidden />}
      <Typography
        variant="body-xs-regular"
        color={claimed ? "primary-inverted" : "primary"}
        as="p"
      >
        {sticker.kind === "scarcity" ||
        sticker.kind === "expired" ||
        sticker.kind === "locked" ?
          sticker.text
        : ""}
      </Typography>
    </div>
  )
}

function OfferBannerCountdownSticker({
  claim,
  iconClass,
}: {
  claim: ClaimedOffer
  iconClass: string
}) {
  const { expired, countdownHms } = useOfferCountdown(claim.offerWindowCloses)
  const text =
    expired ? "Offer ended" : `Offer ends in ${countdownHms}`

  return (
    <div className={STICKER_ROW_CLASS}>
      <Time className={`${STICKER_ICON_CLASS} ${iconClass}`} aria-hidden />
      <Typography variant="body-xs-regular" color="primary-inverted" as="p">
        {text}
      </Typography>
    </div>
  )
}
