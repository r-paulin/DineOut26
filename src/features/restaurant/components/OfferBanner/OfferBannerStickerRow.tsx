import { Typography } from "@bolteu/kalep-react"
import CashbackColoured from "@bolteu/kalep-react-icons/dist/CashbackColoured"
import Lock from "@bolteu/kalep-react-icons/dist/Lock"
import PercentFlower from "@bolteu/kalep-react-icons/dist/PercentFlower"
import Time from "@bolteu/kalep-react-icons/dist/Time"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { useOfferCountdown } from "@/features/offers/components/ClaimedOfferPage/useOfferCountdown"
import type { OfferBannerSticker } from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"

/** Figma `16103:17598` Offer / Sticker — 8px gap, 12px horizontal padding. */
const STICKER_ROW_CLASS =
  "flex w-full items-center justify-start gap-2 px-3 pb-1.5 pt-1"

const STICKER_ICON_CLASS = "size-4 shrink-0"

export interface OfferBannerStickerRowProps {
  sticker: OfferBannerSticker
  claimed?: boolean
  claim?: ClaimedOffer
}

function stickerTone(
  sticker: OfferBannerSticker,
  claimed: boolean,
): {
  iconClass: string
  textColor: "primary-inverted" | "primary" | "tertiary" | "danger-primary"
} {
  if (claimed) {
    return { iconClass: "text-primary-inverted", textColor: "primary-inverted" }
  }
  if (sticker.kind === "scarcity") {
    return { iconClass: "text-danger-primary", textColor: "danger-primary" }
  }
  if (sticker.kind === "locked" || sticker.kind === "expired") {
    return { iconClass: "text-tertiary", textColor: "primary" }
  }
  return { iconClass: "text-primary", textColor: "primary" }
}

export function OfferBannerStickerRow({
  sticker,
  claimed = false,
  claim,
}: OfferBannerStickerRowProps) {
  const { iconClass, textColor } = stickerTone(sticker, claimed)

  if (sticker.kind === "countdown" && claim) {
    return (
      <OfferBannerCountdownSticker claim={claim} iconClass={iconClass} />
    )
  }

  if (sticker.kind === "dineout-upsell") {
    return (
      <div className={STICKER_ROW_CLASS}>
        <CashbackColoured
          className={`${STICKER_ICON_CLASS} text-primary-inverted`}
          aria-hidden
        />
        <Typography variant="body-xs-regular" color="primary-inverted" as="p">
          {sticker.text}
        </Typography>
      </div>
    )
  }

  return (
    <div className={STICKER_ROW_CLASS}>
      {sticker.kind === "scarcity" ?
        <PercentFlower
          className={`${STICKER_ICON_CLASS} ${iconClass}`}
          aria-hidden
        />
      : sticker.kind === "locked" ?
        <Lock className={`${STICKER_ICON_CLASS} ${iconClass}`} aria-hidden />
      : <Time className={`${STICKER_ICON_CLASS} ${iconClass}`} aria-hidden />}
      <Typography variant="body-xs-regular" color={textColor} as="p">
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
