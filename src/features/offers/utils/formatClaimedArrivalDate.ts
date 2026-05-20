/** Locale for Figma `16123:18340` date copy: "Monday, 8 May" (day before month). */
const CLAIMED_ARRIVAL_DATE_LOCALE = "en-GB"

/**
 * Figma `16123:18340` — claimed-offer date row value prefix, e.g. "Monday, 8 May".
 */
export function formatClaimedArrivalDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat(CLAIMED_ARRIVAL_DATE_LOCALE, {
    weekday: "long",
  }).format(date)
  const dayMonth = new Intl.DateTimeFormat(CLAIMED_ARRIVAL_DATE_LOCALE, {
    day: "numeric",
    month: "long",
  }).format(date)
  return `${weekday}, ${dayMonth}`
}
