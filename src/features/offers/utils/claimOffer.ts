import type { ClaimData, ClaimedOffer } from "@/features/offers/offers.types"
import { formatClaimedOfferFoodLabel } from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { parseHHMMToMinutes } from "@/features/offers/utils/offerTimePicker"
import { toLocalYmd } from "@/features/offers/utils/offerScheduleLocal"

export interface ClaimOfferInput extends ClaimData {
  offerId: string
  restaurantSlug: string
  discountPercent: number
  /** Calendar date label for the claimed screen, e.g. "Monday, 8 May". */
  arrivalDateLabel: string
  promoText?: string
  isAllDay: boolean
  workingHoursEnd: string
  offerEnd: string
  offerStart?: string
  cashbackAmount?: number
  /** Percentages (e.g. 5, 10, 15, 20) for pay-bill tip chips; defaults in {@link claimOffer}. */
  tipPresetAmounts?: number[]
  discountAddPercent?: number
  /** Local calendar day for offer-window end; defaults to today at call time. */
  offerWindowBaseDate?: Date
  /** Local `YYYY-MM-DD` for the offer tab day; defaults from `offerWindowBaseDate`. */
  offerScheduleYmd?: string
  /** Figma offer list row; defaults from {@link formatClaimedOfferFoodLabel}. */
  offerDetailLabel?: string
  minOrderEur?: number
  maxSavingEur?: number
}

/**
 * PIN is generated only here (prototype stand-in for server randomisation).
 * UI must never invent digits outside this helper.
 */
/** Prototype PIN — use server randomness in production. */
export function generateClaimPin(): string {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return String(bytes[0]! % 10000).padStart(4, "0")
}

/**
 * Instant when the walk-in offer stops being valid on `baseDate` (local): the
 * earlier of venue close and offer end (`HH:MM` on that calendar day). Used
 * for “Offer ends in …” countdowns on the claimed banner and claimed-offer
 * screen — **not** a post-arrival grace period.
 */
export function computeOfferWindowCloseIso(args: {
  /** Base calendar date for the offer (local). */
  baseDate: Date
  workingHoursEnd: string
  offerEnd: string
  /** When set with an end before start, the window crosses midnight (mirrors banner expiry). */
  offerStart?: string
}): string {
  const workEndM = parseHHMMToMinutes(args.workingHoursEnd)
  const offerEndM = parseHHMMToMinutes(args.offerEnd)
  if (workEndM == null || offerEndM == null) {
    const d = new Date(args.baseDate)
    d.setHours(23, 0, 0, 0)
    return d.toISOString()
  }

  const startM =
    args.offerStart != null ? parseHHMMToMinutes(args.offerStart) : null
  const overnight = startM != null && offerEndM < startM

  if (
    startM == null &&
    offerEndM < 12 * 60 &&
    offerEndM < workEndM
  ) {
    const d = new Date(args.baseDate)
    d.setDate(d.getDate() + 1)
    d.setHours(Math.floor(offerEndM / 60), offerEndM % 60, 0, 0)
    return d.toISOString()
  }

  if (overnight) {
    const workEndAbsolute =
      workEndM < startM! ? workEndM + 24 * 60 : workEndM
    const offerEndAbsolute = offerEndM + 24 * 60
    const closeAbsolute = Math.min(workEndAbsolute, offerEndAbsolute)
    const d = new Date(args.baseDate)
    if (closeAbsolute >= 24 * 60) {
      d.setDate(d.getDate() + 1)
    }
    const minutesOnDay = closeAbsolute % (24 * 60)
    d.setHours(Math.floor(minutesOnDay / 60), minutesOnDay % 60, 0, 0)
    return d.toISOString()
  }

  const closeM = Math.min(workEndM, offerEndM)
  const d = new Date(args.baseDate)
  d.setHours(Math.floor(closeM / 60), closeM % 60, 0, 0)
  return d.toISOString()
}

/**
 * Synchronous prototype claim — returns payload shaped like the real API.
 */
export function claimOffer(input: ClaimOfferInput): ClaimedOffer {
  const pin = generateClaimPin()
  const claimedAt = Date.now()
  const offerWindowCloses = computeOfferWindowCloseIso({
    baseDate: input.offerWindowBaseDate ?? new Date(),
    workingHoursEnd: input.workingHoursEnd,
    offerEnd: input.offerEnd,
    offerStart: input.isAllDay ? undefined : input.offerStart,
  })

  const discountAddPercent =
    input.discountAddPercent ??
    (input.paymentMethod === "dineout" ? DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT : 0)

  const offerWindowBaseDate = input.offerWindowBaseDate ?? new Date()
  const offerScheduleYmd =
    input.offerScheduleYmd ?? toLocalYmd(offerWindowBaseDate)

  return {
    pin,
    offerWindowCloses,
    arrivalTime: input.arrivalTime,
    arrivalDate: input.arrivalDateLabel,
    guestCount: input.guestCount,
    paymentMethod: input.paymentMethod,
    discountPercent: input.discountPercent,
    offerDetailLabel:
      input.offerDetailLabel ?? formatClaimedOfferFoodLabel(input.discountPercent),
    minOrderEur: input.minOrderEur,
    maxSavingEur: input.maxSavingEur,
    promoText: input.promoText,
    restaurantSlug: input.restaurantSlug,
    offerId: input.offerId,
    claimedAt,
    offerScheduleYmd,
    cashbackAmount: input.cashbackAmount ?? 2.5,
    tipPresetAmounts: input.tipPresetAmounts ?? [5, 10, 15],
    discountAddPercent,
  }
}

export class CancelOfferError extends Error {
  override readonly name = "CancelOfferError"
}

/** Prototype cancel — mirrors async API; replace with real `fetch` in production. */
export function cancelOffer(offerId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    globalThis.setTimeout(() => {
      if (!offerId.trim()) {
        reject(new CancelOfferError("Offer not found"))
        return
      }
      resolve()
    }, 400)
  })
}
