import type { ReactNode } from "react"
import { Typography } from "@bolteu/kalep-react"
import PercentFlower from "@bolteu/kalep-react-icons/dist/PercentFlower"
import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"
import type { OfferCardCampaign } from "@/features/offers/offers.types"
import { hasCampaignBadges } from "@/features/offers/utils/mapPlaceCardView"
import { buildTimedOfferBadgeModels } from "@/features/offers/utils/offerBadgeStack"
import {
  getOfferCampaignIconClass,
  useOfferDisplayNow,
} from "@/features/offers/utils/offerDisplayActive"
import type { OfferCampaignSurface } from "@/features/offers/utils/offerDisplayActive"

export interface OfferCardBadgesProps {
  campaign: OfferCardCampaign
  /**
   * When set and the merged catalog has timed offers, badges use the Figma
   * three-row stack (up to two windows + `+N offers`). Otherwise falls back to `campaign`.
   */
  restaurantSlug?: string
  /**
   * `compact` — carousel XS / list gallery (Figma `_Badge / Discount` `16390:33012`).
   * `comfortable` — map-opened card: split red icon + dark content pill.
   */
  density?: "compact" | "comfortable"
  /** When true (discover “Live now”), hide non-live windows; icons stay active on visible rows. */
  liveNowFilter?: boolean
}

/** Figma `_Badge / Discount` (`16390:33012`) — white pill on card hero. */
const COMPACT_DISCOUNT_BADGE_CLASS =
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
 * Figma carousel / list hero badges (`16390:33012`) and map split pill (`16159:22611`).
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
              <OfferCampaignPercentIcon
                density={density}
                iconActive={row.iconActive}
              />
            }
            content={
              row.kind === "offer" ?
                <OfferBadgeOfferCopy
                  discountLabel={row.discountLabel}
                  timeWindow={row.timeWindow}
                  comfortable={comfortable}
                />
              : <OverflowOfferCopy
                  count={row.count}
                  comfortable={comfortable}
                />
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
      icon={
        <OfferCampaignPercentIcon density={density} iconActive />
      }
      content={
        <OfferBadgeOfferCopy
          discountLabel={discountLabel}
          timeWindow={timeWindow}
          comfortable={comfortable}
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
          <OfferCampaignPercentIcon density={density} iconActive />
        }
        content={
          <OverflowOfferCopy
            count={extraOffers}
            comfortable={comfortable}
          />
        }
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

const BADGE_COPY_LINE = { letterSpacing: 0 } as const

function OfferBadgeOfferCopy({
  discountLabel,
  timeWindow,
  comfortable,
}: {
  discountLabel?: string
  timeWindow?: string
  comfortable: boolean
}) {
  if (!comfortable) {
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

  const accentVariant = "body-s-accent"
  const regularVariant = "body-s-regular"
  const lineHeight = "1.25rem"

  return (
    <span className="inline-flex items-center gap-0.5">
      {discountLabel ?
        <Typography
          as="span"
          variant={accentVariant}
          color="primary-inverted"
          inlineStyle={{ ...BADGE_COPY_LINE, lineHeight }}
        >
          {discountLabel}
        </Typography>
      : null}
      {timeWindow ?
        <>
          <Typography
            as="span"
            variant={accentVariant}
            color="primary-inverted"
            inlineStyle={{ ...BADGE_COPY_LINE, lineHeight }}
          >
            {"\u00b7"}
          </Typography>
          <Typography
            as="span"
            variant={regularVariant}
            color="secondary"
            inlineStyle={{
              ...BADGE_COPY_LINE,
              lineHeight,
              color: "var(--color-static-content-secondary-light)",
            }}
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
  comfortable,
}: {
  count: number
  comfortable: boolean
}) {
  if (!comfortable) {
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

  const lineHeight = "1.25rem"
  return (
    <Typography
      as="span"
      variant="body-s-accent"
      color="primary-inverted"
      inlineStyle={{ ...BADGE_COPY_LINE, lineHeight }}
    >
      {count === 1 ? "+1 offer" : `+${count} offers`}
    </Typography>
  )
}

function OfferCampaignPercentIcon({
  iconActive,
  density = "compact",
  surface = "cardBadge",
}: {
  iconActive: boolean
  density?: "compact" | "comfortable"
  surface?: OfferCampaignSurface
}) {
  if (density === "compact") {
    return (
      <PercentFlower
        size="xs"
        className={compactDiscountBadgeIconClass(iconActive)}
        aria-hidden
      />
    )
  }
  return (
    <PercentFlower
      size="sm"
      className={getOfferCampaignIconClass(surface, iconActive)}
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
  icon: ReactNode
  content: ReactNode
  density?: "compact" | "comfortable"
  className?: string
}) {
  if (density !== "comfortable") {
    return (
      <div className={`${COMPACT_DISCOUNT_BADGE_CLASS} ${className ?? ""}`.trim()}>
        {icon}
        {content}
      </div>
    )
  }

  const iconSegment =
    "flex shrink-0 items-center justify-center rounded-l-[4px] bg-danger-primary p-1.5"
  const contentSegment =
    "inline-flex shrink items-center justify-center gap-0.5 rounded-r-[4px] bg-neutral-primary py-1.5 pl-1 pr-2"

  return (
    <div
      className={`inline-flex w-max shrink-0 flex-nowrap items-center ${className ?? ""}`.trim()}
    >
      <div className={iconSegment}>{icon}</div>
      <div className={contentSegment}>{content}</div>
    </div>
  )
}
