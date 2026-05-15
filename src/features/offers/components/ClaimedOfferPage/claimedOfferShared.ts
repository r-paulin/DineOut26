export const ROW_ICON_CLASS = "shrink-0 text-action-primary"

export const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export const PIN_DISPLAY_STYLE = {
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
  fontSize: "56px",
  lineHeight: "72px",
  letterSpacing: "-1.232px",
} as const

export function boltRideUrl(destination: string): string {
  return `https://bolt.eu/?dropoff=${encodeURIComponent(destination)}`
}

/** Figma claimed-offer details row — e.g. "30% discount on menu". */
export function formatClaimedOfferMenuLabel(discountPercent: number): string {
  return `${discountPercent}% discount on menu`
}
