/** Figma `dimension/400` — 16px radius on Card-divider section junctions. */
export const CARD_DIVIDER_SECTION_RADIUS_PX = 16

/** Scroll / sheet backdrop behind paired white sections (Figma `layer/floor-0-grouped`). */
export const CARD_DIVIDER_GROOVE_BG_CLASS = "bg-layer-floor-0-grouped" as const

/** White section surface above or below a {@link CardDivider}. */
export const CARD_DIVIDER_SECTION_SURFACE_CLASS = "bg-layer-floor-1" as const

/** Section block ending at a Card divider — rounds the bottom edge into the groove. */
export const CARD_DIVIDER_SECTION_ABOVE_CLASS =
  `${CARD_DIVIDER_SECTION_SURFACE_CLASS} overflow-hidden rounded-b-2xl` as const

/** Section block starting after a Card divider — rounds the top edge into the groove. */
export const CARD_DIVIDER_SECTION_BELOW_CLASS =
  `${CARD_DIVIDER_SECTION_SURFACE_CLASS} overflow-hidden rounded-t-2xl` as const

/** Fully enclosed white block between two Card dividers. */
export const CARD_DIVIDER_SECTION_MIDDLE_CLASS =
  `${CARD_DIVIDER_SECTION_SURFACE_CLASS} overflow-hidden rounded-2xl` as const
