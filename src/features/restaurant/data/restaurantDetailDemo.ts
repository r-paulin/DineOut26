import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"
import {
  OFFERS_ALL_RESTAURANTS,
  OFFERS_DINNER,
  OFFERS_NEAR_YOU,
  OFFERS_TODAY,
} from "@/features/offers/offers.data"
import type {
  RestaurantSlug,
  RestaurantTimedOffer,
} from "@/features/offers/data/restaurantOffers.types"
import { DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT } from "@/features/offers/constants/dineOutStackablePromo"
import {
  computeOfferCardCampaign,
} from "@/features/offers/utils/offerCampaign"
import { getRestaurantLogoCandidates } from "@/features/restaurant/data/restaurantLogos"
import {
  DEMO_AMENITIES_BY_SLUG,
  DEMO_WHAT_WE_SERVE_BY_SLUG,
} from "@/features/restaurant/data/restaurantAboutDemoContent"
import { RESTAURANT_WEEKLY_OPEN_HOURS } from "@/features/restaurant/data/restaurantFixedOpenHours"
import type { RestaurantAboutRestaurant } from "@/features/restaurant/components/RestaurantAbout/restaurantAbout.types"
import type {
  RestaurantDetailModel,
  RestaurantOfferCardModel,
  RestaurantOfferDateTab,
  RestaurantRatingSheetModel,
} from "@/features/restaurant/restaurantDetail.types"
import { buildOpenHoursUiState } from "@/features/restaurant/utils/restaurantOpenHoursUi"
import {
  type SearchResultRigaRow,
  SEARCH_RESULTS_RIGA,
} from "@/features/search/data/searchResultsRiga"
import type { DateValue } from "@/features/search/filters.types"
import { formatDateChipLabel, getDateOptions } from "@/features/search/utils/dateOptions"

/**
 * Display + `tel:` numbers (LV +371) from each venue’s public contact page /
 * reservation line — prototype detail only (verify before production).
 *
 * - 3 Pavāru: 3pavari.lv / MeetRiga (+371 20370537)
 * - Neiburgs: neiburgs.com/contacts (+371 20235504)
 * - Melnā Bite: melnabite.lv / Wellton (+371 67130675)
 * - Kolonāde: kolonade.lv (+371 26608882)
 * - Max Cekot Kitchen: maxcekot.com (+371 20112102)
 * - Rozengrāls: rozengrals.lv/contacts (+371 25769877)
 */
const DEMO_PHONE_BY_SLUG: Readonly<Record<RestaurantSlug, string>> = {
  "three-chefs": "+371 20 370 537",
  neiburgs: "+371 20 235 504",
  "melna-bite": "+371 67 130 675",
  kolonade: "+371 26 608 882",
  "max-cekot": "+371 20 112 102",
  rozengrals: "+371 25 769 877",
}

const SLUGS = new Set<string>([
  "three-chefs",
  "neiburgs",
  "melna-bite",
  "kolonade",
  "max-cekot",
  "rozengrals",
])

function isRestaurantSlug(s: string): s is RestaurantSlug {
  return SLUGS.has(s)
}

const MERGED_DISCOVER_OFFER_CARDS = [
  ...OFFERS_TODAY,
  ...OFFERS_DINNER,
  ...OFFERS_NEAR_YOU,
  ...OFFERS_ALL_RESTAURANTS,
]

function restaurantSlugInDiscoverOfferLists(slug: RestaurantSlug): boolean {
  return MERGED_DISCOVER_OFFER_CARDS.some(
    (o) => (o.restaurantSlug ?? o.id) === slug,
  )
}

/**
 * Rows removed from the restaurant Offers section because they are not part of
 * {@link getRestaurantOffers} (canonical timed list) or the merged discover
 * offer lists in `offers.data.ts`. Listed for audit / handoff.
 */
export const EXCLUDED_FROM_RESTAURANT_DETAIL_OFFERS = [
  "Synthetic expired banner (15%, 08:00–09:00, fake expiresAt) — UI demo only, not in RESTAURANT_OFFERS.",
] as const

function findRow(slug: string) {
  return SEARCH_RESULTS_RIGA.find((r) => r.restaurantSlug === slug)
}

function reviewsLineFromSuffix(suffix: string): string {
  const m = suffix.match(/\((\d+)\+\)/)
  if (m) return `${m[1]} reviews`
  return suffix.replace(/[()]/g, "").trim() || "0 reviews"
}

function reviewCountFromSuffix(suffix: string): number {
  const m = suffix.match(/(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

/** Figma RESTAURANT / Menu — static demo pages for every venue. */
const MENU_GALLERY_IMAGES: readonly string[] = [
  "/images/restaurant-menu-1.png",
  "/images/restaurant-menu-2.png",
  "/images/restaurant-menu-3.png",
]

function buildRatingSheet(row: SearchResultRigaRow): RestaurantRatingSheetModel {
  const base = Number.parseFloat(row.rating) || 4.5
  const tripCount = Math.max(1, reviewCountFromSuffix(row.reviewSuffix) || 200)
  const googleRating = Math.min(5, base + 0.1).toFixed(1)
  const tripRating = Math.max(3.5, Math.min(5, base - 0.1)).toFixed(1)
  const googleCount = Math.max(tripCount * 4, tripCount + 800)
  const q = encodeURIComponent(row.name)
  return {
    googleMaps: {
      ratingValue: googleRating,
      reviewsParenthetical: `(${googleCount.toLocaleString("en-US")} reviews)`,
      subtitle: "on Google Maps",
      externalUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
    },
    tripadvisor: {
      ratingValue: tripRating,
      reviewsParenthetical: `(${tripCount.toLocaleString("en-US")} reviews)`,
      subtitle: "on TripAdvisor",
      externalUrl: `https://www.tripadvisor.com/Search?q=${q}`,
    },
  }
}

/** Tab label: "Today" or compact "12 May" (Figma offer row). */
function restaurantOfferTabDayLabel(id: DateValue): string {
  if (id === "today") return "Today"
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(id)
  if (!parts) return formatDateChipLabel(id)
  const d = new Date(
    Number(parts[1]),
    Number(parts[2]) - 1,
    Number(parts[3]),
    12,
    0,
    0,
    0,
  )
  if (Number.isNaN(d.getTime())) return id
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(d)
}

/** "Today" or same short date as the tab, for offer card meta lines. */
function offerDetailDayPhrase(id: DateValue): string {
  if (id === "today") return "Today"
  return restaurantOfferTabDayLabel(id)
}

/**
 * Offer date tabs: same calendar rows as {@link getDateOptions} (Home date filter) —
 * **Today** plus the **next 7** days (8 tabs). Prototype: real offers only on the
 * first **3** days; later days use `no-offer` (decline in UI) and empty offer lists.
 * Tab discount label on offer days follows {@link computeOfferCardCampaign}.
 */
function buildOfferDateTabs(now: Date, slug: RestaurantSlug): RestaurantOfferDateTab[] {
  const rows = getDateOptions(now)
  const campaign = computeOfferCardCampaign(getRestaurantOffers(slug))
  const pctMatch = campaign.discountLabel?.match(/(\d+)/)
  const tabDiscountLabel =
    pctMatch ? `${pctMatch[1]}% off` : null

  return rows.map((row, index) => {
    const id = row.id as DateValue
    const dayLabel = restaurantOfferTabDayLabel(id)
    if (index < 3 && tabDiscountLabel) {
      return {
        id,
        state: index === 0 ? "active" : "inactive",
        dayLabel,
        discountLabel: tabDiscountLabel,
      }
    }
    return {
      id,
      state: "no-offer",
      dayLabel,
      discountLabel: null,
    }
  })
}

/** Prototype working hours (Monday row — same grid for all demo venues). */
function demoWorkingHoursFromMonday(): {
  workingHoursStart: string
  workingHoursEnd: string
} {
  const range = RESTAURANT_WEEKLY_OPEN_HOURS[0]!.range
  const parts = range.split(/\s*[–-]\s*/)
  return {
    workingHoursStart: (parts[0] ?? "12:00").trim(),
    workingHoursEnd: (parts[1] ?? "23:00").trim(),
  }
}

/** Claim modal / time picker fields from a canonical timed offer. */
function claimTimeFieldsFromOffer(
  o: RestaurantTimedOffer,
  wh: { workingHoursStart: string; workingHoursEnd: string },
): Pick<RestaurantOfferCardModel, "isAllDay" | "offerStart" | "offerEnd"> {
  if (o.window.kind === "all-day") {
    return {
      isAllDay: true,
      offerStart: wh.workingHoursStart,
      offerEnd: wh.workingHoursEnd,
    }
  }
  return {
    isAllDay: false,
    offerStart: o.window.start,
    offerEnd: o.window.end,
  }
}

function restaurantImageForOfferIndex(
  base: { primary: string; sideTop: string; sideBottom: string },
  index: number,
): string {
  const pool = [base.sideTop, base.sideBottom, base.primary]
  return pool[index % pool.length]!
}

const DEMO_WEBSITE_BY_SLUG: Readonly<Record<RestaurantSlug, string>> = {
  "three-chefs": "https://www.3pavari.lv",
  neiburgs: "https://www.neiburgs.com",
  "melna-bite": "https://www.melnabite.lv",
  kolonade: "https://www.kolonade.lv",
  "max-cekot": "https://www.maxcekot.com",
  rozengrals: "https://www.rozengrals.lv",
}

/**
 * Street addresses for detail + About (Google Maps query string).
 * Prototype demo — verify against each venue before production.
 *
 * - 3 Pavāru: 3pavari.lv / Torņa iela (Jēkaba kazarmas)
 * - Neiburgs: neiburgs.com / Jauniela (hotel & restaurant)
 * - Melnā Bite: melnabite.lv / Wellton Centrum (Audēju)
 * - Kolonāde: kolonade.lv / Brīvības bulvāris (Freedom Monument colonnade)
 * - Max Cekot Kitchen: maxcekot.com / contacts
 * - Rozengrāls: rozengrals.lv / kontakti
 */
const DEMO_ADDRESS_BY_SLUG: Readonly<Record<RestaurantSlug, string>> = {
  "three-chefs": "Torņa iela 4, Rīga",
  neiburgs: "Jauniela 27, Rīga",
  "melna-bite": "Audēju iela 13, Rīga",
  kolonade: "Brīvības bulvāris 26, Rīga",
  "max-cekot": "Jelgavas iela 42/8, Rīga",
  rozengrals: "Rozēna iela 1, Rīga",
}

function buildRestaurantAbout(
  row: SearchResultRigaRow,
  slug: RestaurantSlug,
  ctx: {
    isOpenNow: boolean
    openingHours: string
    address: string
    phone: string
    whatWeServe: string[]
    amenities: string[]
  },
): RestaurantAboutRestaurant {
  const rating = Number.parseFloat(row.rating) || 4.5
  const reviewCount = reviewCountFromSuffix(row.reviewSuffix)
  const images: string[] = [
    row.primaryImage,
    row.sideTop,
    row.sideBottom,
    row.primaryImage,
  ]
  const website = DEMO_WEBSITE_BY_SLUG[slug]

  return {
    name: row.name,
    rating,
    reviewCount,
    priceRange: row.displayPrice.replace(/–/g, "-"),
    images,
    isOpenNow: ctx.isOpenNow,
    openingHours: ctx.openingHours,
    menuUrl: website,
    address: ctx.address,
    phone: ctx.phone,
    website,
    description: `${row.name} is a well-regarded Riga venue known for its welcoming atmosphere and consistently well-executed plates. Guests return for attentive service and a menu that celebrates local and seasonal ingredients.`,
    serviceTypes: ["Dine-in", "Pickup", "Robot delivery", "DineOut"],
    whatWeServe: ctx.whatWeServe,
    amenities: ctx.amenities,
    otherDetails: [
      { label: "Legal entity name", value: `${row.name} SIA` },
      { label: "Registration code", value: "LV40003841251" },
      { label: "Sanitary authorisation", value: "LV-SAN-2024-001" },
      { label: "Business license", value: "LVID123456789" },
      { label: "Alcohol service license", value: "LV-AKT-2023-88" },
      { label: "Fire safety certificate", value: "Valid until 2027" },
    ],
  }
}

/** Banner demo: claimable offers (`getOfferBannerState` → available). */
const DEMO_OFFER_EXPIRES_FAR_FUTURE_MS = 4102444800000 // 2100-01-01 UTC

function offersForDateTab(
  slug: RestaurantSlug,
  tabIndex: number,
  tabId: DateValue,
  base: { primary: string; sideTop: string; sideBottom: string },
  restaurantName: string,
): RestaurantOfferCardModel[] {
  if (tabIndex >= 3) return []
  if (!restaurantSlugInDiscoverOfferLists(slug)) return []

  const timed = getRestaurantOffers(slug)
  if (timed.length === 0) return []

  const day = offerDetailDayPhrase(tabId)
  const tabSuffix = tabId === "today" ? "today" : tabId.replace(/-/g, "")
  const wh = demoWorkingHoursFromMonday()

  const cards: RestaurantOfferCardModel[] = timed.map((o, i) => {
    const pct = o.discountPercent
    const timeWindow =
      o.window.kind === "all-day" ?
        "All day"
      : `Arrive between ${o.window.start} - ${o.window.end}`

    return {
      id: `${slug}-${tabSuffix}-offer-${i}`,
      expiresAt: DEMO_OFFER_EXPIRES_FAR_FUTURE_MS,
      offerScheduleDate: tabId,
      tags: ["enabled"],
      discountPercent: pct,
      restaurantName,
      title: `Claim ${pct}% discount`,
      date: day,
      timeWindow,
      closingLine: `Offer window closes ${o.window.kind === "all-day" ? (wh.workingHoursEnd ?? "23:59") : o.window.end}`,
      remainingCount:
        o.remainingSpots != null && o.remainingSpots > 0 ?
          o.remainingSpots
        : undefined,
      restaurantImage: restaurantImageForOfferIndex(base, i),
      ...wh,
      paymentPromoText: DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT,
      ...claimTimeFieldsFromOffer(o, wh),
    }
  })

  return cards
}

/**
 * Prototype detail payload: merges search row imagery with static copy
 * aligned to the restaurant detail Figma spec.
 */
export function getRestaurantDetailDemo(slug: string): RestaurantDetailModel {
  const key = isRestaurantSlug(slug) ? slug : "neiburgs"
  const row = findRow(key) ?? findRow("neiburgs")!
  const tabs = buildOfferDateTabs(new Date(), key)
  const base = {
    primary: row.primaryImage,
    sideTop: row.sideTop,
    sideBottom: row.sideBottom,
  }
  const offersByTabId: Record<string, RestaurantOfferCardModel[]> = {}
  for (let i = 0; i < tabs.length; i++) {
    const t = tabs[i]!
    offersByTabId[t.id] =
      t.state === "no-offer"
        ? []
        : offersForDateTab(key, i, t.id as DateValue, base, row.name)
  }

  const demoAddress = DEMO_ADDRESS_BY_SLUG[key]
  const hoursUi = buildOpenHoursUiState(new Date(), RESTAURANT_WEEKLY_OPEN_HOURS)

  return {
    slug: key,
    name: row.name,
    heroImageUrl: row.primaryImage,
    logoCandidates: getRestaurantLogoCandidates(key),
    logoFallbackUrl: row.sideTop,
    isOpen: hoursUi.isOpenNow,
    closesAt: hoursUi.closesAtLabel,
    ratingValue: row.rating,
    reviewsLine: reviewsLineFromSuffix(row.reviewSuffix),
    ratingSheet: buildRatingSheet(row),
    priceRange: row.displayPrice.replace(/–/g, "-"),
    areaLabel: row.area,
    cuisineTags: row.cuisine || "European, Drinks",
    offerDateTabs: tabs,
    offersByTabId,
    benefits: [
      {
        id: "b1",
        imageUrl: "/images/benefit-discount-badge.png",
        title: "40% discount for your first 2 orders",
        subtitle: "when paying with DineOut",
      },
      {
        id: "b2",
        imageUrl: "/images/benefit-visa-10eur-badge.png",
        title: "10€ off from the bill",
        subtitle: "when paying with VISA card",
      },
    ],
    venueGalleryCycles: [
      { tall: row.primaryImage, top: row.sideTop, bottom: row.sideBottom },
      { tall: row.sideTop, top: row.primaryImage, bottom: row.sideBottom },
    ],
    openHoursSummary: hoursUi.summaryRangeToday,
    weeklyOpenHours: RESTAURANT_WEEKLY_OPEN_HOURS,
    openHoursSheetHeading: hoursUi.openHoursSheetHeading,
    openHoursSheetSubtitle: hoursUi.openHoursSheetSubtitle,
    menuRowValue: "Restaurant menu",
    menuGalleryImages: [...MENU_GALLERY_IMAGES],
    address: demoAddress,
    phone: DEMO_PHONE_BY_SLUG[key],
    about: buildRestaurantAbout(row, key, {
      isOpenNow: hoursUi.isOpenNow,
      openingHours: hoursUi.summaryRangeToday,
      address: demoAddress,
      phone: DEMO_PHONE_BY_SLUG[key],
      whatWeServe: [...DEMO_WHAT_WE_SERVE_BY_SLUG[key]],
      amenities: [...DEMO_AMENITIES_BY_SLUG[key]],
    }),
  }
}
