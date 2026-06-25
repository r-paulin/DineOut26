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

/** Figma Body S/S Compact Accent — schedule / arrival data lines. */
const BODY_S_COMPACT_ACCENT_STYLE = {
  fontFamily: "var(--font-family)",
  fontSize: "var(--body-s-font-size, 0.875rem)",
  lineHeight: "18px",
  letterSpacing: "-0.084px",
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

const CLAIMED_INNER_GRADIENT =
  "linear-gradient(90deg, rgba(0, 160, 64, 0.09) 0%, rgba(0, 160, 64, 0.09) 100%), linear-gradient(90deg, rgb(238, 241, 240) 0%, rgb(238, 241, 240) 100%)"

const PAID_INNER_GRADIENT =
  "linear-gradient(90deg, rgba(0, 160, 64, 0.09) 0%, rgba(0, 160, 64, 0.09) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)"

/** Figma Body S/S Compact Regular — e.g. paid total bill line. */
const BODY_S_COMPACT_REGULAR_STYLE = {
  fontFamily: "var(--font-family)",
  fontSize: "var(--body-s-font-size, 0.875rem)",
  lineHeight: "18px",
  letterSpacing: "-0.084px",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

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

  const innerGradient =
    content.innerSurface === "paid" ? PAID_INNER_GRADIENT
    : content.innerClaimed ? CLAIMED_INNER_GRADIENT
    : undefined

  return (
    <div
      className={innerClass}
      style={innerGradient ? { backgroundImage: innerGradient } : undefined}
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
  const typography =
    line.typography ??
    (color === "primary" ? "compact-accent" : "default")
  const compactAccent = typography === "compact-accent"
  const compactRegular = typography === "compact-regular"
  return (
    <Typography
      variant={
        compactAccent ? "body-s-accent"
        : compactRegular ? "body-s-regular"
        : "body-s-regular"
      }
      color={color}
      as="p"
      inlineStyle={
        compactAccent ? BODY_S_COMPACT_ACCENT_STYLE
        : compactRegular ? BODY_S_COMPACT_REGULAR_STYLE
        : undefined
      }
    >
      {line.text}
    </Typography>
  )
}
