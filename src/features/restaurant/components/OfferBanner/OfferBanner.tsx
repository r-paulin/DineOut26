import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { OfferBannerCard } from "@/features/restaurant/components/OfferBanner/OfferBannerCard"
import { OfferBannerStickerRow } from "@/features/restaurant/components/OfferBanner/OfferBannerStickerRow"
import {
  buildOfferBannerContent,
  buildStaticOfferBannerContent,
  type OfferBannerContext,
  type OfferBannerOuterShellTone,
} from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import {
  getOfferBannerWindowPhase,
  hasOtherClaimAtVenue,
} from "@/features/restaurant/utils/offerBannerWindowPhase"
import {
  getOfferBannerState,
  shouldShowOfferBanner,
  toOfferForBanner,
  type UserClaim,
} from "@/features/restaurant/utils/offerState"

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

export type { OfferBannerContext } from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"

type OfferBannerInteractiveProps = {
  presentation?: "interactive"
  offer: RestaurantOfferCardModel
  userClaims: readonly UserClaim[]
  claimedOffersById: Readonly<Record<string, ClaimedOffer>>
  discountValue?: number
  minOrderEur?: number
  context?: OfferBannerContext
  onAvailablePress?: () => void
  onClaimedPress?: () => void
}

export type OfferBannerStaticProps = {
  presentation: "static"
  title: string
  subtitle: string
  onPress?: () => void
}

export type OfferBannerProps = OfferBannerInteractiveProps | OfferBannerStaticProps

function isStaticProps(props: OfferBannerProps): props is OfferBannerStaticProps {
  return props.presentation === "static"
}

/**
 * Offer banner — Figma `16005:12046` (interactive), `16084:50139` / `16091:14982`
 * (claimed), `16084:50144` (static). State from {@link getOfferBannerState}.
 */
export function OfferBanner(props: OfferBannerProps) {
  if (isStaticProps(props)) {
    return <OfferBannerStatic {...props} />
  }
  if (!shouldShowOfferBanner(props.offer.tags)) return null
  return <OfferBannerInteractive {...props} />
}

function OfferBannerStatic({
  title,
  subtitle,
  onPress,
}: OfferBannerStaticProps) {
  const content = useMemo(
    () => buildStaticOfferBannerContent({ title, subtitle }),
    [title, subtitle],
  )

  const shell = (
    <OfferBannerShell outerClaimed={false} outerShellTone="neutral">
      <OfferBannerCard content={content} />
    </OfferBannerShell>
  )

  if (onPress) {
    return (
      <button
        type="button"
        className="w-full min-w-0 cursor-pointer border-none bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-inset"
        aria-label={content.ariaLabel}
        aria-haspopup="dialog"
        onClick={onPress}
      >
        {shell}
      </button>
    )
  }

  return <div aria-label={content.ariaLabel}>{shell}</div>
}

function OfferBannerInteractive({
  offer,
  userClaims,
  claimedOffersById,
  discountValue,
  minOrderEur,
  context = "restaurant",
  onAvailablePress,
  onClaimedPress,
}: OfferBannerInteractiveProps) {
  const nowMs = useOfferBannerNowMs(offer)
  const state = getOfferBannerState(
    toOfferForBanner(offer),
    userClaims,
    nowMs,
  )
  const claim = claimedOffersById[offer.id]
  const displayDiscount =
    discountValue ?? claim?.discountPercent ?? offer.discountPercent ?? 30
  const offerForBanner = toOfferForBanner(offer)
  const windowPhase = getOfferBannerWindowPhase(offerForBanner, nowMs)
  const blocked =
    state === "available" &&
    hasOtherClaimAtVenue(offer.id, offer.offerScheduleDate, userClaims, nowMs)

  const content = useMemo(
    () =>
      buildOfferBannerContent({
        state,
        offer,
        claim,
        context,
        displayDiscount,
        windowPhase,
        hasOtherClaimAtVenue: blocked,
        minOrderEur,
        maxSavingEur: offer.maxSavingEur,
      }),
    [
      state,
      offer,
      claim,
      context,
      displayDiscount,
      windowPhase,
      blocked,
      minOrderEur,
    ],
  )

  const onActivate = useCallback(() => {
    if (blocked) return
    if (state === "available") {
      onAvailablePress?.()
      return
    }
    if (state === "claimed") {
      onClaimedPress?.()
    }
  }, [blocked, onAvailablePress, onClaimedPress, state])

  const isDisabled = state === "expired" || blocked

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`w-full min-w-0 border-none bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-inset ${isDisabled ? "cursor-not-allowed opacity-[0.92]" : "cursor-pointer"}`}
      aria-label={content.ariaLabel}
      onClick={onActivate}
    >
      <OfferBannerShell
        outerClaimed={content.outerClaimed}
        outerShellTone={content.outerShellTone}
      >
        <OfferBannerCard content={content} />
        {content.sticker ?
          <OfferBannerStickerRow
            sticker={content.sticker}
            claimed={content.outerClaimed}
            claim={claim}
          />
        : null}
      </OfferBannerShell>
    </button>
  )
}

function offerBannerShellClass(
  outerClaimed: boolean,
  outerShellTone: OfferBannerOuterShellTone,
): string {
  if (outerClaimed) return "bg-special-brand-alt"
  if (outerShellTone === "danger") return "bg-danger-secondary"
  return "bg-neutral-secondary"
}

function OfferBannerShell({
  outerClaimed,
  outerShellTone,
  children,
}: {
  outerClaimed: boolean
  outerShellTone: OfferBannerOuterShellTone
  children: ReactNode
}) {
  return (
    <div
      className={`flex w-full min-w-0 flex-col overflow-hidden rounded-[12px] ${offerBannerShellClass(outerClaimed, outerShellTone)}`}
    >
      {children}
    </div>
  )
}
