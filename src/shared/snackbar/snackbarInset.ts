import {
  readAppHeightPx,
  readCssLengthPx,
  readNavLayoutOffsetPx,
} from "@/features/offers/utils/bottomSheetLayout"

/** Matches `--snackbar-screen-margin-bottom` in `tokens.css`. */
export const SNACKBAR_SCREEN_MARGIN_X_PX = 24
export const SNACKBAR_SCREEN_MARGIN_BOTTOM_PX = 32

export const SNACKBAR_ANCHOR_SELECTOR = "[data-snackbar-anchor]"

/** Ignore sub-pixel / layout-noise changes when updating `--snackbar-bottom-inset`. */
export const SNACKBAR_INSET_UPDATE_THRESHOLD_PX = 2

export function shouldUpdateSnackbarInsetPx(prev: number, next: number): boolean {
  if (prev === next) return false
  if (prev === 0 || next === 0) return true
  return Math.abs(next - prev) >= SNACKBAR_INSET_UPDATE_THRESHOLD_PX
}

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
  showBottomNav: boolean
}

/**
 * Minimum bottom obstruction when no footer anchor is registered.
 * Snackbars sit above the tab bar only — not above the discover bottom sheet.
 */
export function resolveSnackbarLayoutBaseline(
  input: SnackbarLayoutBaselineInput,
): number {
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
