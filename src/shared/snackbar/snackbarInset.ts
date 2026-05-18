import {
  readAppHeightPx,
  readCssLengthPx,
  readNavLayoutOffsetPx,
} from "@/features/offers/utils/bottomSheetLayout"

/** Matches `--snackbar-screen-margin-bottom` in `tokens.css`. */
export const SNACKBAR_SCREEN_MARGIN_X_PX = 24
export const SNACKBAR_SCREEN_MARGIN_BOTTOM_PX = 32

export const SNACKBAR_ANCHOR_SELECTOR = "[data-snackbar-anchor]"

export function readSnackbarBottomInsetPx(): number {
  if (typeof document === "undefined") {
    return readNavLayoutOffsetPx()
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--snackbar-bottom-inset")
    .trim()
  if (!raw) return readNavLayoutOffsetPx()
  return readCssLengthPx(
    "--snackbar-bottom-inset",
    readNavLayoutOffsetPx(),
  )
}

export function applySnackbarBottomInsetPx(px: number): void {
  document.documentElement.style.setProperty("--snackbar-bottom-inset", `${px}px`)
}

export function clearSnackbarBottomInsetOverride(): void {
  document.documentElement.style.removeProperty("--snackbar-bottom-inset")
}

/** Distance from the bottom of the app shell to the top edge of `el` (px). */
export function measureSnackbarInsetFromElement(el: HTMLElement): number {
  const top = el.getBoundingClientRect().top
  const shell = el.closest(".__kalep")
  if (shell && typeof (shell as HTMLElement).getBoundingClientRect === "function") {
    const shellBottom = (shell as HTMLElement).getBoundingClientRect().bottom
    return Math.max(0, Math.ceil(shellBottom - top))
  }
  const viewportH = readAppHeightPx()
  return Math.max(0, Math.ceil(viewportH - top))
}

export function readSafeAreaBottomPx(): number {
  return readCssLengthPx("--safe-area-bottom", 0)
}

export interface SnackbarLayoutBaselineInput {
  discoverDockActive: boolean
  discoverDockBottomInsetPx: number | null
  showBottomNav: boolean
}

/** Minimum bottom obstruction when no footer anchor is registered. */
export function resolveSnackbarLayoutBaseline(
  input: SnackbarLayoutBaselineInput,
): number {
  if (
    input.discoverDockActive &&
    input.discoverDockBottomInsetPx != null &&
    input.discoverDockBottomInsetPx > 0
  ) {
    return input.discoverDockBottomInsetPx
  }
  if (input.showBottomNav) {
    return readNavLayoutOffsetPx()
  }
  return readSafeAreaBottomPx()
}

export function measureMaxSnackbarAnchorInset(scope: ParentNode): number {
  const anchors = scope.querySelectorAll<HTMLElement>(SNACKBAR_ANCHOR_SELECTOR)
  let max = 0
  anchors.forEach((el) => {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    max = Math.max(max, measureSnackbarInsetFromElement(el))
  })
  return max
}
