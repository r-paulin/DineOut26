export type PinVariant =
  | "food"
  | "discount_red"
  | "discount_gray"
  | "discount_dark"
  | "bolt_green"
  /** Discovery map — discount pin (Figma `19206:45778`). */
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
   * Discovery pins: any timed-offer window is display-active (15m pre-start grace).
   * Omitted on non-`map_pin` markers — treat as active for icon color.
   */
  timedOfferActiveNow?: boolean
}
