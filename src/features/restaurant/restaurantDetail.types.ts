import type { ClaimedOffer } from "@/features/offers/offers.types"
import type { RestaurantSlug } from "@/features/offers/data/restaurantOffers.types"
import type { RestaurantAboutRestaurant } from "@/features/restaurant/components/RestaurantAbout/restaurantAbout.types"
import type { RestaurantFixedOpenHoursRow } from "@/features/restaurant/data/restaurantFixedOpenHours"
import type { DateValue } from "@/features/search/filters.types"
import type { OfferTag, UserClaim } from "@/features/restaurant/utils/offerState"

export type RestaurantOfferTabState = "active" | "inactive" | "no-offer"

export type {
  BannerState,
  OfferForBanner,
  OfferState,
  OfferTag,
  UserClaim,
} from "@/features/restaurant/utils/offerState"

export interface RestaurantOfferDateTab {
  id: string
  state: RestaurantOfferTabState
  /** e.g. "Today" or "12 May" */
  dayLabel: string
  /** e.g. "30% off"; null when no-offer */
  discountLabel: string | null
}

export interface RestaurantOfferCardModel {
  id: string
  /** Unix ms; banner `expired` when `expiresAt < now` and user has no claim for this offer. */
  expiresAt: number
  /**
   * Calendar day this row applies to (`"today"` or `YYYY-MM-DD`), device locale.
   * With `offerEnd`, drives expiry after that local end time (see {@link getOfferBannerState}).
   */
  offerScheduleDate?: DateValue
  tags: OfferTag[]
  discountPercent: number
  /** Venue name for claim flow header; defaults from detail screen when omitted. */
  restaurantName?: string
  title: string
  /** e.g. "Today" — paired with `timeWindow` for meta lines. */
  date: string
  /**
   * Text after `date ·` on the meta line (e.g. full `Arrive between 10:00 - 17:00`).
   * For `claimed`, typically the arrival time fragment (e.g. `10:00`).
   */
  timeWindow: string
  /** Raw closing time when `closingLine` is not provided (e.g. `00:59`). */
  offerWindowCloses?: string
  /** Full second line for claimed (preferred over templating `offerWindowCloses`). */
  closingLine?: string
  /** Shown in the scarcity badge when `available` and defined. */
  remainingCount?: number
  /** Venue photo URL (restaurant gallery), not a generic placeholder. */
  restaurantImage: string
  /** Shown when the user taps an expired banner (snackbar). */
  expiredSnackbarDescription?: string
  /** Claim modal: offer window start `HH:MM` (limited window). */
  offerStart?: string
  /** Claim modal: offer window end `HH:MM` (limited window). */
  offerEnd?: string
  /** When true, arrival uses native time picker for full working hours. */
  isAllDay?: boolean
  /** Restaurant opens (same-day `HH:MM`). */
  workingHoursStart?: string
  /** Restaurant closes (same-day `HH:MM`). */
  workingHoursEnd?: string
  /** DineOut payment promo line on claim / claimed screens. */
  paymentPromoText?: string
}

export interface RestaurantBenefitRowModel {
  id: string
  /** Corner badge image (52×52 area, object-contain). */
  imageUrl: string
  title: string
  subtitle: string
}

export interface RestaurantVenueInfoRowModel {
  id: "hours" | "menu" | "address" | "phone"
  label: string
  value: string
}

/** One source row in the rating bottom sheet (Figma MODAL / Rating). */
export interface RestaurantRatingSourceRowModel {
  ratingValue: string
  /** e.g. "(1200 reviews)" */
  reviewsParenthetical: string
  /** e.g. "on Google Maps" */
  subtitle: string
  externalUrl: string
}

/** Copy + links for the rating sources sheet. */
export interface RestaurantRatingSheetModel {
  googleMaps: RestaurantRatingSourceRowModel
  tripadvisor: RestaurantRatingSourceRowModel
}

export interface RestaurantDetailModel {
  slug: RestaurantSlug
  name: string
  heroImageUrl: string
  /**
   * Logo URLs to try in order (`getRestaurantLogoCandidates`); `onError`
   * advances until `logoFallbackUrl`.
   */
  logoCandidates: string[]
  /** Photo used when every logo candidate 404s. */
  logoFallbackUrl?: string
  isOpen: boolean
  closesAt: string
  ratingValue: string
  reviewsLine: string
  /** TripAdvisor + Google Maps breakdown for the rating sheet. */
  ratingSheet: RestaurantRatingSheetModel
  priceRange: string
  areaLabel: string
  cuisineTags: string
  offerDateTabs: RestaurantOfferDateTab[]
  /** Offers keyed by tab id (same order as tabs). */
  offersByTabId: Record<string, RestaurantOfferCardModel[]>
  benefits: RestaurantBenefitRowModel[]
  venueGalleryCycles: Array<{ tall: string; top: string; bottom: string }>
  openHoursSummary: string
  /** Weekly grid for the hours sheet (single source with {@link openHoursSummary}). */
  weeklyOpenHours: readonly RestaurantFixedOpenHoursRow[]
  /** Sheet title: {@link buildOpenHoursUiState} → `Open now` or `Closed`. */
  openHoursSheetHeading: string
  /** Sheet subtitle only, e.g. `Closes at 23:00` (no “Open now ·”). */
  openHoursSheetSubtitle: string
  menuRowValue: string
  /** Full-screen menu gallery (prototype photography). */
  menuGalleryImages: string[]
  address: string
  phone: string
  /** Full “About” screen payload (opened from “More about venue”). */
  about: RestaurantAboutRestaurant
}

export interface RestaurantDetailScreenProps {
  model: RestaurantDetailModel
  onBack: () => void
  activeTab: string
  onTabChange: (id: string) => void
  /**
   * Dev / future: deep-link handlers. Pass `null` to disable the paired in-app
   * UI (sheet/modal) from opening; `undefined` keeps prototype behavior (sheet opens).
   */
  onOpenHours?: (() => void) | null
  onOpenMenu?: (() => void) | null
  onOpenMaps?: () => void
  onCall?: () => void
  onOpenReviews?: (() => void) | null
  onOpenPriceInfo?: (() => void) | null
  onPayBill?: () => void
  onMoreAboutVenue?: () => void
  onShare?: () => void
  /** Fires when the user taps an offer in the `available` state. */
  onOfferAvailablePress?: (offerId: string) => void
  /** Fires when the user taps a `claimed` offer (routing TBD). */
  onOfferClaimedPress?: (offerId: string) => void
  /** Local / synced claims for {@link getOfferBannerState}; never infer `claimed` from tags alone. */
  userClaims: readonly UserClaim[]
  /** Full claim payloads keyed by offer id (banner claimed row: arrival + countdown). */
  claimedOffersById: Readonly<Record<string, ClaimedOffer>>
}
