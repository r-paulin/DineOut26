import { resolveClaimedOfferDateLabel } from "@/features/offers/utils/formatClaimedArrivalDate"
import { formatOfferDiscountTitle } from "@/features/offers/utils/formatOfferDiscountTitle"
import type { ClaimedOffer, PaidOfferRecord } from "@/features/offers/offers.types"
import { clampRemainingSpotsForDisplay } from "@/features/offers/data/selectPrimaryTimedOffer"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"
import { round2 } from "@/features/payBill/utils/discountCalc"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import { formatOfferBannerValidityTime } from "@/features/restaurant/utils/formatOfferBannerValidityTime"
import type { OfferBannerWindowPhase } from "@/features/restaurant/utils/offerBannerWindowPhase"
import type { OfferState } from "@/features/restaurant/utils/offerState"

export type OfferBannerContext = "restaurant" | "home"

export type OfferBannerDataLine = {
  text: string
  emphasis: "regular" | "accent"
  tone?: "primary" | "secondary" | "action-primary"
  /** Overrides default compact typography for primary-tone lines. */
  typography?: "compact-accent" | "compact-regular"
}

export type OfferBannerActionKind =
  | "claim-now"
  | "pre-book-now"
  | "claimed"
  | "paid"

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
  | "dineout-upsell"

export type OfferBannerSticker =
  | { kind: "countdown" }
  | { kind: "scarcity"; text: string }
  | { kind: "expired"; text: string }
  | { kind: "locked"; text: string }
  | { kind: "dineout-upsell"; text: string }
  | { kind: "cashback-earned"; text: string }

export type OfferBannerImageVariant = "claimed" | "unclaimed"

export type OfferBannerInnerSurface = "default" | "claimed" | "paid"

/** Figma `17097:18617` — scarcity banners use neutral-primary shell + sticker row. */
export type OfferBannerOuterShellTone = "neutral" | "limited"

export type OfferBannerContent = {
  outerClaimed: boolean
  /** Background for the outer shell when not claimed. */
  outerShellTone: OfferBannerOuterShellTone
  innerClaimed: boolean
  /** Inner card fill — paid uses white base per Figma `17649:34551`. */
  innerSurface?: OfferBannerInnerSurface
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

/** @deprecated Prefer {@link formatClaimSlotsRemainingLabel} for banner stickers. */
export function formatLimitedAvailabilityLabel(remainingCount: number): string {
  return `Limited availability — ${remainingCount} left`
}

/** Scarcity sticker — e.g. "5 offers left" or "Only 2 offers left" when fewer than 3 remain. */
export function formatClaimSlotsRemainingLabel(remainingCount: number): string {
  const offerWord = remainingCount === 1 ? "offer" : "offers"
  if (remainingCount < 3) {
    return `Only ${remainingCount} ${offerWord} left`
  }
  return `${remainingCount} offers left`
}

export type FormatOfferBannerScheduleLineOptions = {
  windowPhase?: OfferBannerWindowPhase
  isAllDay?: boolean
  offerEnd?: string
}

/** Matches home badge copy: live ranged offers show end time only. */
export function formatOfferBannerAvailabilityTime(
  timeWindow: string,
  options: FormatOfferBannerScheduleLineOptions = {},
): string {
  const { windowPhase, isAllDay, offerEnd } = options
  if (windowPhase === "active" && !isAllDay && offerEnd?.trim()) {
    return `Until ${offerEnd.trim()}`
  }
  return formatOfferBannerValidityTime(timeWindow)
}

export function formatOfferBannerScheduleLine(
  dateLabel: string,
  timeWindow: string,
  options: FormatOfferBannerScheduleLineOptions = {},
): string {
  const time = formatOfferBannerAvailabilityTime(timeWindow, options)
  return `${dateLabel} · ${time}`
}

export function formatOfferBannerArrivalLine(
  claim: ClaimedOffer,
  nowMs: number = Date.now(),
): string {
  return `${resolveClaimedOfferDateLabel(claim, nowMs)} · ${claim.arrivalTime}`
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

/** Figma `16626:52014` — card/cash paid banner secondary line. */
export const OFFER_BANNER_PAID_CASH_SUBTITLE = "Paid with card or cash" as const

export function formatOfferBannerTotalBillLine(eur: number): string {
  return `Total bill: ${formatEurMajor(eur)}`
}

/** @deprecated Use {@link formatOfferBannerTotalBillLine}. */
export function formatOfferBannerPaidAmountLine(eur: number): string {
  return formatOfferBannerTotalBillLine(eur)
}

/** Figma `17649:34551` sticker — e.g. `€5,00 cashback earned`. */
export function formatOfferBannerCashbackEarnedStickerLabel(eur: number): string {
  const formatted = formatEurMajor(round2(eur)).replace(" €", "")
  return `€${formatted} cashback earned`
}

/** @deprecated Use {@link formatOfferBannerCashbackEarnedStickerLabel}. */
export function formatOfferBannerCashbackEarnedLabel(eur: number): string {
  return formatOfferBannerCashbackEarnedStickerLabel(eur)
}

export function formatOfferBannerDineOutUpsellSticker(
  percent: number = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
): string {
  return `Pay with Bolt Food and earn ${formatDiscountPercent(percent)}% back`
}

export interface BuildPaidOfferBannerContentArgs {
  paid: PaidOfferRecord
  offer: RestaurantOfferCardModel
}

export function buildPaidOfferBannerContent({
  paid,
  offer,
}: BuildPaidOfferBannerContentArgs): OfferBannerContent {
  const headline = formatOfferBannerTitle(
    paid.discountPercent,
    Boolean(offer.isAllDay),
  )

  if (paid.paymentMethod === "dineout") {
    const totalBillLine =
      paid.paidAmountEur != null ?
        formatOfferBannerTotalBillLine(paid.paidAmountEur)
      : ""
    const cashbackSticker =
      paid.cashbackEarnedEur != null && paid.cashbackEarnedEur > 0 ?
        formatOfferBannerCashbackEarnedStickerLabel(paid.cashbackEarnedEur)
      : null

    return {
      outerClaimed: true,
      outerShellTone: "neutral",
      innerClaimed: true,
      innerSurface: "paid",
      headline,
      dataLines:
        totalBillLine ?
          [
            {
              text: totalBillLine,
              emphasis: "regular",
              tone: "primary",
              typography: "compact-regular",
            },
          ]
        : [],
      action: { kind: "paid", label: "Paid", disabled: false },
      sticker:
        cashbackSticker ?
          { kind: "cashback-earned", text: cashbackSticker }
        : null,
      imageVariant: "claimed",
      ariaLabel: cashbackSticker ?
        `${headline}, ${totalBillLine}, ${cashbackSticker}`
      : `${headline}, ${totalBillLine}, Paid`,
    }
  }

  return {
    outerClaimed: true,
    outerShellTone: "neutral",
    innerClaimed: true,
    headline,
    dataLines: [
      {
        text: OFFER_BANNER_PAID_CASH_SUBTITLE,
        emphasis: "regular",
        tone: "primary",
      },
    ],
    action: null,
    sticker: {
      kind: "dineout-upsell",
      text: formatOfferBannerDineOutUpsellSticker(),
    },
    imageVariant: "claimed",
    ariaLabel: `${headline}, ${OFFER_BANNER_PAID_CASH_SUBTITLE}`,
  }
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
  windowPhase: OfferBannerWindowPhase,
): OfferBannerDataLine[] {
  return [
    {
      text: formatOfferBannerScheduleLine(offer.date, offer.timeWindow, {
        windowPhase,
        isAllDay: offer.isAllDay,
        offerEnd: offer.offerEnd,
      }),
      emphasis: "regular",
      tone: "primary",
    },
  ]
}

function buildAvailabilitySticker(
  offer: RestaurantOfferCardModel,
): OfferBannerSticker | null {
  const remainingCount = clampRemainingSpotsForDisplay(offer.remainingCount)
  if (remainingCount == null) return null
  return {
    kind: "scarcity",
    text: formatClaimSlotsRemainingLabel(remainingCount),
  }
}

function buildAvailableOfferBannerFields(
  offer: RestaurantOfferCardModel,
  displayDiscount: number,
  windowPhase: OfferBannerWindowPhase,
): Pick<
  OfferBannerContent,
  "headline" | "dataLines" | "sticker" | "outerShellTone" | "ariaLabel"
> {
  const headline = formatOfferBannerTitle(
    displayDiscount,
    Boolean(offer.isAllDay),
  )
  const dataLines = buildAvailableDataLines(offer, windowPhase)
  const sticker = buildAvailabilitySticker(offer)
  return {
    headline,
    dataLines,
    sticker,
    outerShellTone: sticker ? "limited" : "neutral",
    ariaLabel: headline,
  }
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
      const detailLine =
        claim.offerDetailLabel?.trim() ||
        formatOfferBannerClaimedDiscountLine(displayDiscount)
      const arrivalLine = formatOfferBannerArrivalLine(claim)
      return {
        outerClaimed: true,
        outerShellTone: "neutral",
        innerClaimed: true,
        headline,
        dataLines: [
          { text: arrivalLine, emphasis: "accent" },
          {
            text: detailLine,
            emphasis: "regular",
            tone: "secondary",
          },
        ],
        action: { kind: "claimed", label: "Claimed", disabled: false },
        sticker: { kind: "countdown" },
        imageVariant: "claimed",
        ariaLabel: `${headline}, ${arrivalLine}, ${detailLine}`,
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

  if (state === "expired") {
    const headline = formatOfferBannerTitle(
      displayDiscount,
      Boolean(offer.isAllDay),
    )
    const dataLines = buildAvailableDataLines(offer, windowPhase)
    return {
      outerClaimed: false,
      outerShellTone: "neutral",
      innerClaimed: false,
      headline,
      dataLines,
      action: { kind: "claim-now", label: "Claim offer", disabled: true },
      sticker: { kind: "expired", text: "Offer has expired" },
      imageVariant: "unclaimed",
      ariaLabel: headline,
    }
  }

  if (hasOtherClaimAtVenue) {
    const headline = formatOfferBannerTitle(
      displayDiscount,
      Boolean(offer.isAllDay),
    )
    const dataLines = buildAvailableDataLines(offer, windowPhase)
    return {
      outerClaimed: false,
      outerShellTone: "neutral",
      innerClaimed: false,
      headline,
      dataLines,
      action: { kind: "claim-now", label: "Claim offer", disabled: true },
      sticker: { kind: "locked", text: LOCKED_STICKER_COPY },
      imageVariant: "unclaimed",
      ariaLabel: headline,
    }
  }

  const availableFields = buildAvailableOfferBannerFields(
    offer,
    displayDiscount,
    windowPhase,
  )

  return {
    outerClaimed: false,
    outerShellTone: availableFields.outerShellTone,
    innerClaimed: false,
    headline: availableFields.headline,
    dataLines: availableFields.dataLines,
    action: { kind: "claim-now", label: "Claim offer", disabled: false },
    sticker: availableFields.sticker,
    imageVariant: "unclaimed",
    ariaLabel: availableFields.ariaLabel,
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
