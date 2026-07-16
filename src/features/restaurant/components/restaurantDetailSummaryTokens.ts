/**
 * Shared layout + typography for the restaurant summary strip (detail stats bar
 * and About overlap card) — Figma `16123:18008` Feed / Data.
 */
/** Inner row only — use when the parent white card owns radius / overlap / fill. */
export const SUMMARY_BAR_ROW_CLASS =
  "box-border flex min-h-[72px] w-full items-center gap-1 px-2 pt-[20px] pb-[12px]"

/** Standalone strip: overlaps hero with top radius (when not inside a feed card shell). */
export const SUMMARY_BAR_CLASS =
  `relative z-[2] -mt-4 mx-0 ${SUMMARY_BAR_ROW_CLASS} rounded-t-[16px] bg-layer-floor-1 shadow-[0_-0.25rem_0.75rem_rgba(0,0,0,0.08)]`

/** First feed card under the hero — full 16px radius on grey page backdrop. */
export const RESTAURANT_DETAIL_FEED_TOP_CARD_CLASS =
  "relative z-[2] -mt-4 overflow-hidden rounded-[16px] bg-layer-floor-1 shadow-[0_-0.25rem_0.75rem_rgba(0,0,0,0.08)]"

/** Figma `dimension/100` — horizontal inset inside each data column. */
export const SUMMARY_COL_PAD = "px-1 py-0"

export const SUMMARY_COL_STACK = `flex min-w-0 flex-1 flex-col items-center justify-center gap-0 bg-transparent text-center ${SUMMARY_COL_PAD}`

/** Figma divider between columns — 32px tall, vertically centered in the row. */
export const SUMMARY_COL_DIVIDER_ELM = "h-8 w-px shrink-0 self-center bg-separator"

export const SUMMARY_VALUE_LINE = {
  fontSize: "var(--body-s-font-size, 0.875rem)",
  lineHeight: "var(--body-s-line-height, 1.25rem)",
} as const

export const SUMMARY_SUBLINE =
  "block w-full min-w-0 max-w-full truncate text-center text-[length:var(--body-s-font-size,0.875rem)] leading-[var(--body-s-line-height,1.25rem)] text-secondary [font-variation-settings:'wght'_var(--font-weight-regular)]"
