import { Typography } from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import ShareIosOutlined from "@bolteu/kalep-react-icons/dist/ShareIosOutlined"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

/** Figma `15886:44808` — 24px icons in 24px slots, no chrome shadow. */
const NAV_ICON_BTN =
  "inline-flex size-6 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-full border-0 bg-transparent p-0 text-primary shadow-none outline-none focus-visible:ring-2 focus-visible:ring-action-primary"

export interface RestaurantOverlayNavHeaderProps {
  onBack: () => void
  onShare?: () => void
  /** Center title (e.g. fades in while About scrolls). */
  title?: string
  titleOpacity?: number
  backAriaLabel?: string
  shareAriaLabel?: string
}

/**
 * In-panel overlay top bar — Figma Nav bar (`15886:44808`):
 * `pt max(24px, safe-area)` + inner `pt-16px`, 15px gap, 1px divider;
 * content row `px-24px` / `gap-16px` / 24px icon slots; title Body L accent.
 */
export function RestaurantOverlayNavHeader({
  onBack,
  onShare,
  title,
  titleOpacity = 1,
  backAriaLabel = "Back",
  shareAriaLabel = "Share",
}: RestaurantOverlayNavHeaderProps) {
  return (
    <header className="flex w-full shrink-0 flex-col bg-layer-floor-1 pt-[max(1.5rem,var(--safe-area-top))]">
      <div className="flex w-full shrink-0 flex-col gap-[15px] pt-4">
        <div className="flex min-h-6 w-full items-center gap-4 px-6">
          <button
            type="button"
            className={NAV_ICON_BTN}
            aria-label={backAriaLabel}
            onClick={onBack}
          >
            <ArrowLeft size="md" className="text-primary" aria-hidden />
          </button>
          <div
            className="flex min-h-6 min-w-0 flex-1 items-center justify-center overflow-hidden px-2 text-center"
            style={{ opacity: titleOpacity }}
          >
            {title ?
              <Typography
                variant="body-l-accent"
                color="primary"
                as="span"
                noWrap
                inlineStyle={{
                  fontVariationSettings: "'wght' var(--font-weight-semibold)",
                  fontFeatureSettings: FONT_FEAT,
                }}
              >
                {title}
              </Typography>
            : null}
          </div>
          {onShare ?
            <button
              type="button"
              className={NAV_ICON_BTN}
              aria-label={shareAriaLabel}
              onClick={onShare}
            >
              <ShareIosOutlined size="md" className="text-primary" aria-hidden />
            </button>
          : <span className="size-6 shrink-0" aria-hidden />}
        </div>
        <div
          className="h-px w-full shrink-0 bg-[var(--color-border-separator)]"
          aria-hidden
        />
      </div>
    </header>
  )
}
