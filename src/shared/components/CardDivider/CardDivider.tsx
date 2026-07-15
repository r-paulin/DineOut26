/**
 * Kalep `Divider type="Card"` (Figma `16019:13230`) — 8px gap between white
 * section cards. The light-grey page backdrop
 * (`CARD_DIVIDER_GROOVE_BG_CLASS`) shows through; pair with rounded section
 * shells (`CARD_DIVIDER_SECTION_*_CLASS`) so each card’s corners read clearly.
 */
export function CardDivider() {
  return (
    <div
      className="pointer-events-none h-2 w-full shrink-0"
      aria-hidden
    />
  )
}
