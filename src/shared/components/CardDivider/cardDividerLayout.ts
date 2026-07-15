/** Figma `dimension/400` — 16px radius on white section cards over the grey page. */
export const CARD_DIVIDER_SECTION_RADIUS_PX = 16

/** Scroll / sheet backdrop behind paired white sections (Figma `layer/floor-0-grouped`). */
export const CARD_DIVIDER_GROOVE_BG_CLASS = "bg-layer-floor-0-grouped" as const

/** White section surface above or below a {@link CardDivider}. */
export const CARD_DIVIDER_SECTION_SURFACE_CLASS = "bg-layer-floor-1" as const

/**
 * White card on the grey page. Prefer {@link CARD_DIVIDER_SECTION_MIDDLE_CLASS}
 * when the block sits between gaps (full 16px radius). ABOVE/BELOW remain for
 * sheets that only round the edge facing the Card divider.
 *
 * Use arbitrary `rounded-[16px]` — Kalep’s Tailwind radius scale has no `2xl`
 * (only sm/md/lg/xl/full), so `rounded-2xl` compiles to nothing.
 */
export const CARD_DIVIDER_SECTION_ABOVE_CLASS =
  `${CARD_DIVIDER_SECTION_SURFACE_CLASS} overflow-hidden rounded-b-[16px]` as const

export const CARD_DIVIDER_SECTION_BELOW_CLASS =
  `${CARD_DIVIDER_SECTION_SURFACE_CLASS} overflow-hidden rounded-t-[16px]` as const

/** Fully rounded white card between Card dividers (or as a standalone feed block). */
export const CARD_DIVIDER_SECTION_MIDDLE_CLASS =
  `${CARD_DIVIDER_SECTION_SURFACE_CLASS} overflow-hidden rounded-[16px]` as const

/**
 * Final feed block — 16px top radius facing the grey gap above; square bottom so
 * no grey “island” shows under the page. Pair without a trailing {@link CardDivider}.
 */
export const CARD_DIVIDER_SECTION_LAST_CLASS =
  `${CARD_DIVIDER_SECTION_SURFACE_CLASS} overflow-hidden rounded-t-[16px]` as const
