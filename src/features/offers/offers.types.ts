import type { DateValue } from "@/features/search/filters.types"

export type OfferCardCampaign = {
  /** Discount segment before the middle dot, e.g. "-25%" or "10% off". Absent when there are no offers. */
  discountLabel?: string
  /** Time window after " · ", rendered at 80% white on the dark pill. */
  timeWindow?: string
  /** Second pill: "+1 more offer", "+2 more offers", "+3 more offers", … (count of additional offers). */
  extraOffers?: number
}

export type OfferCardLayout = "carousel" | "list"

export type OfferCardModel = {
  id: string
  /** Map marker `restaurantId` / focus target when different from `id` */
  restaurantSlug?: string
  name: string
  priceRange: string
  area: string
  /** Tag line under price / area (see `restaurantTagProfiles` for canonical copy). */
  cuisine: string
  /** Longer positioning line — tooltips, detail, reuse. */
  tagDescription?: string
  rating: string
  image: string
  campaign: OfferCardCampaign
  /** Default carousel XS card; `list` = XL row (gallery + meta). */
  layout?: OfferCardLayout
  /**
   * XL: horizontally scrollable gallery (first slide shows campaign badges).
   * Reuse the same restaurant / pool images for a full strip + trailing “More…”.
   */
  galleryImages?: string[]
  /** XL: review count label, e.g. "(200+)". */
  reviewCount?: string
  /** Defaults to true when omitted (prototype). */
  isOpen?: boolean
  /** Shown after "Open · Closes " on the map-opened card when `isOpen` is true. */
  closesAt?: string
}

/**
 * View-model for `_Place / Card / On Map - Opened` (spec / Figma parity).
 * Derived from {@link OfferCardModel} via {@link mapOfferToRestaurantCardView}.
 */
export type RestaurantCardView = {
  image: string
  name: string
  isOpen: boolean
  closesAt?: string
  cuisineTags: string[]
  priceRange: string
  rating: number
  reviewCount: string
  primaryOffer: { discount: string; time: string } | null
  extraOffersCount: number
}

export type SheetSnap = "minimized" | "peek" | "full"

export type PaymentMethod = "dineout" | "card_or_cash"

export interface ClaimData {
  arrivalTime: string
  guestCount: number
  paymentMethod: PaymentMethod
}

/**
 * Result of a successful claim (prototype: built synchronously in {@link claimOffer}).
 */
export interface ClaimedOffer {
  pin: string
  offerWindowCloses: string
  arrivalTime: string
  arrivalDate: string
  guestCount: number
  paymentMethod: PaymentMethod
  discountPercent: number
  /** Claimed-offer details row (Figma `15753:13182`), e.g. "30% off your bill". */
  offerDetailLabel?: string
  /** Minimum order for banner copy, e.g. `10` → "Min. order 10.00€". */
  minOrderEur?: number
  /** Maximum saving for banner copy, e.g. `40` → "Max. saving 40.00€". */
  maxSavingEur?: number
  promoText?: string
  restaurantSlug: string
  offerId: string
  /** Unix ms when the claim was recorded (prototype; server would return this). */
  claimedAt: number
  /** Unix ms when the user checked in at the venue; undefined until check-in. */
  checkedInAt?: number
  /** Local `YYYY-MM-DD` for the offer day (one offer per venue per day). */
  offerScheduleYmd?: string
  /** Cashback line on Pay screen (prototype EUR). */
  cashbackAmount?: number
  /**
   * Tip step preset chips: integer **percentages** (e.g. 5, 10, 15, 20), not EUR.
   * Chip amounts are `receiptTotalEur * percent / 100` at pay time.
   */
  tipPresetAmounts?: number[]
  /** Add-on % stacked multiplicatively with {@link discountPercent} when paying with DineOut. */
  discountAddPercent?: number
}

/** Post-payment offer row on restaurant detail (Figma `_ Offer Banner ALT 5`). */
export interface PaidOfferRecord {
  offerId: string
  restaurantSlug: string
  restaurantName?: string
  discountPercent: number
  paymentMethod: PaymentMethod
  /** DineOut in-app payment only. */
  paidAmountEur?: number
  /** DineOut in-app payment only — credited to Bolt Balance. */
  cashbackEarnedEur?: number
  /** DineOut in-app payment only — for reopening payment confirmation. */
  paymentCode?: string
  receiptTotalEur?: number
  tipEur?: number | null
  discountAddPercent?: number
  paidAt: number
}

export type {
  GetTimePickerConfigOptions,
  OfferTimeConfig,
  TimePickerConfig,
  TimePickerMode,
} from "./utils/offerTimePicker"

/** Payload for {@link ClaimOfferModal} (subset of {@link RestaurantOfferCardModel}). */
export interface ClaimOfferModalOffer {
  id: string
  /** Offer headline (e.g. “20% off your bill”) for the claim sheet title. */
  title: string
  restaurantName: string
  discountPercent: number
  date: string
  /**
   * Local calendar anchor for this row (`"today"` or `YYYY-MM-DD`).
   * Drives arrival slots vs device clock in {@link getTimePickerConfig}.
   */
  offerScheduleDate?: DateValue
  offerStart: string
  offerEnd: string
  isAllDay: boolean
  workingHoursStart: string
  workingHoursEnd: string
  paymentPromoText?: string
  /** Meta line fragment for availability row on offer details. */
  timeWindow: string
  minOrderEur?: number
  maxSavingEur?: number
  remainingCount?: number
}
