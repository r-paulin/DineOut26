import type { ReactNode } from "react"
import Offer from "@bolteu/kalep-react-icons/dist/Offer"
import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"
import type { OfferCardCampaign } from "@/features/offers/offers.types"
import { hasCampaignBadges } from "@/features/offers/utils/mapPlaceCardView"
import { buildTimedOfferBadgeModels } from "@/features/offers/utils/offerBadgeStack"
import {
  campaignTimeWindowDisplayActive,
  offerBadgeIconClass,
  restaurantTimedOfferDisplayActiveNow,
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
   * `compact` — carousel XS (12px copy). `comfortable` — map-opened card: 14px
   * semibold pills (Figma `_Place / Card / On Map - Opened`).
   */
  density?: "compact" | "comfortable"
}

/**
 * Figma campaign pills: dark pill, green Offer icon, `-25% · 11:00–14:00`
 * (time uses `--color-static-content-secondary-light`). Up to three rows when
 * `restaurantSlug` resolves to timed offers.
 */
export function OfferCardBadges({
  campaign,
  restaurantSlug,
  density = "compact",
}: OfferCardBadgesProps) {
  const comfortable = density === "comfortable"
  const timedOffers =
    restaurantSlug ? getRestaurantOffers(restaurantSlug) : []
  const scheduleAware =
    timedOffers.length > 0 ||
    Boolean(campaign.timeWindow && campaign.timeWindow !== "All day")
  const now = useOfferDisplayNow(scheduleAware)
  const textMain = comfortable
    ? "text-sm leading-5 whitespace-nowrap [font-variation-settings:'wght'_var(--font-weight-semibold)] text-static-key-light"
    : "text-xs leading-4 whitespace-nowrap [font-variation-settings:'wght'_var(--font-weight-semibold)] text-static-key-light"
  const textDot = comfortable
    ? "text-sm leading-5 [font-variation-settings:'wght'_var(--font-weight-semibold)] text-static-key-light shrink-0"
    : "text-xs leading-4 [font-variation-settings:'wght'_var(--font-weight-semibold)] text-static-key-light shrink-0"
  const textTime = comfortable
    ? "text-sm leading-5 font-normal whitespace-nowrap"
    : "text-xs leading-4 font-normal whitespace-nowrap"
  const offerSize = comfortable ? "sm" : "xs"

  if (restaurantSlug && timedOffers.length > 0) {
    const rows = buildTimedOfferBadgeModels(timedOffers, now)
    const stackClass = comfortable
      ? "flex max-w-[calc(100%-2.75rem)] flex-col gap-1"
      : "flex max-w-[min(100%,18rem)] flex-col items-start gap-1"

    return (
      <div className={stackClass}>
        {rows.map((row, i) => (
          <CampaignPill key={i} density={density}>
            <Offer
              size={offerSize}
              className={offerBadgeIconClass(row.iconActive)}
              aria-hidden
            />
            {row.kind === "offer" ? (
              <>
                {row.discountLabel ? (
                  <span className={textMain}>{row.discountLabel}</span>
                ) : null}
                {row.timeWindow ? (
                  <>
                    <span className={textDot}>{"\u00a0\u00b7\u00a0"}</span>
                    <span
                      className={textTime}
                      style={{
                        color: "var(--color-static-content-secondary-light)",
                      }}
                    >
                      {row.timeWindow}
                    </span>
                  </>
                ) : null}
              </>
            ) : (
              <span className={textMain}>
                {row.count === 1 ? "+1 offer" : `+${row.count} offers`}
              </span>
            )}
          </CampaignPill>
        ))}
      </div>
    )
  }

  const { discountLabel, timeWindow, extraOffers } = campaign
  if (!hasCampaignBadges(campaign)) return null

  const primaryIconActive = campaignTimeWindowDisplayActive(timeWindow, now)
  const extraIconActive = restaurantSlug
    ? restaurantTimedOfferDisplayActiveNow(restaurantSlug, now)
    : primaryIconActive

  const primaryPill = (
    <CampaignPill density={density}>
      <Offer
        size={offerSize}
        className={offerBadgeIconClass(primaryIconActive)}
        aria-hidden
      />
      {discountLabel ? <span className={textMain}>{discountLabel}</span> : null}
      {timeWindow ? (
        <>
          <span className={textDot}>{"\u00a0\u00b7\u00a0"}</span>
          <span
            className={textTime}
            style={{
              color: "var(--color-static-content-secondary-light)",
            }}
          >
            {timeWindow}
          </span>
        </>
      ) : null}
    </CampaignPill>
  )

  const extraPill =
    extraOffers !== undefined && extraOffers > 0 ? (
      <CampaignPill
        density={density}
        className={comfortable ? "absolute left-0 top-7 z-[1] w-max" : undefined}
      >
        <Offer
          size={offerSize}
          className={offerBadgeIconClass(extraIconActive)}
          aria-hidden
        />
        <span className={textMain}>
          {extraOffers === 1 ? "+1 offer" : `+${extraOffers} offers`}
        </span>
      </CampaignPill>
    ) : null

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

function CampaignPill({
  children,
  density = "compact",
  className,
}: {
  children: ReactNode
  density?: "compact" | "comfortable"
  className?: string
}) {
  const pillPad =
    density === "comfortable"
      ? "inline-flex min-h-6 w-max shrink-0 flex-nowrap items-center gap-1 rounded bg-neutral-primary py-0.5 pl-1 pr-1.5"
      : "inline-flex min-h-5 max-w-full flex-wrap items-center gap-1 rounded bg-neutral-primary py-0.5 pl-1 pr-1.5"
  return <div className={`${pillPad} ${className ?? ""}`.trim()}>{children}</div>
}
