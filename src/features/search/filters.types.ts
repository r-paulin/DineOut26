import {
  DEFAULT_TIME_SLOT_ID,
  type TimeSlotId,
} from "@/features/search/utils/timeSlots"

export type FilterKey =
  | "date"
  | "offer"
  | "openNow"
  | "price"
  | "cuisine"
  | "amenity"

/** `"today"` or calendar date `YYYY-MM-DD` */
export type DateValue = "today" | string

export type OfferValue = "all" | "live" | "prebook"

export type PriceValue = "u10" | "10-20" | "20-35" | "35-50" | "50p"

export type { TimeSlotId }

export interface FilterState {
  date: DateValue
  /** Combined with {@link date} via the Date and time wheel (default Anytime). */
  timeSlot: TimeSlotId
  offer: OfferValue
  /**
   * When `date === "today"`: filters to open-now places.
   * Chip is hidden for any other date.
   */
  openNow: boolean
  price: PriceValue | null
  cuisine: string | null
  amenity: string | null
}

export function getDefaultFilterState(): FilterState {
  return {
    date: "today",
    timeSlot: DEFAULT_TIME_SLOT_ID,
    offer: "all",
    openNow: false,
    price: null,
    cuisine: null,
    amenity: null,
  }
}
