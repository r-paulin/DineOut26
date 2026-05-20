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
   * `compact` — carousel XS (12px copy). `comfortable` — map-opened card: 14px
   * semibold pills (Figma `_Place / Card / On Map - Opened`).
   */
  density?: "compact" | "comfortable"
  /** When true (discover “Live now”), hide non-live windows; icons stay active on visible rows. */
  liveNowFilter?: boolean
}

/**
 * Figma `16159:22611`: split pill — red icon segment + dark content segment.
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
  const offerSize = comfortable ? "sm" : "xs"

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
                size={offerSize}
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
        <OfferCampaignPercentIcon size={offerSize} iconActive />
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
        icon={<OfferCampaignPercentIcon size={offerSize} iconActive />}
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
  const accentVariant = comfortable ? "body-s-accent" : "body-xs-accent"
  const regularVariant = comfortable ? "body-s-regular" : "body-xs-regular"
  const lineHeight = comfortable ? "1.25rem" : "1rem"

  return (
    <span className="inline-flex items-start gap-1">
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
  const accentVariant = comfortable ? "body-s-accent" : "body-xs-accent"
  const lineHeight = comfortable ? "1.25rem" : "1rem"
  return (
    <Typography
      as="span"
      variant={accentVariant}
      color="primary-inverted"
      inlineStyle={{ ...BADGE_COPY_LINE, lineHeight }}
    >
      {count === 1 ? "+1 offer" : `+${count} offers`}
    </Typography>
  )
}

function OfferCampaignPercentIcon({
  size,
  iconActive,
  surface = "cardBadge",
}: {
  size: "xs" | "sm"
  iconActive: boolean
  surface?: OfferCampaignSurface
}) {
  const iconClass = getOfferCampaignIconClass(surface, iconActive)
  return <PercentFlower size={size} className={iconClass} aria-hidden />
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
  const iconSegment =
    density === "comfortable" ?
      "flex shrink-0 items-start gap-1 rounded-l-[4px] bg-danger-primary p-1.5"
    : "flex shrink-0 items-start gap-1 rounded-l-[4px] bg-danger-primary p-[5px]"
  const contentSegment =
    density === "comfortable" ?
      "flex shrink items-start gap-1 rounded-r-[4px] bg-neutral-primary py-1.5 px-2"
    : "flex shrink items-start gap-1 rounded-r-[4px] bg-neutral-primary py-1 px-1.5"

  return (
    <div
      className={`inline-flex w-max shrink-0 flex-nowrap items-stretch ${className ?? ""}`.trim()}
    >
      <div className={iconSegment}>{icon}</div>
      <div className={contentSegment}>{content}</div>
    </div>
  )
}
