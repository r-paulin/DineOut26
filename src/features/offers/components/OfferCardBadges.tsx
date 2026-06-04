import type { ReactNode } from "react"
import { Typography } from "@bolteu/kalep-react"
import PercentFlower from "@bolteu/kalep-react-icons/dist/PercentFlower"
import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"
import type { OfferCardCampaign } from "@/features/offers/offers.types"
import { hasCampaignBadges } from "@/features/offers/utils/mapPlaceCardView"
import { buildTimedOfferBadgeModels } from "@/features/offers/utils/offerBadgeStack"
import {
  useOfferDisplayNow,
} from "@/features/offers/utils/offerDisplayActive"

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
   */
  density?: "compact" | "comfortable"
  /** When true (discover “Live now”), hide non-live windows; icons stay active on visible rows. */
  liveNowFilter?: boolean
}

/** Figma `_Badge / Discount` (`16390:34941`) — white pill on card hero / map opened. */
const DISCOUNT_BADGE_CLASS =
  "inline-flex w-max shrink-0 flex-nowrap items-center gap-0.5 overflow-hidden rounded-[4px] bg-layer-floor-1 py-0.5 pl-0.5 pr-1"

const COMPACT_BADGE_FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const COMPACT_BADGE_LINE = {
  lineHeight: "18px",
  letterSpacing: "-0.084px",
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
  liveNowFilter = false,
}: OfferCardBadgesProps) {
  const comfortable = density === "comfortable"
  const timedOffers =
    restaurantSlug ? getRestaurantOffers(restaurantSlug) : []
  const scheduleAware =
    timedOffers.length > 0 ||
    Boolean(campaign.timeWindow && campaign.timeWindow !== "All day")
  const now = useOfferDisplayNow(scheduleAware)

  if (restaurantSlug && timedOffers.length > 0) {
    const rows = buildTimedOfferBadgeModels(
      timedOffers,
      now,
      liveNowFilter ? "liveNow" : "default",
    )
    if (rows.length === 0) return null

    const stackClass = comfortable
      ? "flex max-w-[calc(100%-2.75rem)] flex-col gap-1"
      : "flex max-w-[min(100%,18rem)] flex-col items-start gap-1"

    return (
      <div className={stackClass}>
        {rows.map((row, i) => (
          <CampaignPill
            key={i}
            density={density}
            icon={
              <OfferCampaignPercentIcon iconActive={row.iconActive} />
            }
            content={
              row.kind === "offer" ?
                <OfferBadgeOfferCopy
                  discountLabel={row.discountLabel}
                  timeWindow={row.timeWindow}
                />
              : <OverflowOfferCopy count={row.count} />
            }
          />
        ))}
      </div>
    )
  }

  const { discountLabel, timeWindow, extraOffers } = campaign
  if (!hasCampaignBadges(campaign)) return null

  const primaryPill = (
    <CampaignPill
      density={density}
      icon={<OfferCampaignPercentIcon iconActive />}
      content={
        <OfferBadgeOfferCopy
          discountLabel={discountLabel}
          timeWindow={timeWindow}
        />
      }
    />
  )

  const extraPill =
    extraOffers !== undefined && extraOffers > 0 ?
      <CampaignPill
        density={density}
        className={comfortable ? "absolute left-0 top-7 z-[1] w-max" : undefined}
        icon={<OfferCampaignPercentIcon iconActive />}
        content={<OverflowOfferCopy count={extraOffers} />}
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
    <div className="flex max-w-[min(100%,18rem)] flex-col items-start gap-1">
      {primaryPill}
      {extraPill}
    </div>
  )
}

function OfferBadgeOfferCopy({
  discountLabel,
  timeWindow,
}: {
  discountLabel?: string
  timeWindow?: string
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {discountLabel ?
        <Typography
          as="span"
          variant="body-s-accent"
          color="primary"
          inlineStyle={COMPACT_BADGE_LINE}
        >
          {discountLabel}
        </Typography>
      : null}
      {timeWindow ?
        <>
          <Typography
            as="span"
            variant="body-s-accent"
            color="secondary"
            inlineStyle={COMPACT_BADGE_LINE}
            aria-hidden
          >
            {"\u00b7"}
          </Typography>
          <Typography
            as="span"
            variant="body-s-regular"
            color="secondary"
            inlineStyle={COMPACT_BADGE_LINE}
          >
            {timeWindow}
          </Typography>
        </>
      : null}
    </span>
  )
}

function OverflowOfferCopy({ count }: { count: number }) {
  return (
    <Typography
      as="span"
      variant="body-s-accent"
      color="primary"
      inlineStyle={COMPACT_BADGE_LINE}
    >
      {count === 1 ? "+1 offer" : `+${count} offers`}
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
  className,
}: {
  icon: ReactNode
  content: ReactNode
  density?: "compact" | "comfortable"
  className?: string
}) {
  return (
    <div className={`${DISCOUNT_BADGE_CLASS} ${className ?? ""}`.trim()}>
      {icon}
      {content}
    </div>
  )
}
