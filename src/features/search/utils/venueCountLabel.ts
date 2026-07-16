/** Filtered results count — Figma list header; product copy uses “venues”. */
export function venueCountLabel(count: number): string {
  return count === 1 ? "1 venue" : `${count} venues`
}
