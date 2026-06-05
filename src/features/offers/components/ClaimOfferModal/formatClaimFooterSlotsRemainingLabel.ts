/** Claim sheet footer scarcity row (Figma `_Screen Actions` / `16389:29130`). */
export function formatClaimFooterSlotsRemainingLabel(
  remainingCount: number,
): string {
  if (remainingCount === 1) return "Almost full — 1 offer left"
  return `Only ${remainingCount} offers left`
}
