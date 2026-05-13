/**
 * Scarcity pill above the offer title: singular copy vs "{n} left".
 */
export function formatOfferScarcityLabel(remainingCount: number): string {
  if (remainingCount === 1) return "Only 1 left"
  return `${remainingCount} left`
}
