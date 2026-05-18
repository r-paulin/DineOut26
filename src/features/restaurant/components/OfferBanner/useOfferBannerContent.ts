import type { ClaimedOffer } from "@/features/offers/offers.types"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import { formatOfferBannerValidityTime } from "@/features/restaurant/utils/formatOfferBannerValidityTime"
import { formatOfferScarcityLabel } from "@/features/restaurant/utils/formatOfferScarcityLabel"
import type { OfferState } from "@/features/restaurant/utils/offerState"

export type OfferBannerContext = "restaurant" | "home"

export type OfferBannerDataLine = {
  text: string
  emphasis: "regular" | "accent"
  tone?: "primary" | "secondary"
}

export type OfferBannerActionKind = "claim-now" | "claimed"

export type OfferBannerAction = {
  kind: OfferBannerActionKind
  label: string
  disabled: boolean
}

export type OfferBannerStickerKind = "countdown" | "scarcity" | "expired"

export type OfferBannerSticker =
  | { kind: "countdown" }
  | { kind: "scarcity"; text: string }
  | { kind: "expired"; text: string }

export type OfferBannerImageVariant = "claimed" | "unclaimed"

export type OfferBannerContent = {
  outerClaimed: boolean
  innerClaimed: boolean
  headline: string
  dataLines: OfferBannerDataLine[]
  action: OfferBannerAction | null
  sticker: OfferBannerSticker | null
  imageVariant: OfferBannerImageVariant
  ariaLabel: string
}

const DEFAULT_MIN_ORDER_EUR = 10

export function formatOfferBannerDiscountDetailLine(
  discountPercent: number,
  offerDetailLabel?: string,
  minOrderEur?: number,
): string {
  const min = minOrderEur ?? DEFAULT_MIN_ORDER_EUR
  const base =
    offerDetailLabel?.replace(/\s+on menu$/iu, "").trim() ||
    `${discountPercent}% discount`
  return `${base} · Min. order ${min.toFixed(2)}€`
}

export function formatOfferBannerScheduleLine(
  dateLabel: string,
  timeWindow: string,
): string {
  const time = formatOfferBannerValidityTime(timeWindow)
  return `${dateLabel} · ${time}`
}

export function formatOfferBannerArrivalLine(claim: ClaimedOffer): string {
  return `${claim.arrivalDate} · ${claim.arrivalTime}`
}

export interface BuildOfferBannerContentArgs {
  state: OfferState
  offer: RestaurantOfferCardModel
  claim: ClaimedOffer | undefined
  context: OfferBannerContext
  displayDiscount: number
  minOrderEur?: number
}

export function buildOfferBannerContent({
  state,
  offer,
  claim,
  context,
  displayDiscount,
  minOrderEur,
}: BuildOfferBannerContentArgs): OfferBannerContent {
  const scheduleLine = formatOfferBannerScheduleLine(
    offer.date,
    offer.timeWindow,
  )

  if (state === "claimed" && claim) {
    const discountLine = formatOfferBannerDiscountDetailLine(
      displayDiscount,
      claim.offerDetailLabel,
      minOrderEur ?? claim.minOrderEur,
    )
    if (context === "home") {
      const headline =
        offer.restaurantName?.trim() || "Restaurant"
      return {
        outerClaimed: true,
        innerClaimed: true,
        headline,
        dataLines: [
          { text: formatOfferBannerArrivalLine(claim), emphasis: "accent" },
          { text: discountLine, emphasis: "regular", tone: "secondary" },
        ],
        action: { kind: "claimed", label: "Claimed", disabled: false },
        sticker: { kind: "countdown" },
        imageVariant: "claimed",
        ariaLabel: headline,
      }
    }
    const headline = formatOfferBannerArrivalLine(claim)
    return {
      outerClaimed: true,
      innerClaimed: true,
      headline,
      dataLines: [
        { text: discountLine, emphasis: "regular", tone: "secondary" },
      ],
      action: { kind: "claimed", label: "Claimed", disabled: false },
      sticker: { kind: "countdown" },
      imageVariant: "claimed",
      ariaLabel: headline,
    }
  }

  const headline = offer.title

  const scarcity =
    state === "available" &&
    offer.remainingCount != null &&
    offer.remainingCount > 0 ?
      `Limited offer: ${formatOfferScarcityLabel(offer.remainingCount)}`
    : null

  return {
    outerClaimed: false,
    innerClaimed: false,
    headline,
    dataLines: [{ text: scheduleLine, emphasis: "regular", tone: "primary" }],
    action: {
      kind: "claim-now",
      label: "Claim now",
      disabled: state === "expired",
    },
    sticker:
      state === "expired" ?
        { kind: "expired", text: "Offer has expired" }
      : scarcity ?
        { kind: "scarcity", text: scarcity }
      : null,
    imageVariant: "unclaimed",
    ariaLabel: headline,
  }
}

export interface BuildStaticOfferBannerContentArgs {
  title: string
  subtitle: string
}

export function buildStaticOfferBannerContent({
  title,
  subtitle,
}: BuildStaticOfferBannerContentArgs): OfferBannerContent {
  return {
    outerClaimed: false,
    innerClaimed: false,
    headline: title,
    dataLines:
      subtitle.trim().length > 0 ?
        [{ text: subtitle, emphasis: "regular", tone: "secondary" }]
      : [],
    action: null,
    sticker: null,
    imageVariant: "unclaimed",
    ariaLabel: title,
  }
}
