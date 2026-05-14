/** Same rounding as claimed-offer copy — `N%` without “off”. */
export function formatDiscountPercent(percent: number): string {
  if (!Number.isFinite(percent) || percent < 0) return "0"
  const rounded = Math.round(percent * 100) / 100
  return Number.isInteger(rounded) ?
      String(rounded)
    : String(parseFloat(rounded.toFixed(2)))
}
