import { formatOfferDiscountTitle } from "@/features/offers/utils/formatOfferDiscountTitle"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { shouldShowScarcitySticker } from "@/features/offers/data/selectPrimaryTimedOffer"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import { formatOfferBannerValidityTime } from "@/features/restaurant/utils/formatOfferBannerValidityTime"
import type { OfferBannerWindowPhase } from "@/features/restaurant/utils/offerBannerWindowPhase"
import type { OfferState } from "@/features/restaurant/utils/offerState"

export type OfferBannerContext = "restaurant" | "home"

export type OfferBannerDataLine = {
  text: string
  emphasis: "regular" | "accent"
  tone?: "primary" | "secondary" | "action-primary"
}

export type OfferBannerActionKind = "claim-now" | "pre-book-now" | "claimed"

export type OfferBannerAction = {
  kind: OfferBannerActionKind
  label: string
  disabled: boolean
}

export type OfferBannerStickerKind =
  | "countdown"
  | "scarcity"
  | "expired"
  | "locked"

export type OfferBannerSticker =
  | { kind: "countdown" }
  | { kind: "scarcity"; text: string }
  | { kind: "expired"; text: string }
  | { kind: "locked"; text: string }

export type OfferBannerImageVariant = "claimed" | "unclaimed"

/** Figma `16103:17598` — limited-availability banners use danger-tinted shell. */
export type OfferBannerOuterShellTone = "neutral" | "danger"

export type OfferBannerContent = {
  outerClaimed: boolean
  /** Background for the outer shell when not claimed. */
  outerShellTone: OfferBannerOuterShellTone
  innerClaimed: boolean
  headline: string
  dataLines: OfferBannerDataLine[]
  action: OfferBannerAction | null
  sticker: OfferBannerSticker | null
  imageVariant: OfferBannerImageVariant
  ariaLabel: string
}

const DEFAULT_MIN_ORDER_EUR = 10
const DEFAULT_MAX_SAVING_EUR = 20

const LOCKED_STICKER_COPY = "One offer per restaurant per day"

/** Banner copy uses whole euros; always round up so savings read as round numbers. */
export function roundMaxSavingEurUp(eur: number): number {
  if (!Number.isFinite(eur) || eur <= 0) return DEFAULT_MAX_SAVING_EUR
  return Math.ceil(eur)
}

export function formatOfferBannerTitle(
  discountPercent: number,
  isAllDay = false,
): string {
  return formatOfferDiscountTitle(discountPercent, isAllDay)
}

export function formatOfferBannerMinMaxLine(
  minOrderEur?: number,
  maxSavingEur?: number,
): string {
  const min = minOrderEur ?? DEFAULT_MIN_ORDER_EUR
  const max = roundMaxSavingEurUp(maxSavingEur ?? DEFAULT_MAX_SAVING_EUR)
  return `Min. order ${min.toFixed(2)}€ · Max. saving ${max}€`
}

export function formatLimitedAvailabilityLabel(remainingCount: number): string {
  return `Limited availability — ${remainingCount} left`
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

/** Claimed banner secondary line (Figma) — e.g. "30% discount". */
export function formatOfferBannerClaimedDiscountLine(
  discountPercent: number,
): string {
  return `${discountPercent}% discount`
}

/** Home claimed detail line — e.g. "30% discount · Today · 19:00". */
export function formatOfferBannerHomeClaimedDetailLine(
  claim: ClaimedOffer,
  discountPercent: number,
): string {
  return `${formatOfferBannerClaimedDiscountLine(discountPercent)} · ${formatOfferBannerArrivalLine(claim)}`
}

export interface BuildOfferBannerContentArgs {
  state: OfferState
  offer: RestaurantOfferCardModel
  claim: ClaimedOffer | undefined
  context: OfferBannerContext
  displayDiscount: number
  windowPhase: OfferBannerWindowPhase
  hasOtherClaimAtVenue: boolean
  minOrderEur?: number
  maxSavingEur?: number
}

function buildAvailableDataLines(
  offer: RestaurantOfferCardModel,
): OfferBannerDataLine[] {
  return [
    {
      text: formatOfferBannerScheduleLine(offer.date, offer.timeWindow),
      emphasis: "regular",
      tone: "primary",
    },
  ]
}

export function buildOfferBannerContent({
  state,
  offer,
  claim,
  context,
  displayDiscount,
  windowPhase,
  hasOtherClaimAtVenue,
}: BuildOfferBannerContentArgs): OfferBannerContent {
  if (state === "claimed" && claim) {
    if (context === "home") {
      const headline =
        offer.restaurantName?.trim() || "Restaurant"
      return {
        outerClaimed: true,
        outerShellTone: "neutral",
        innerClaimed: true,
        headline,
        dataLines: [
          {
            text: formatOfferBannerHomeClaimedDetailLine(claim, displayDiscount),
            emphasis: "accent",
          },
        ],
        action: { kind: "claimed", label: "Claimed", disabled: false },
        sticker: { kind: "countdown" },
        imageVariant: "claimed",
        ariaLabel: headline,
      }
    }
    const headline = formatOfferBannerClaimedDiscountLine(displayDiscount)
    const scheduleLine = formatOfferBannerArrivalLine(claim)
    return {
      outerClaimed: true,
      outerShellTone: "neutral",
      innerClaimed: true,
      headline,
      dataLines: [
        {
          text: scheduleLine,
          emphasis: "regular",
          tone: "primary",
        },
      ],
      action: {
        kind: "claimed",
        label: "Active",
        disabled: false,
      },
      sticker: { kind: "countdown" },
      imageVariant: "claimed",
      ariaLabel: `${headline}, ${scheduleLine}`,
    }
  }

  const headline = formatOfferBannerTitle(
    displayDiscount,
    Boolean(offer.isAllDay),
  )
  const dataLines = buildAvailableDataLines(offer)

  if (state === "expired") {
    return {
      outerClaimed: false,
      outerShellTone: "neutral",
      innerClaimed: false,
      headline,
      dataLines,
      action: { kind: "claim-now", label: "Claim now", disabled: true },
      sticker: { kind: "expired", text: "Offer has expired" },
      imageVariant: "unclaimed",
      ariaLabel: headline,
    }
  }

  if (hasOtherClaimAtVenue) {
    return {
      outerClaimed: false,
      outerShellTone: "neutral",
      innerClaimed: false,
      headline,
      dataLines,
      action: { kind: "claim-now", label: "Claim now", disabled: true },
      sticker: { kind: "locked", text: LOCKED_STICKER_COPY },
      imageVariant: "unclaimed",
      ariaLabel: headline,
    }
  }

  if (windowPhase === "active") {
    return {
      outerClaimed: false,
      outerShellTone: "neutral",
      innerClaimed: false,
      headline,
      dataLines,
      action: { kind: "claim-now", label: "Claim now", disabled: false },
      sticker: null,
      imageVariant: "unclaimed",
      ariaLabel: headline,
    }
  }

  const availabilitySticker =
    shouldShowScarcitySticker(offer.remainingCount) ?
      {
        kind: "scarcity" as const,
        text: formatLimitedAvailabilityLabel(offer.remainingCount!),
      }
    : null

  return {
    outerClaimed: false,
    outerShellTone: availabilitySticker ? "danger" : "neutral",
    innerClaimed: false,
    headline,
    dataLines,
    action: { kind: "claim-now", label: "Claim now", disabled: false },
    sticker: availabilitySticker,
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
    outerShellTone: "neutral",
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
