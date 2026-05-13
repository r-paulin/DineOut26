import { Typography } from "@bolteu/kalep-react"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import { useCallback, useEffect, useState } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { useOfferCountdown } from "@/features/offers/components/ClaimedOfferPage/useOfferCountdown"
import { OfferBannerDiscountSticker } from "@/features/restaurant/components/OfferBanner/OfferBannerDiscountSticker"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import { formatOfferScarcityLabel } from "@/features/restaurant/utils/formatOfferScarcityLabel"
import {
  getOfferBannerState,
  shouldShowOfferBanner,
  toOfferForBanner,
  type OfferState,
  type UserClaim,
} from "@/features/restaurant/utils/offerState"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

/** Solid sticker fills — available: primary green; claimed / expired: white. */
const FILL_AVAILABLE_TAG = "var(--color-bg-action-primary)"
const FILL_CLAIMED_OR_EXPIRED_TAG = "var(--color-static-bg-key-light)"
const DISCOUNT_TEXT_ON_GREEN = "var(--color-static-content-key-light)"
const DISCOUNT_TEXT_ON_WHITE = "var(--color-content-action-primary)"

const OFFER_BANNER_CLOCK_TICK_MS = 30_000

/**
 * When an offer has a local schedule, re-derive banner state periodically so
 * passing the window (e.g. 11:00–14:00) flips to expired without navigation.
 */
function useOfferBannerNowMs(offer: RestaurantOfferCardModel): number {
  const scheduleAware = Boolean(
    offer.offerScheduleDate && offer.offerEnd,
  )
  const [ms, setMs] = useState(() => Date.now())

  useEffect(() => {
    if (!scheduleAware) return
    setMs(Date.now())
    const id = window.setInterval(() => {
      setMs(Date.now())
    }, OFFER_BANNER_CLOCK_TICK_MS)
    return () => window.clearInterval(id)
  }, [scheduleAware, offer.id, offer.offerScheduleDate, offer.offerEnd])

  return scheduleAware ? ms : Date.now()
}

export interface OfferBannerProps {
  offer: RestaurantOfferCardModel
  userClaims: readonly UserClaim[]
  claimedOffersById: Readonly<Record<string, ClaimedOffer>>
  /** Overrides `offer.discountPercent` for the discount tag only. */
  discountValue?: number
  onAvailablePress?: () => void
  onClaimedPress?: () => void
}

/**
 * Horizontally split restaurant offer card. Visibility uses tags; interaction
 * state uses {@link getOfferBannerState} (see `docs/offer-banner-logic.md`).
 */
export function OfferBanner(props: OfferBannerProps) {
  if (!shouldShowOfferBanner(props.offer.tags)) return null
  return <OfferBannerVisible {...props} />
}

function OfferBannerVisible({
  offer,
  userClaims,
  claimedOffersById,
  discountValue,
  onAvailablePress,
  onClaimedPress,
}: OfferBannerProps) {
  const nowMs = useOfferBannerNowMs(offer)
  const state = getOfferBannerState(
    toOfferForBanner(offer),
    userClaims,
    nowMs,
  )
  const claim = claimedOffersById[offer.id]
  /**
   * Sticker uses claim `discountPercent` when present (Home banner vs stale card).
   * Headline: **claimed** → `10% discount` (no “Claim”); otherwise `offer.title`
   * (typically “Claim …”).
   */
  const displayDiscount =
    discountValue ?? claim?.discountPercent ?? offer.discountPercent ?? 30
  const bannerTitle =
    state === "claimed" ?
      `${claim?.discountPercent ?? offer.discountPercent ?? 30}% discount`
    : offer.title

  const metaLine = `${offer.date} · ${offer.timeWindow}`

  const surfaceClass =
    state === "claimed" ? "bg-action-secondary" : "bg-neutral-secondary"
  const radiusClass = state === "claimed" ? "rounded-[12px]" : "rounded-[8px]"

  const onActivate = useCallback(() => {
    if (state === "available") {
      onAvailablePress?.()
      return
    }
    if (state === "claimed") {
      onClaimedPress?.()
      return
    }
  }, [onAvailablePress, onClaimedPress, state])

  const tagFill =
    state === "available" ? FILL_AVAILABLE_TAG : FILL_CLAIMED_OR_EXPIRED_TAG
  const discountLabelColor =
    state === "available" ? DISCOUNT_TEXT_ON_GREEN : DISCOUNT_TEXT_ON_WHITE

  return (
    <button
      type="button"
      disabled={state === "expired"}
      className={`relative flex w-full min-w-0 overflow-visible py-2 pl-3 pr-2 text-left ${radiusClass} ${surfaceClass} ${state === "expired" ? "cursor-not-allowed opacity-[0.85]" : "cursor-pointer"}`}
      aria-label={bannerTitle}
      onClick={onActivate}
    >
      <div className="flex min-h-0 min-w-0 flex-1 items-stretch gap-6 self-stretch">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <OfferBannerStatusPill offer={offer} state={state} />
          <Typography
            variant="heading-xs-accent"
            color={state === "expired" ? "secondary" : "primary"}
            as="h3"
            lines={2}
            inlineStyle={SEMIBOLD}
          >
            {bannerTitle}
          </Typography>
          <div
            className={`mt-auto flex min-w-0 flex-col ${state === "expired" ? "gap-2" : "gap-1"}`}
          >
            {state === "claimed" && claim ? (
              <OfferBannerClaimedLines claim={claim} />
            ) : state === "claimed" ? (
              <Typography variant="body-s-regular" color="secondary" as="p">
                {metaLine}
              </Typography>
            ) : (
              <Typography
                variant="body-s-regular"
                color={state === "expired" ? "secondary" : "primary"}
                as="p"
              >
                {metaLine}
              </Typography>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center justify-center self-stretch">
          <div
            className={`relative h-[132px] w-[100px] shrink-0 rounded-[10px] ${state === "claimed" ? "bg-action-secondary" : "bg-neutral-secondary"}`}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[10px]">
              <img
                src={offer.restaurantImage}
                alt=""
                className={`absolute inset-0 size-full max-w-none rounded-[10px] object-cover ${state === "expired" ? "opacity-[0.72] saturate-[0.85]" : ""}`}
              />
            </div>
            <DiscountTagOverlay
              displayDiscount={displayDiscount}
              tagFill={tagFill}
              labelColor={discountLabelColor}
            />
          </div>
        </div>
      </div>
    </button>
  )
}

/** Claimed row: arrival from claim payload + live countdown to offer window end. */
function OfferBannerClaimedLines({ claim }: { claim: ClaimedOffer }) {
  const { expired, countdownLive } = useOfferCountdown(claim.offerWindowCloses)
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Typography
        variant="body-xs-accent"
        color="primary"
        as="p"
        inlineStyle={SEMIBOLD}
      >
        {`${claim.arrivalDate} · ${claim.arrivalTime}`}
      </Typography>
      <Typography
        variant="body-xs-regular"
        color={expired ? "danger-primary" : "secondary"}
        as="p"
      >
        {expired ? "Offer ended" : `Offer ends in ${countdownLive}`}
      </Typography>
    </div>
  )
}

function OfferBannerStatusPill({
  offer,
  state,
}: {
  offer: RestaurantOfferCardModel
  state: OfferState
}) {
  if (state === "claimed") {
    return (
      <span className="inline-flex max-w-fit items-center gap-[4px] rounded-[4px] px-[6px] py-[4px] bg-special-brand text-primary-inverted">
        <CheckCircle
          size="sm"
          className="size-4 shrink-0 text-primary-inverted"
          aria-hidden
        />
        <Typography
          variant="body-xs-accent"
          color="primary-inverted"
          as="span"
          inlineStyle={SEMIBOLD}
        >
          Claimed
        </Typography>
      </span>
    )
  }
  if (
    state === "available" &&
    offer.remainingCount != null &&
    offer.remainingCount > 0
  ) {
    const scarcityLabel = formatOfferScarcityLabel(offer.remainingCount)
    return (
      <span className="inline-flex max-w-fit items-center rounded-[4px] px-[6px] py-[4px] bg-neutral-primary text-primary-inverted">
        <Typography
          variant="body-xs-accent"
          color="primary-inverted"
          as="span"
          inlineStyle={SEMIBOLD}
        >
          {scarcityLabel}
        </Typography>
      </span>
    )
  }
  if (state === "expired") {
    return (
      <span className="inline-flex max-w-fit items-center rounded-[4px] bg-neutral-secondary px-[6px] py-[4px]">
        <Typography
          variant="body-xs-accent"
          as="span"
          inlineStyle={{
            ...SEMIBOLD,
            color: "var(--color-static-content-key-dark, black)",
          }}
        >
          Expired
        </Typography>
      </span>
    )
  }
  return null
}

function DiscountTagOverlay({
  displayDiscount,
  tagFill,
  labelColor,
}: {
  displayDiscount: number
  tagFill: string
  labelColor: string
}) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      <OfferBannerDiscountSticker
        tagFill={tagFill}
        label={`-${displayDiscount}%`}
        labelColor={labelColor}
      />
    </div>
  )
}
