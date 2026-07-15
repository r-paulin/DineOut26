/** Figma time ranges use an en dash with no surrounding spaces, e.g. `12:00–17:00`. */
const TIME_RANGE_DASH = "–"

function normalizeTimeRangeDash(fragment: string): string {
  return fragment.replace(/\s*[–—-]\s*/g, TIME_RANGE_DASH)
}

/**
 * Fragment shown after `{date} ·` on offer banners — drops the verbose
 * `Arrive between` prefix and normalizes the range dash (Figma `_OfferCards`).
 */
export function formatOfferBannerValidityTime(timeWindow: string): string {
  const t = timeWindow.trim()
  const m = /^Arrive between\s+(.+)$/i.exec(t)
  const fragment = m?.[1] ? m[1].trim() : t
  return normalizeTimeRangeDash(fragment)
}
