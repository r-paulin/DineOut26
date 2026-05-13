export type RestaurantSlug =
  | "three-chefs"
  | "neiburgs"
  | "melna-bite"
  | "kolonade"
  | "max-cekot"
  | "rozengrals"

export type TimedOfferWindow =
  | { kind: "all-day" }
  | { kind: "range"; start: string; end: string }

/** One discount line for a restaurant (percent is positive, e.g. 25 for -25%). */
export interface RestaurantTimedOffer {
  discountPercent: number
  window: TimedOfferWindow
  /** Claim slots still available; drives scarcity pill on {@link RestaurantOfferCardModel.remainingCount}. */
  remainingSpots?: number
}

export type OfferTimePreset = "any" | "morning" | "lunch" | "evening"
