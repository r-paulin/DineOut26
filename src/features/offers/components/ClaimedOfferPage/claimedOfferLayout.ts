/**
 * Layout tokens for Figma `16123:18340` (claimed offer / welcome + PIN screen).
 *
 * Close + footer are absolutely positioned; the scroll container reserves
 * matching space at top/bottom so they never overlap the hero or sticky CTA.
 */
export const claimedOfferLayout = {
  pagePx: "px-6",
  /** Full-page scroll (hero + light sections); only close + footer are fixed. */
  pageScroll:
    "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-special-brand-alt",
  fixedClose:
    "pointer-events-auto absolute left-6 top-[max(1rem,var(--safe-area-top))] z-30 flex size-10 shrink-0 items-center justify-center rounded-full border-none bg-static-key-light p-0 text-static-key-dark shadow-[0px_2px_3px_rgba(0,0,0,0.16)] outline-none focus-visible:ring-2 focus-visible:ring-action-primary",
  /**
   * Dark green hero to the top of the panel (no white safe-area strip).
   * Top padding clears the fixed close: close top + 2.5rem height + 0.5rem gap.
   */
  hero:
    "shrink-0 bg-special-brand-alt px-6 pb-10 pt-[max(3.5rem,calc(var(--safe-area-top)+3rem))]",
  heroLogoRow: "flex justify-center pb-6",
  /** Figma hero copy: centered column, dimension-300 gap. */
  heroCopy: "flex flex-col items-center gap-3 self-stretch text-center",
  pinBlock: "mt-6 flex w-full justify-center self-stretch",
  /**
   * Figma PIN card: dimension-300 padding + row gap, 8px column gap, sheet radius.
   */
  pinFrame:
    "inline-grid w-full max-w-[min(100%,20rem)] grid-cols-1 grid-rows-[repeat(3,fit-content(100%))] gap-x-2 gap-y-3 rounded-[var(--sheet-radius)] border border-positive-secondary bg-positive-secondary p-3",
  pinFrameLabel: "justify-self-stretch text-center",
  /** Figma `16144:200886` — live offer window line below PIN digits. */
  pinFrameCountdown: "justify-self-stretch text-center",
  pinDigitsRow: "flex w-full flex-wrap justify-center justify-self-stretch gap-2",
  /** Figma PIN cell — 48×56, 8px radius, brand-alt fill (`16144:200902`). */
  pinDigit:
    "flex h-14 w-12 shrink-0 items-center justify-center rounded-[8px] bg-special-brand-alt p-2.5",
  /**
   * Light body below hero — rounded top overlaps brand hero (Figma shelf).
   * `flex-1` fills short viewports (no green gap); no `min-h-0`/`overflow-hidden`
   * so content height can grow and the page scroll container scrolls.
   */
  lightBody:
    "relative z-[1] -mt-4 flex flex-1 flex-col rounded-t-[var(--sheet-radius)] bg-layer-floor-1",
  sectionHeadingPx: "px-6",
  /** Offer details block — flat list, no section title. */
  offerDetailsBlock: "shrink-0 pt-6",
  detailsList: "m-0 flex list-none flex-col p-0",
  disclaimer: "flex shrink-0 flex-col gap-3 px-6 pt-6",
  /** White-body bottom reserve for fixed pay footer (must not live on green pageScroll). */
  lightBodyPadWithFooter: "pb-[10.5rem]",
  lightBodyPadNoFooter: "pb-6",
} as const
