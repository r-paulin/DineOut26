/**
 * Stands in for Kalep `Divider type="Card"` (not exported in @bolteu/kalep-react 3.5.1).
 * Full-width 8px shelf between sections (Consumer Dine-out).
 */
export function CardDivider() {
  return (
    <div
      className="pointer-events-none h-2 w-full shrink-0 bg-layer-floor-0-grouped shadow-[inset_0_1px_0_rgba(0,45,30,0.06),inset_0_-1px_0_rgba(0,45,30,0.06)]"
      aria-hidden
    />
  )
}
