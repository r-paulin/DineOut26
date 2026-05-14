import { Typography } from "@bolteu/kalep-react"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import ChevronRight from "@bolteu/kalep-react-icons/dist/ChevronRight"
import { useCallback, useEffect, useState } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { useOfferCountdown } from "@/features/offers/components/ClaimedOfferPage/useOfferCountdown"
import { OfferBannerDiscountSticker } from "@/features/restaurant/components/OfferBanner/OfferBannerDiscountSticker"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import { formatOfferScarcityLabel } from "@/features/restaurant/utils/formatOfferScarcityLabel"
import { formatOfferBannerValidityTime } from "@/features/restaurant/utils/formatOfferBannerValidityTime"
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

const FILL_TICKET_ACTIVE =
  "var(--content-action-primary-inverted, #74EFAA)"
const FILL_TICKET_EXPIRED = "var(--color-static-bg-key-light)"
const LABEL_ON_GREEN = "var(--color-static-content-key-dark, #191f1c)"
const LABEL_EXPIRED = "var(--color-content-secondary)"

const OFFER_BANNER_CLOCK_TICK_MS = 30_000

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
  discountValue?: number
  onAvailablePress?: () => void
  onClaimedPress?: () => void
}

/**
 * Restaurant offer card — Figma `16005:12046` (claimed / available / expired).
 * State from {@link getOfferBannerState}; schedule-aware clock in {@link useOfferBannerNowMs}.
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
  const displayDiscount =
    discountValue ?? claim?.discountPercent ?? offer.discountPercent ?? 30

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

  const surfaceClass =
    state === "claimed" ? "bg-action-secondary" : "bg-neutral-secondary"
  const ticketFill =
    state === "expired" ? FILL_TICKET_EXPIRED : FILL_TICKET_ACTIVE
  const ticketLabelColor =
    state === "expired" ? LABEL_EXPIRED : LABEL_ON_GREEN

  const primaryLine =
    state === "claimed" && claim ?
      `${claim.arrivalDate} · ${claim.arrivalTime}`
    : offer.title

  const validityTime = formatOfferBannerValidityTime(offer.timeWindow)
  const secondaryContent =
    state === "claimed" && claim ?
      <OfferBannerClaimedCountdown claim={claim} />
    : `Valid: ${offer.date} · ${validityTime}`

  return (
    <button
      type="button"
      disabled={state === "expired"}
      className={`relative flex w-full min-w-0 items-stretch overflow-hidden rounded-lg p-3 text-left ${surfaceClass} ${state === "expired" ? "cursor-not-allowed opacity-[0.92]" : "cursor-pointer"}`}
      aria-label={primaryLine}
      onClick={onActivate}
    >
      <div className="flex w-[72px] shrink-0 flex-col items-center justify-center self-stretch overflow-visible">
        <div className="-rotate-1 flex origin-center items-center justify-center">
          <OfferBannerDiscountSticker
            tagFill={ticketFill}
            label={`-${displayDiscount}%`}
            labelColor={ticketLabelColor}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 pl-3 pr-2">
        <OfferBannerBadge offer={offer} state={state} />
        <Typography
          variant="body-m-accent"
          color={state === "expired" ? "secondary" : "primary"}
          as="p"
          lines={2}
          inlineStyle={SEMIBOLD}
        >
          {primaryLine}
        </Typography>
        <Typography
          variant="body-xs-regular"
          color="secondary"
          as="p"
          noWrap={state !== "claimed"}
        >
          {secondaryContent}
        </Typography>
      </div>

      <div className="flex w-8 shrink-0 items-center justify-center self-center">
        <ChevronRight
          size="sm"
          className={
            state === "expired" ? "text-tertiary" : "text-secondary"
          }
          aria-hidden
        />
      </div>
    </button>
  )
}

function OfferBannerClaimedCountdown({ claim }: { claim: ClaimedOffer }) {
  const { expired, countdownHms } = useOfferCountdown(claim.offerWindowCloses)
  return <>{expired ? "Offer ended" : `Offer ends in ${countdownHms}`}</>
}

function OfferBannerBadge({
  offer,
  state,
}: {
  offer: RestaurantOfferCardModel
  state: OfferState
}) {
  if (state === "claimed") {
    return (
      <span className="inline-flex h-5 max-w-fit items-center justify-center gap-0.5 rounded-[4px] bg-special-brand-alt px-1 py-0.5">
        <CheckCircle
          className="size-[14px] shrink-0 text-action-primary-inverted"
          aria-hidden
        />
        <Typography
          variant="body-xs-accent"
          color="primary-inverted"
          as="span"
          inlineStyle={SEMIBOLD}
        >
          Offer claimed
        </Typography>
      </span>
    )
  }
  if (
    state === "available" &&
    offer.remainingCount != null &&
    offer.remainingCount > 0
  ) {
    return (
      <span className="inline-flex max-w-fit items-center rounded px-1 py-0.5 bg-neutral-secondary">
        <Typography
          variant="body-xs-accent"
          color="primary"
          as="span"
          inlineStyle={SEMIBOLD}
        >
          Limited offer: {formatOfferScarcityLabel(offer.remainingCount)}
        </Typography>
      </span>
    )
  }
  if (state === "expired") {
    return (
      <span className="inline-flex max-w-fit items-center rounded px-1 py-0.5 bg-neutral-secondary">
        <Typography
          variant="body-xs-accent"
          color="primary"
          as="span"
          inlineStyle={SEMIBOLD}
        >
          Expired
        </Typography>
      </span>
    )
  }
  return null
}
