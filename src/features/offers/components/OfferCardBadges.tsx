import type { ReactNode } from "react"
import { Typography } from "@bolteu/kalep-react"
import PercentFlower from "@bolteu/kalep-react-icons/dist/PercentFlower"
import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"
import type { OfferCardCampaign } from "@/features/offers/offers.types"
import { hasCampaignBadges } from "@/features/offers/utils/mapPlaceCardView"
import {
  buildTimedOfferBadgeModels,
  type BadgeStackDisplayMode,
  formatCampaignBadgeTimeLabel,
} from "@/features/offers/utils/offerBadgeStack"
import {
  campaignTimeWindowDisplayActive,
  useOfferDisplayNow,
} from "@/features/offers/utils/offerDisplayActive"
import type { DateValue } from "@/features/search/filters.types"

export interface OfferCardBadgesProps {
  campaign: OfferCardCampaign
  /**
   * When set and the merged catalog has timed offers, badges use the Figma
   * three-row stack (up to two windows + `+N offers`). Otherwise falls back to `campaign`.
   */
  restaurantSlug?: string
  /**
   * `compact` — carousel XS / list gallery (Figma `_Badge / Discount` `16390:33012`).
   * `comfortable` — map-opened card (same unified pill as compact).
   * `hero-dark` — list card hero badge (`18904:45034`), dark translucent pill without icon.
   */
  density?: "compact" | "comfortable" | "hero-dark"
  /** Discover date chip state: future dates force prebook badge ordering/copy. */
  selectedDate?: DateValue
  /** When true (discover “Live now”), hide non-live windows; icons stay active on visible rows. */
  liveNowFilter?: boolean
}

/** Figma `_Badge / Discount` (`16390:34941`) — white pill on card hero / map opened. */
const DISCOUNT_BADGE_CLASS =
  "inline-flex w-max shrink-0 flex-nowrap items-center gap-0.5 overflow-hidden rounded-[4px] bg-layer-floor-1 py-0.5 pl-0.5 pr-1"
const DARK_HERO_BADGE_CLASS =
  "inline-flex w-max shrink-0 flex-nowrap items-center gap-1 overflow-hidden rounded-[4px] bg-[rgba(0,0,0,0.64)] px-1.5 py-1"

const COMPACT_BADGE_FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const COMPACT_BADGE_LINE = {
  lineHeight: "18px",
  letterSpacing: "-0.084px",
  fontFeatureSettings: COMPACT_BADGE_FONT_FEAT,
} as const

const HERO_DARK_BADGE_LINE = {
  lineHeight: "16px",
  letterSpacing: "0px",
  fontFeatureSettings: COMPACT_BADGE_FONT_FEAT,
} as const

const COMPACT_BADGE_ICON_CLASS = "size-4 shrink-0" as const

function compactDiscountBadgeIconClass(iconActive: boolean): string {
  return iconActive ?
      `${COMPACT_BADGE_ICON_CLASS} text-danger-primary`
    : `${COMPACT_BADGE_ICON_CLASS} text-tertiary`
}

/**
 * Figma `_Badge / Discount` (`16390:34941`) — unified white pill on carousel and map-opened card.
 */
export function OfferCardBadges({
  campaign,
  restaurantSlug,
  density = "compact",
  selectedDate = "today",
  liveNowFilter = false,
}: OfferCardBadgesProps) {
  const comfortable = density === "comfortable"
  const heroDark = density === "hero-dark"
  const timedOffers =
    restaurantSlug ? getRestaurantOffers(restaurantSlug) : []
  const scheduleAware =
    timedOffers.length > 0 ||
    Boolean(campaign.timeWindow && campaign.timeWindow !== "All day")
  const now = useOfferDisplayNow(scheduleAware)

  const badgeMode: BadgeStackDisplayMode =
    liveNowFilter ? "liveNow"
    : selectedDate !== "today" ? "prebook"
    : "default"

  if (restaurantSlug && timedOffers.length > 0) {
    const rows = buildTimedOfferBadgeModels(
      timedOffers,
      now,
      badgeMode,
    )
    if (rows.length === 0) return null

    const stackClass = comfortable
      ? "flex max-w-[calc(100%-2.75rem)] flex-col gap-1"
      : heroDark ?
        "flex max-w-[min(100%,13rem)] flex-col items-start gap-1"
      : "flex max-w-[min(100%,18rem)] flex-col items-start gap-1"

    return (
      <div className={stackClass}>
        {rows.map((row, i) => (
          <CampaignPill
            key={i}
            density={density}
            icon={
              heroDark ? undefined
              : <OfferCampaignPercentIcon iconActive={row.iconActive} />
            }
            content={
              row.kind === "offer" ?
                <OfferBadgeOfferCopy
                  discountLabel={row.discountLabel}
                  timeWindow={row.timeWindow}
                  density={density}
                />
              : <OverflowOfferCopy count={row.count} density={density} />
            }
          />
        ))}
      </div>
    )
  }

  const { discountLabel, timeWindow, extraOffers } = campaign
  if (!hasCampaignBadges(campaign)) return null

  const campaignIconActive = campaignTimeWindowDisplayActive(timeWindow, now)

  const primaryPill = (
    <CampaignPill
      density={density}
      icon={
        heroDark ? undefined
        : <OfferCampaignPercentIcon iconActive={campaignIconActive} />
      }
      content={
        <OfferBadgeOfferCopy
          discountLabel={discountLabel}
          timeWindow={
            timeWindow ?
              formatCampaignBadgeTimeLabel(timeWindow, now)
            : undefined
          }
          density={density}
        />
      }
    />
  )

  const extraPill =
    extraOffers !== undefined && extraOffers > 0 ?
      <CampaignPill
        density={density}
        className={comfortable ? "absolute left-0 top-7 z-[1] w-max" : undefined}
        icon={
          heroDark ? undefined
          : <OfferCampaignPercentIcon iconActive={campaignIconActive} />
        }
        content={<OverflowOfferCopy count={extraOffers} density={density} />}
      />
    : null

  if (comfortable) {
    return (
      <div className="relative min-h-[4.5rem] max-w-[calc(100%-2.75rem)]">
        {primaryPill}
        {extraPill}
      </div>
    )
  }

  return (
    <div
      className={
        heroDark ?
          "flex max-w-[min(100%,13rem)] flex-col items-start gap-1"
        : "flex max-w-[min(100%,18rem)] flex-col items-start gap-1"
      }
    >
      {primaryPill}
      {extraPill}
    </div>
  )
}

function OfferBadgeOfferCopy({
  discountLabel,
  timeWindow,
  density = "compact",
}: {
  discountLabel?: string
  timeWindow?: string
  density?: "compact" | "comfortable" | "hero-dark"
}) {
  const heroDark = density === "hero-dark"
  return (
    <span className="inline-flex items-center gap-0.5">
      {discountLabel ?
        <Typography
          as="span"
          variant={heroDark ? "body-xs-accent" : "body-s-accent"}
          color={heroDark ? "primary-inverted" : "primary"}
          inlineStyle={heroDark ? HERO_DARK_BADGE_LINE : COMPACT_BADGE_LINE}
        >
          {discountLabel}
        </Typography>
      : null}
      {timeWindow ?
        <>
          <Typography
            as="span"
            variant={heroDark ? "body-xs-regular" : "body-s-accent"}
            color={heroDark ? "primary-inverted" : "secondary"}
            inlineStyle={heroDark ? HERO_DARK_BADGE_LINE : COMPACT_BADGE_LINE}
            aria-hidden
          >
            {"\u00b7"}
          </Typography>
          <Typography
            as="span"
            variant={heroDark ? "body-xs-regular" : "body-s-regular"}
            color={heroDark ? "primary-inverted" : "secondary"}
            inlineStyle={heroDark ? HERO_DARK_BADGE_LINE : COMPACT_BADGE_LINE}
          >
            {timeWindow}
          </Typography>
        </>
      : null}
    </span>
  )
}

function OverflowOfferCopy({
  count,
  density = "compact",
}: {
  count: number
  density?: "compact" | "comfortable" | "hero-dark"
}) {
  const heroDark = density === "hero-dark"
  return (
    <Typography
      as="span"
      variant={heroDark ? "body-xs-accent" : "body-s-accent"}
      color={heroDark ? "primary-inverted" : "primary"}
      inlineStyle={heroDark ? HERO_DARK_BADGE_LINE : COMPACT_BADGE_LINE}
    >
      {count === 1 ? "+1 more offer" : `+${count} more offers`}
    </Typography>
  )
}

function OfferCampaignPercentIcon({ iconActive }: { iconActive: boolean }) {
  return (
    <PercentFlower
      size="xs"
      className={compactDiscountBadgeIconClass(iconActive)}
      aria-hidden
    />
  )
}

function CampaignPill({
  icon,
  content,
  density = "compact",
  className,
}: {
  icon?: ReactNode
  content: ReactNode
  density?: "compact" | "comfortable" | "hero-dark"
  className?: string
}) {
  const badgeClass =
    density === "hero-dark" ? DARK_HERO_BADGE_CLASS : DISCOUNT_BADGE_CLASS
  return (
    <div className={`${badgeClass} ${className ?? ""}`.trim()}>
      {icon ? icon : null}
      {content}
    </div>
  )
}
