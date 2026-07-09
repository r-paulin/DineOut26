/** e.g. `200+` → `(200+)`; catalog values already parenthesized pass through. */
export function formatReviewCountForBadge(raw?: string): string | undefined {
  const t = raw?.trim()
  if (!t) return undefined
  if (t.startsWith("(") && t.endsWith(")")) return t
  return `(${t})`
}
