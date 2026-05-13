/**
 * Shared weekly schedule for prototype restaurants (About, venue rows, hours sheet).
 * Ranges use an en dash (–) between times; parsed by {@link buildOpenHoursUiState}.
 *
 * @see Figma Consumer Dine-out — MODAL / Time `15888:17224`
 */
export interface RestaurantFixedOpenHoursRow {
  day: string
  /** Display range, e.g. `12:00 – 23:00` (uses an en dash). */
  range: string
}

/** One shared grid for every demo venue; Wednesday closes earlier for variety. */
export const RESTAURANT_WEEKLY_OPEN_HOURS: readonly RestaurantFixedOpenHoursRow[] =
  [
    { day: "Monday", range: "12:00 – 23:00" },
    { day: "Tuesday", range: "12:00 – 23:00" },
    { day: "Wednesday", range: "12:00 – 21:00" },
    { day: "Thursday", range: "12:00 – 23:00" },
    { day: "Friday", range: "12:00 – 23:00" },
    { day: "Saturday", range: "12:00 – 23:00" },
    { day: "Sunday", range: "12:00 – 23:00" },
  ] as const
