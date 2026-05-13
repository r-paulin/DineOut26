/**
 * Shared layout + typography for the restaurant summary strip (detail stats bar
 * and About overlap card) — Figma Consumer Dine-out 15888-16776.
 */
export const SUMMARY_COL_PAD = "px-2 py-0"

export const SUMMARY_COL_STACK = `flex min-w-0 flex-1 flex-col items-center justify-center gap-0 bg-transparent text-center ${SUMMARY_COL_PAD}`

export const SUMMARY_COL_DIVIDER =
  "border-t-0 border-r-0 border-b-0 border-l border-solid border-separator"

export const SUMMARY_VALUE_LINE = {
  fontSize: "14px",
  lineHeight: "1.125rem",
} as const

export const SUMMARY_SUBLINE =
  "block w-full min-w-0 max-w-full text-center text-[14px] leading-[1.125rem] text-secondary [font-variation-settings:'wght'_var(--font-weight-regular)] line-clamp-2 break-words"
