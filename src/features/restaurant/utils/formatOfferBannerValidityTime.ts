/**
 * Fragment shown after `Valid: {date} ·` on offer banners — drops the verbose
 * `Arrive between` prefix so the meta line stays one line on narrow cards.
 */
export function formatOfferBannerValidityTime(timeWindow: string): string {
  const t = timeWindow.trim()
  const m = /^Arrive between\s+(.+)$/i.exec(t)
  if (m?.[1]) return m[1].trim()
  return t
}
