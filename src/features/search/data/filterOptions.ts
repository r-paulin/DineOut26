import type { OfferValue, PriceValue } from "@/features/search/filters.types"

export interface LabeledOption<T extends string = string> {
  id: T
  label: string
}

export const OFFER_OPTIONS: LabeledOption<OfferValue>[] = [
  { id: "all", label: "All offers" },
  { id: "live", label: "Live now" },
  { id: "prebook", label: "Pre-book" },
]

export const PRICE_OPTIONS: LabeledOption<PriceValue>[] = [
  { id: "u10", label: "Under €10" },
  { id: "10-20", label: "€10–20" },
  { id: "20-35", label: "€20–35" },
  { id: "35-50", label: "€35–50" },
  { id: "50p", label: "€50+" },
]

/** Chip / sheet labels — average spend per person */
export const PRICE_CHIP_LABEL: Record<PriceValue, string> = {
  u10: "Under €10",
  "10-20": "€10–20",
  "20-35": "€20–35",
  "35-50": "€35–50",
  "50p": "€50+",
}

export const CUISINE_OPTIONS: LabeledOption[] = [
  { id: "italian", label: "Italian" },
  { id: "asian", label: "Asian" },
  { id: "japanese-sushi", label: "Japanese / Sushi" },
  { id: "burgers", label: "Burgers" },
  { id: "pizza", label: "Pizza" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "seafood", label: "Seafood" },
  { id: "steakhouse", label: "Steakhouse" },
  { id: "cafe-brunch", label: "Café / Brunch" },
  { id: "vegetarian-vegan", label: "Vegetarian / Vegan" },
  { id: "local-european", label: "Local / European" },
  { id: "indian", label: "Indian" },
  { id: "mexican", label: "Mexican" },
]

export const AMENITY_OPTIONS: LabeledOption[] = [
  { id: "outdoor-seating", label: "Outdoor seating" },
  { id: "private-dining", label: "Private dining room" },
  { id: "good-groups", label: "Good for groups" },
  { id: "good-dates", label: "Good for dates" },
  { id: "family-friendly", label: "Family friendly" },
  { id: "bar-on-site", label: "Bar on site" },
  { id: "parking-nearby", label: "Parking nearby" },
  { id: "wheelchair", label: "Wheelchair accessible" },
  { id: "reservations", label: "Accepts reservations" },
  { id: "kids-playground", label: "Kids playground" },
]
