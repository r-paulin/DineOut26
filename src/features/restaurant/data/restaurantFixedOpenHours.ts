/**
 * Shared weekly schedule for prototype restaurants (About, venue rows, hours sheet).
 * Ranges use an en dash (–) between times; parsed by {@link buildOpenHoursUiState}.
 *
 * @see Figma Consumer Dine-out — MODAL / Time `16643:34914` / `16643:34936`
 */
export interface RestaurantFixedOpenHoursRow {
  day: string
  /** Display range, e.g. `11:00 – 22:00`, or `Closed`. */
  range: string
}

export function isClosedDayRange(range: string): boolean {
  return range.trim().toLowerCase() === "closed"
}

/** One shared grid for every demo venue (Figma MODAL / Time). */
export const RESTAURANT_WEEKLY_OPEN_HOURS: readonly RestaurantFixedOpenHoursRow[] =
  [
    { day: "Monday", range: "Closed" },
    { day: "Tuesday", range: "11:00 – 22:00" },
    { day: "Wednesday", range: "11:00 – 21:00" },
    { day: "Thursday", range: "11:00 – 22:00" },
    { day: "Friday", range: "11:00 – 20:00" },
    { day: "Saturday", range: "Closed" },
    { day: "Sunday", range: "11:00 – 22:00" },
  ] as const
