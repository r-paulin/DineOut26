/**
 * Layout tokens for Figma `17459:*` (claimed offer + venue check-in gate).
 *
 * Close + footer are absolutely positioned; the scroll container reserves
 * matching space at top/bottom so they never overlap the hero or sticky CTA.
 */
export const claimedOfferLayout = {
  pagePx: "px-6",
  /** Full-page scroll (hero + light sections); only close + footer are fixed. */
  pageScroll:
    "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-special-brand-alt",
  /** Figma close — 40×40, left 16px, top 24px + safe area, elevation 1. */
  fixedClose:
    "pointer-events-auto absolute left-4 top-[max(1.5rem,var(--safe-area-top))] z-30 flex size-10 shrink-0 items-center justify-center rounded-full border-none bg-static-key-light p-0 text-static-key-dark shadow-[0px_2px_3px_rgba(0,0,0,0.16)] outline-none focus-visible:ring-2 focus-visible:ring-action-primary",
  /**
   * Dark green hero — Figma `17459:183421`: pt 64, px 24, pb 24 (visible).
   * {@link shelfFloor} overlaps by 16px (`-mt-4`), so pb is 40px here.
   */
  hero:
    "flex shrink-0 flex-col items-center gap-6 bg-special-brand-alt px-6 pb-10 pt-16 text-center [--color-content-active-action-primary-inverted:var(--content-active-action-primary-inverted)]",
  heroCopy: "flex w-full flex-col items-center gap-3",
  howItWorksRow:
    "inline-flex cursor-pointer items-center justify-center gap-1.5 border-none bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-action-primary",
  /**
   * Overlaps hero by 16px; stays transparent so `bg-special-brand-alt` shows in
   * the white shelf’s top corner radii (Figma `17459:183440`).
   */
  shelfFloor: "relative z-[1] -mt-4 flex min-h-0 flex-1 flex-col",
  /** Grouped fill below the white offer card (Figma `layer/floor-0-grouped` gap). */
  shelfFloorFill: "min-h-0 flex-1 bg-layer-floor-0-grouped",
  /**
   * White detail shelf — 16px top radius; `overflow-hidden` clips children to curve.
   */
  lightBody:
    "flex shrink-0 flex-col overflow-hidden rounded-t-[16px] bg-layer-floor-1",
  offerTitleBlock: "shrink-0 px-6 pb-3 pt-6",
  /** Figma `17459:184404` — inline PIN banner shelf. */
  pinBannerOuter: "shrink-0 px-4 pb-3",
  pinBannerInner:
    "flex flex-row items-center justify-between gap-4 rounded-[8px] bg-action-primary p-3",
  pinBannerLabel: "min-w-0 flex-1 text-left",
  pinDigitsRow: "flex shrink-0 flex-row gap-1",
  /** Figma PIN cell — 24×40, 4px radius, 4px padding. */
  pinDigit:
    "flex h-10 w-6 shrink-0 items-center justify-center rounded-[4px] bg-special-brand-alt p-1",
  offerDetailsBlock: "shrink-0",
  detailsList: "m-0 flex list-none flex-col p-0",
  /** Inset list divider — 24px horizontal padding (Figma list item separator). */
  detailRowSeparator: "px-6",
  detailRowSeparatorLine: "h-px bg-separator",
  cashbackUpsellWrap: "shrink-0 px-6 pb-3",
  disclaimer: "flex shrink-0 flex-col gap-3 px-6 pb-10 pt-6",
  /** White-body bottom reserve for fixed footer (~136px). */
  lightBodyPadWithFooter: "pb-[8.5rem]",
  lightBodyPadNoFooter: "pb-6",
  /** Sticky footer — Figma `_Screen Actions (DineOut)`. */
  stickyFooter:
    "pointer-events-auto absolute bottom-0 left-0 right-0 z-[3] flex flex-col gap-3 border-t border-separator bg-layer-floor-2 px-6 pb-[max(2rem,var(--safe-area-bottom))] pt-4",
  stickyFooterPromoRow: "flex items-center justify-center gap-1",
  stickyFooterButton: "h-14 rounded-full",
  /** Figma alert dialogs (`17475:185868`, cancel offer) — min 300px content width. */
  alertDialogContent: "mx-auto flex w-full min-w-[300px] flex-col gap-6 pb-4",
  alertDialogButtonStack: "flex w-full min-w-0 flex-col gap-2",
} as const
