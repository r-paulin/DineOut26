import type { OfferTimePreset } from "@/features/offers/data/restaurantOffers.types"

export type { OfferTimePreset }

export type FilterKey =
  | "date"
  | "offer"
  | "offerTime"
  | "openNow"
  | "price"
  | "cuisine"
  | "amenity"

/** `"today"` or calendar date `YYYY-MM-DD` */
export type DateValue = "today" | string

export type OfferValue = "all" | "live" | "prebook"

export type PriceValue = "u10" | "10-20" | "20-35" | "35-50" | "50p"

export interface FilterState {
  date: DateValue
  offer: OfferValue
  /** Offer validity vs time-of-day presets (Morning / Lunch / Evening / Any time). */
  offerTimePreset: OfferTimePreset
  /** When `date === "today"`: filters to open-now places */
  openNow: boolean
  /** When `date !== "today"`: `null` = any time; `"HH:MM"` = at time */
  openAt: string | null
  price: PriceValue | null
  cuisine: string | null
  amenity: string | null
}

export function getDefaultFilterState(): FilterState {
  return {
    date: "today",
    offer: "all",
    offerTimePreset: "any",
    openNow: false,
    openAt: null,
    price: null,
    cuisine: null,
    amenity: null,
  }
}
