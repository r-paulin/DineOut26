/**
 * Discover / map offer list filtering from {@link FilterState}.
 *
 * **Open now (Today)** uses **timed offer windows** vs the device clock, not venue
 * building hours: `RESTAURANT_WEEKLY_OPEN_HOURS` is shared by every prototype venue,
 * so per-venue “closed” cannot be derived from that grid alone. `all-day` offers
 * count as always active. Swap to per-slug weekly hours later if the catalog grows
 * that field.
 */

import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"
import type { OfferCardModel } from "@/features/offers/offers.types"
import {
  AMENITY_OPTIONS,
  CUISINE_OPTIONS,
} from "@/features/search/data/filterOptions"
import type {
  FilterState,
  OfferValue,
  PriceValue,
} from "@/features/search/filters.types"
import type {
  RestaurantTimedOffer,
  TimedOfferWindow,
} from "@/features/offers/data/restaurantOffers.types"
import { getMergedRestaurantCatalogEntry } from "@/features/restaurants/restaurantCatalogRuntime"

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + (Number.isFinite(m) ? m : 0)
}

function offerRangeMinutes(w: TimedOfferWindow): [number, number] | null {
  if (w.kind === "all-day") return null
  return [hhmmToMinutes(w.start), hhmmToMinutes(w.end)]
}

/** Point `m` lies in half-open offer range [start, end) (same convention as {@link restaurantVisibleForPreset}). */
function minutesInOfferHalfOpen(m: number, w: TimedOfferWindow): boolean {
  if (w.kind === "all-day") return true
  const r = offerRangeMinutes(w)
  if (!r) return false
  const [a0, a1] = r
  return m >= a0 && m < a1
}

/**
 * Strict “live now” for a single window vs `now` (half-open; no pre-start grace).
 * Matches discover Live now / Open now filtering.
 */
export function isTimedOfferWindowLiveAt(now: Date, window: TimedOfferWindow): boolean {
  const m = now.getHours() * 60 + now.getMinutes()
  return minutesInOfferHalfOpen(m, window)
}

export function isTimedOfferLiveNow(
  offer: RestaurantTimedOffer,
  now: Date,
): boolean {
  return isTimedOfferWindowLiveAt(now, offer.window)
}

/** Empty-state trigger: Live now, Open now (Today), or Price — not cuisine/amenity/date alone. */
export function isDiscoverEmptyTriggerFilter(state: FilterState): boolean {
  return (
    getEffectiveOfferForDiscover(state) === "live" ||
    (state.date === "today" && state.openNow) ||
    state.price != null
  )
}

function offersActiveAtMinutes(
  offers: RestaurantTimedOffer[],
  minutesFromMidnight: number,
): boolean {
  for (const o of offers) {
    if (minutesInOfferHalfOpen(minutesFromMidnight, o.window)) return true
  }
  return false
}

/**
 * True if any timed offer for `slug` contains `now`’s local time-of-day (half-open
 * windows; `all-day` always true).
 */
export function restaurantTimedOfferActiveNow(slug: string, now: Date): boolean {
  const offers = getRestaurantOffers(slug)
  if (offers.length === 0) return false
  const m = now.getHours() * 60 + now.getMinutes()
  return offersActiveAtMinutes(offers, m)
}

/**
 * Prototype: `hhmm` is `"HH:MM"` from the arrival-time chip; overlap uses the same
 * half-open rules as “now”. Calendar date does not yet narrow which offers apply.
 */
export function restaurantTimedOfferActiveAtTime(
  slug: string,
  hhmm: string,
  _nowForDay: Date,
): boolean {
  const offers = getRestaurantOffers(slug)
  if (offers.length === 0) return false
  const m = hhmmToMinutes(hhmm)
  return offersActiveAtMinutes(offers, m)
}

/** Mirrors {@link useFilters} effective offer when date ≠ today → forced prebook. */
export function getEffectiveOfferForDiscover(state: FilterState): OfferValue {
  return state.date === "today" ? state.offer : "prebook"
}

const PRICE_BUCKET_EUR: Record<PriceValue, [number, number]> = {
  u10: [0, 10],
  "10-20": [10, 20],
  "20-35": [20, 35],
  "35-50": [35, 50],
  "50p": [50, 1_000_000],
}

function parseDisplayPriceRangeEuro(displayPrice: string): [number, number] | null {
  const normalized = displayPrice.replace(/€/g, " ").replace(/\s+/g, " ").trim()
  const nums = [...normalized.matchAll(/(\d+)/g)].map((x) => Number.parseInt(x[1]!, 10))
  if (nums.length === 0) return null
  if (nums.length === 1) return [nums[0]!, nums[0]!]
  return [Math.min(nums[0]!, nums[1]!), Math.max(nums[0]!, nums[1]!)]
}

function priceBucketMatchesSlug(slug: string, price: PriceValue): boolean {
  const entry = getMergedRestaurantCatalogEntry(slug)
  if (!entry) return false
  const band = parseDisplayPriceRangeEuro(entry.displayPrice)
  if (!band) return false
  const [rLo, rHi] = band
  const [bLo, bHi] = PRICE_BUCKET_EUR[price]
  return rLo < bHi && bLo <= rHi
}

function cuisineFilterMatches(slug: string, cuisineId: string): boolean {
  const opt = CUISINE_OPTIONS.find((o) => o.id === cuisineId)
  if (!opt) return false
  const entry = getMergedRestaurantCatalogEntry(slug)
  if (!entry) return false
  const tags = entry.tags.toLowerCase()
  const needle = opt.label.toLowerCase()
  if (tags.includes(needle)) return true
  for (const part of opt.label.split("/")) {
    const p = part.trim().toLowerCase()
    if (p && tags.includes(p)) return true
  }
  return false
}

function amenityFilterMatches(slug: string, amenityId: string): boolean {
  const opt = AMENITY_OPTIONS.find((o) => o.id === amenityId)
  if (!opt) return false
  const entry = getMergedRestaurantCatalogEntry(slug)
  if (!entry) return false
  const needle = opt.label.toLowerCase()
  for (const line of entry.amenities) {
    if (line.toLowerCase().includes(needle)) return true
  }
  for (const part of opt.label.split("/")) {
    const p = part.trim().toLowerCase()
    if (!p) continue
    for (const line of entry.amenities) {
      if (line.toLowerCase().includes(p)) return true
    }
  }
  return false
}

function offerSlug(o: OfferCardModel): string {
  return o.restaurantSlug ?? o.id
}

/**
 * Filters discover `OfferCardModel` rows after base timed-offer existence checks
 * (e.g. {@link filterOffersByTimePreset} with `"any"`).
 */
export function filterOfferCardsForDiscover(
  offers: OfferCardModel[],
  state: FilterState,
  now: Date,
): OfferCardModel[] {
  const effective = getEffectiveOfferForDiscover(state)

  return offers.filter((o) => {
    const slug = offerSlug(o)
    const timed = getRestaurantOffers(slug)
    if (timed.length === 0) return false

    if (effective === "live") {
      if (!restaurantTimedOfferActiveNow(slug, now)) return false
    }

    if (state.date === "today" && state.openNow) {
      if (!restaurantTimedOfferActiveNow(slug, now)) return false
    }

    if (state.date !== "today" && state.openAt) {
      if (!restaurantTimedOfferActiveAtTime(slug, state.openAt, now)) return false
    }

    if (state.price) {
      if (!priceBucketMatchesSlug(slug, state.price)) return false
    }

    if (state.cuisine) {
      if (!cuisineFilterMatches(slug, state.cuisine)) return false
    }

    if (state.amenity) {
      if (!amenityFilterMatches(slug, state.amenity)) return false
    }

    return true
  })
}
