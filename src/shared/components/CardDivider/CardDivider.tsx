import { CARD_DIVIDER_SECTION_RADIUS_PX } from "@/shared/components/CardDivider/cardDividerLayout"

const SCOOP_FILL = "var(--layer-floor-1, #fff)"

/**
 * Kalep `Divider type="Card"` (Figma `16019:13230`) — 8px groove between white
 * sections. Pair with {@link CARD_DIVIDER_GROOVE_BG_CLASS} on the scroll parent
 * and rounded section shells (`CARD_DIVIDER_SECTION_*_CLASS`).
 */
export function CardDivider() {
  const r = CARD_DIVIDER_SECTION_RADIUS_PX

  return (
    <div
      className="pointer-events-none relative z-[1] h-2 w-full shrink-0 overflow-visible"
      aria-hidden
    >
      <div className="absolute inset-x-0 top-0 h-2 bg-layer-floor-0-grouped shadow-[inset_0_1px_0_rgba(0,45,30,0.06),inset_0_-1px_0_rgba(0,45,30,0.06)]" />
      {/* Inverse corner scoops — white caps that round the junction (Figma divider image). */}
      <span
        className="absolute left-0 top-0 block size-4 -translate-y-full"
        style={{
          background: SCOOP_FILL,
          borderBottomRightRadius: r,
        }}
      />
      <span
        className="absolute right-0 top-0 block size-4 -translate-y-full"
        style={{
          background: SCOOP_FILL,
          borderBottomLeftRadius: r,
        }}
      />
      <span
        className="absolute bottom-0 left-0 block size-4 translate-y-full"
        style={{
          background: SCOOP_FILL,
          borderTopRightRadius: r,
        }}
      />
      <span
        className="absolute bottom-0 right-0 block size-4 translate-y-full"
        style={{
          background: SCOOP_FILL,
          borderTopLeftRadius: r,
        }}
      />
    </div>
  )
}
