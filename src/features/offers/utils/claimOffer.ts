import type { ClaimData, ClaimedOffer } from "@/features/offers/offers.types"
import { parseHHMMToMinutes } from "@/features/offers/utils/offerTimePicker"

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
  cashbackAmount?: number
  /** Percentages (e.g. 10, 15, 20) for pay-bill tip chips; defaults in {@link claimOffer}. */
  tipPresetAmounts?: number[]
  discountAddPercent?: number
  /** Local calendar day for offer-window end; defaults to today at call time. */
  offerWindowBaseDate?: Date
}

/**
 * PIN is generated only here (prototype stand-in for server randomisation).
 * UI must never invent digits outside this helper.
 */
export function generateClaimPin(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0")
}

/**
 * Instant when the walk-in offer stops being valid on `baseDate` (local): the
 * earlier of venue close and offer end (`HH:MM` on that calendar day). Used
 * for “Offer ends in …” countdowns on the claimed banner and claimed-offer
 * screen (`Hh Mm Ss` or `M:SS` under one hour) — **not** a post-arrival grace period.
 */
export function computeOfferWindowCloseIso(args: {
  /** Base calendar date for the offer (local). */
  baseDate: Date
  workingHoursEnd: string
  offerEnd: string
}): string {
  const workEndM = parseHHMMToMinutes(args.workingHoursEnd)
  const offerEndM = parseHHMMToMinutes(args.offerEnd)
  if (workEndM == null || offerEndM == null) {
    const d = new Date(args.baseDate)
    d.setHours(23, 0, 0, 0)
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
  })

  const discountAddPercent =
    input.discountAddPercent ??
    (input.paymentMethod === "dineout" ? 40 : 0)

  return {
    pin,
    offerWindowCloses,
    arrivalTime: input.arrivalTime,
    arrivalDate: input.arrivalDateLabel,
    guestCount: input.guestCount,
    paymentMethod: input.paymentMethod,
    discountPercent: input.discountPercent,
    promoText: input.promoText,
    restaurantSlug: input.restaurantSlug,
    offerId: input.offerId,
    claimedAt,
    cashbackAmount: input.cashbackAmount ?? 2.5,
    tipPresetAmounts: input.tipPresetAmounts ?? [10, 15, 20],
    discountAddPercent,
  }
}

/** Prototype cancel — reserved for future API wiring. */
export function cancelOffer(offerId: string): void {
  void offerId
}
