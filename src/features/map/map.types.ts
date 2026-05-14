export type PinVariant =
  | "food"
  | "discount_red"
  | "discount_gray"
  | "discount_dark"
  | "bolt_green"
  /** Discovery map — Offer icon + discount pill (Figma). */
  | "map_pin"

export type MapMarkerData = {
  id: string
  lat: number
  lng: number
  variant: PinVariant
  label: string
  sublabel?: string
  discountText?: string
  restaurantId?: string
  /**
   * Discovery pins: any timed-offer window contains “now” (same as discover open-now).
   * Omitted on non-`map_pin` markers — treat as active for icon color.
   */
  timedOfferActiveNow?: boolean
}
