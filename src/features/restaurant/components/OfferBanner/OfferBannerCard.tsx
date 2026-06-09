import { Typography } from "@bolteu/kalep-react"
import { OfferBannerActionRow } from "@/features/restaurant/components/OfferBanner/OfferBannerActionRow"
import { OfferBannerMiniBannerImg } from "@/features/restaurant/components/OfferBanner/OfferBannerMiniBannerImg"
import type {
  OfferBannerContent,
  OfferBannerDataLine,
} from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

const CLAIMED_INNER_GRADIENT =
  "linear-gradient(90deg, rgba(0, 160, 64, 0.09) 0%, rgba(0, 160, 64, 0.09) 100%), linear-gradient(90deg, rgb(238, 241, 240) 0%, rgb(238, 241, 240) 100%)"

export interface OfferBannerCardProps {
  content: OfferBannerContent
}

export function OfferBannerCard({ content }: OfferBannerCardProps) {
  const claimable =
    content.innerClaimed ||
    (content.action != null && !content.action.disabled)
  const innerClass =
    content.innerClaimed ?
      "relative min-h-[96px] w-full overflow-hidden rounded-[12px] border border-action-secondary bg-layer-floor-0-grouped p-3"
    : claimable ?
      "relative min-h-[96px] w-full overflow-hidden rounded-[12px] border border-separator bg-layer-floor-0-grouped p-3"
    : "relative min-h-[96px] w-full overflow-hidden rounded-[12px] border border-separator bg-layer-floor-2 p-3"

  return (
    <div
      className={innerClass}
      style={content.innerClaimed ? { backgroundImage: CLAIMED_INNER_GRADIENT } : undefined}
    >
      <Typography
        variant="body-m-accent"
        color="primary"
        as="p"
        inlineStyle={SEMIBOLD}
      >
        {content.headline}
      </Typography>

      <div className="mt-2 flex flex-col gap-3 pr-14">
        {content.dataLines.length > 0 ?
          <div className="flex flex-col gap-1">
            {content.dataLines.map((line) => (
              <OfferBannerDataLineRow key={line.text} line={line} />
            ))}
          </div>
        : null}
        {content.action ?
          <OfferBannerActionRow action={content.action} />
        : null}
      </div>

      <OfferBannerMiniBannerImg variant={content.imageVariant} />
    </div>
  )
}

function OfferBannerDataLineRow({ line }: { line: OfferBannerDataLine }) {
  const color =
    line.tone ??
    (line.emphasis === "accent" ? "primary" : "secondary")
  return (
    <Typography
      variant={line.emphasis === "accent" ? "body-s-accent" : "body-s-regular"}
      color={color}
      as="p"
      inlineStyle={line.emphasis === "accent" ? SEMIBOLD : undefined}
    >
      {line.text}
    </Typography>
  )
}
