import {
  CARD_DIVIDER_GROOVE_BG_CLASS,
  CARD_DIVIDER_SECTION_LAST_CLASS,
  CARD_DIVIDER_SECTION_MIDDLE_CLASS,
} from "@/shared/components/CardDivider"

/**
 * Layout tokens for Figma `19867:37819` / `19867:38029` (claimed offer).
 *
 * Close is absolutely positioned; scroll owns hero + grey feed with white
 * Card-divider sections (same pattern as restaurant detail).
 */
export const claimedOfferLayout = {
  pagePx: "px-6",
  /** Full-page scroll (hero + grey feed); only close is fixed. */
  pageScroll:
    "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-special-brand-alt",
  /** Figma close — 40×40, left 16px, top 24px + safe area, elevation 1. */
  fixedClose:
    "pointer-events-auto absolute left-4 top-[max(1.5rem,var(--safe-area-top))] z-30 flex size-10 shrink-0 items-center justify-center rounded-full border-none bg-static-key-light p-0 text-static-key-dark shadow-[0px_2px_3px_rgba(0,0,0,0.16)] outline-none focus-visible:ring-2 focus-visible:ring-action-primary",
  /**
   * Dark green hero — Figma `19867:37821`: pt 64, px 24, pb 24 (visible).
   * {@link shelfFloor} overlaps by 16px (`-mt-4`), so pb is 40px here.
   */
  hero:
    "flex shrink-0 flex-col items-center gap-6 bg-special-brand-alt px-6 pb-10 pt-16 text-center [--color-content-active-action-primary-inverted:var(--content-active-action-primary-inverted)]",
  heroCopy: "flex w-full flex-col items-center gap-2",
  getDirectionsRow:
    "inline-flex cursor-pointer items-center justify-center gap-1.5 border-none bg-transparent p-0 no-underline outline-none focus-visible:ring-2 focus-visible:ring-action-primary",
  /** Figma Heading XS / 24 · 30 · -0.48px */
  sectionHeading:
    "m-0 p-0 text-[1.5rem] font-semibold leading-[1.875rem] tracking-[-0.03rem] text-primary [font-feature-settings:'cv03'_1,'cv04'_1,'lnum'_1,'pnum'_1] [font-variation-settings:'wght'_var(--font-weight-semibold)]",
  howToUseSection: "flex shrink-0 flex-col",
  howToUseHeading: "px-6 pb-3 pt-6",
  /** Relative stack — height owned by GSAP during check-in crossfade. */
  howToUseStep1Stack: "relative w-full shrink-0",
  /**
   * Figma list item — 16px badge↔label gap, 12px vertical padding around a
   * 32px-min content box (so a single-line row is 56px, not 48px).
   */
  howToUseStepRow: "flex min-h-14 w-full items-center gap-4 px-6 py-3",
  howToUseStepRowCheckedIn: "flex min-h-14 w-full items-start gap-4 px-6 py-3",
  howToUseStepBadge:
    "flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-primary text-static-key-light",
  howToUseCheckedInBadge: "flex size-6 shrink-0 items-center justify-center",
  /** Figma label-stack bottom slot — 6px above the PIN badge. */
  howToUseCheckedInPinSlot: "flex w-full flex-wrap items-start gap-1 pt-1.5",
  /** Figma `Ⓒ Badge` — 24px min, px 6, py 4, 4px radius, neutral-secondary fill. */
  howToUsePinBadge:
    "inline-flex min-h-6 items-center justify-center gap-1 rounded-[4px] bg-neutral-secondary px-1.5 py-1 text-primary",
  /** pb-3 is tweened to 0 with height so no ghost gap during collapse. */
  howToUseCheckInCardSlot: "box-border w-full shrink-0 overflow-hidden pb-3",
  /** Figma `20886:109497` — 12px radius, px 16, pb 20. */
  howToUseCheckInCard:
    "mx-6 flex flex-col items-start gap-0 rounded-[12px] bg-action-secondary px-4 pb-5",
  /** Figma pay card wrap — px 24, pb 24. */
  howToUsePayCardWrap: "flex shrink-0 flex-col items-start px-6 pb-6",
  howToUsePayCardEnabled:
    "flex w-full flex-col items-start rounded-[12px] bg-action-secondary px-4 pb-5 transition-[background-color] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
  howToUsePayCardDisabled:
    "flex w-full flex-col items-start rounded-[12px] bg-layer-floor-0-grouped px-4 pb-5 transition-[background-color] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
  howToUsePinRow: "flex w-full items-start justify-center gap-3 py-4",
  /** Figma PIN chip — `bg/neutral-secondary` fill on `border/separator`, 4px radius. */
  howToUsePinCode:
    "flex shrink-0 items-center justify-center rounded border border-solid border-separator bg-neutral-secondary px-3 py-0.5",
  /**
   * Grey feed under hero — Figma `19867:37828` (`layer/floor-0-grouped`).
   * `flex-1` fills leftover viewport; default `min-height: auto` so content
   * never shrinks into a nested scrollport (only {@link pageScroll} scrolls).
   * Top radius + `-mt-4` so brand-alt green shows in the corner cutouts.
   */
  shelfFloor: `relative z-[1] -mt-4 flex flex-1 flex-col rounded-t-[16px] ${CARD_DIVIDER_GROOVE_BG_CLASS}`,
  /**
   * How-to-use white card — must not shrink or `overflow-hidden` clips the pay card
   * (was showing only a green sliver under step 2).
   */
  howToUseCard: `shrink-0 ${CARD_DIVIDER_SECTION_MIDDLE_CLASS}`,
  /** Offer details + cancel + disclaimer (top radius only). */
  detailsCard: `shrink-0 ${CARD_DIVIDER_SECTION_LAST_CLASS}`,
  /** Grouped fill below the last white card (grows only if page is short). */
  shelfFloorFill: "min-h-0 flex-1 bg-layer-floor-0-grouped",
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
  /** Use border token — `bg-separator` is not a Kalep background utility. */
  detailRowSeparatorLine:
    "h-px w-full shrink-0 bg-[var(--color-border-separator)]",
  cashbackUpsellWrap: "shrink-0 px-6 pb-3",
  /** Figma `19867:37852` — pt 12, pb 40, gap 12. */
  disclaimer: "flex shrink-0 flex-col gap-3 px-6 pb-10 pt-3",
  /** Sticky footer — Figma `_Screen Actions (DineOut)`. */
  stickyFooter:
    "pointer-events-auto absolute bottom-0 left-0 right-0 z-[3] flex flex-col gap-3 border-t border-separator bg-layer-floor-2 px-6 pb-[max(2rem,var(--safe-area-bottom))] pt-4",
  stickyFooterPromoRow: "flex items-center justify-center gap-1",
  stickyFooterButton: "h-14 rounded-full",
  /** Figma alert dialogs (`17475:185868`, cancel offer) — min 300px content width. */
  alertDialogContent: "mx-auto flex w-full min-w-[300px] flex-col gap-6 pb-4",
  alertDialogButtonStack: "flex w-full min-w-0 flex-col gap-2",
} as const
