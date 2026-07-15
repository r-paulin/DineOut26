import { Typography } from "@bolteu/kalep-react"
import Lock from "@bolteu/kalep-react-icons/dist/Lock"
import Offer from "@bolteu/kalep-react-icons/dist/Offer"
import Time from "@bolteu/kalep-react-icons/dist/Time"
import { OfferBannerActionRow } from "@/features/restaurant/components/OfferBanner/OfferBannerActionRow"
import { OfferBannerMiniBannerImg } from "@/features/restaurant/components/OfferBanner/OfferBannerMiniBannerImg"
import type {
  OfferBannerBadge,
  OfferBannerContent,
  OfferBannerDataLine,
} from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

/** Figma Body S/S Compact Accent — claimed schedule / arrival data lines. */
const BODY_S_COMPACT_ACCENT_STYLE = {
  fontFamily: "var(--font-family)",
  fontSize: "var(--body-s-font-size, 0.875rem)",
  lineHeight: "18px",
  letterSpacing: "-0.084px",
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

/** Figma Body M/M Compact Accent — offer title. */
const BODY_M_COMPACT_ACCENT_STYLE = {
  ...SEMIBOLD,
  lineHeight: "20px",
  letterSpacing: "-0.176px",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

/**
 * Figma Claimed / Paid — mint wash on white (`16084:49908`, `17649:34551`).
 */
const CLAIMED_INNER_GRADIENT =
  "linear-gradient(90deg, rgba(0, 160, 64, 0.09) 0%, rgba(0, 160, 64, 0.09) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)"

const PAID_INNER_GRADIENT = CLAIMED_INNER_GRADIENT

/** Figma Body S/S Compact Regular — unclaimed schedule / paid total. */
const BODY_S_COMPACT_REGULAR_STYLE = {
  fontFamily: "var(--font-family)",
  fontSize: "var(--body-s-font-size, 0.875rem)",
  lineHeight: "18px",
  letterSpacing: "-0.084px",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

const BADGE_ICON_CLASS = "size-4 shrink-0 text-primary"

export interface OfferBannerCardProps {
  content: OfferBannerContent
}

/**
 * Inner offer card — Figma `_OfferCards` (`16005:12046`).
 * Unclaimed/Expired: badge → title+schedule (2px) → CTA (8px sections).
 * Claimed: title → schedule+CTA (8px / 12px).
 */
export function OfferBannerCard({ content }: OfferBannerCardProps) {
  /** Figma Offer / Content — 12px padding on all sides (`dimension/300`). */
  const innerClass =
    content.innerClaimed ?
      "relative min-h-[96px] w-full overflow-hidden rounded-[12px] px-3 py-3"
    : "relative min-h-[96px] w-full overflow-hidden rounded-[12px] bg-layer-floor-0-grouped px-3 py-3"

  const innerGradient =
    content.innerSurface === "paid" ? PAID_INNER_GRADIENT
    : content.innerClaimed ? CLAIMED_INNER_GRADIENT
    : undefined

  return (
    <div
      className={innerClass}
      style={innerGradient ? { backgroundImage: innerGradient } : undefined}
    >
      {content.innerClaimed ?
        <ClaimedCardBody content={content} />
      : <AvailableCardBody content={content} />}

      <OfferBannerMiniBannerImg variant={content.imageVariant} />
    </div>
  )
}

function AvailableCardBody({ content }: { content: OfferBannerContent }) {
  return (
    <div className="flex flex-col gap-2">
      {content.badge ?
        <OfferBannerBadgeRow badge={content.badge} />
      : null}
      <div className="flex flex-col gap-0.5">
        <Typography
          variant="body-m-accent"
          color="primary"
          as="p"
          inlineStyle={BODY_M_COMPACT_ACCENT_STYLE}
        >
          {content.headline}
        </Typography>
        {content.dataLines.map((line) => (
          <OfferBannerDataLineRow key={line.text} line={line} />
        ))}
      </div>
      {content.action ?
        <div className="pr-14">
          <OfferBannerActionRow action={content.action} />
        </div>
      : null}
    </div>
  )
}

function ClaimedCardBody({ content }: { content: OfferBannerContent }) {
  return (
    <div className="flex flex-col gap-2">
      <Typography
        variant="body-m-accent"
        color="primary"
        as="p"
        inlineStyle={BODY_M_COMPACT_ACCENT_STYLE}
      >
        {content.headline}
      </Typography>
      <div className="flex flex-col gap-3 pr-14">
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
    </div>
  )
}

function OfferBannerBadgeRow({ badge }: { badge: OfferBannerBadge }) {
  const icon =
    badge.kind === "locked" ?
      <Lock className={BADGE_ICON_CLASS} aria-hidden />
    : badge.kind === "expired" ?
      <Time className={BADGE_ICON_CLASS} aria-hidden />
    : <Offer className={BADGE_ICON_CLASS} aria-hidden />

  return (
    <div className="flex items-center gap-1">
      {icon}
      <Typography variant="body-xs-accent" color="primary" as="p">
        {badge.text}
      </Typography>
    </div>
  )
}

function OfferBannerDataLineRow({ line }: { line: OfferBannerDataLine }) {
  const color =
    line.tone ??
    (line.emphasis === "accent" ? "primary" : "secondary")
  const typography =
    line.typography ??
    (color === "primary" ? "compact-accent" : "compact-regular")
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
