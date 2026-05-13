/**
 * Google Maps “search this place” URL (opens in browser / new tab).
 */
export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`
}
