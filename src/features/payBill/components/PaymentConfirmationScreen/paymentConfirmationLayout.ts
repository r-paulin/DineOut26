import { readAppHeightPx } from "@/features/offers/utils/bottomSheetLayout"

/**
 * Reserved space for the absolutely-positioned nav row above the hero band.
 * Tracks `PaymentConfirmationNavbar`: `pt = max(1.5rem, safe-area-top)`,
 * close button height = 2.5rem, `pb-3` = 0.75rem.
 */
export const PAY_CONFIRM_NAV_RESERVE =
  "calc(max(1.5rem, var(--safe-area-top)) + 3.25rem)"

/** Matches PaymentConfirmationSummarySheet `max-h-[min(72vh,calc(var(--app-h)*0.72))]`. */
export function getConfirmSheetViewportCapPx(): number {
  const appH = readAppHeightPx()
  const viewportInner =
    typeof window !== "undefined" ? window.innerHeight : appH
  return Math.min(viewportInner * 0.72, appH * 0.72)
}

/** Minimum believable sheet height; below this we use a viewport fallback (Firefox pre-layout). */
export const CONFIRM_SHEET_INSET_FALLBACK_MIN_PX = 200

const CONFIRM_SHEET_INSET_FALLBACK_RATIO = 0.55

/**
 * Resolves sheet inset from measured content height, with a fallback when layout is not ready.
 */
export function resolveConfirmSheetInsetPx(
  measuredPx: number,
  viewportCapPx: number,
  appHeightPx: number,
): number {
  const inset = Math.min(measuredPx, viewportCapPx)

  if (inset < CONFIRM_SHEET_INSET_FALLBACK_MIN_PX) {
    return Math.min(
      viewportCapPx,
      Math.round(appHeightPx * CONFIRM_SHEET_INSET_FALLBACK_RATIO),
    )
  }

  return inset
}

/**
 * Pixel height reserved at the bottom for the summary sheet.
 * Uses content scroll metrics so Firefox reports a stable value before transforms settle.
 */
export function measureConfirmSheetInsetPx(sheet: HTMLElement): number {
  const viewportCap = getConfirmSheetViewportCapPx()
  const inner = sheet.querySelector<HTMLElement>("[data-confirm-sheet-body]")

  const measured = Math.max(
    sheet.offsetHeight,
    sheet.scrollHeight,
    sheet.getBoundingClientRect().height,
    inner?.offsetHeight ?? 0,
    inner?.scrollHeight ?? 0,
  )

  return resolveConfirmSheetInsetPx(measured, viewportCap, readAppHeightPx())
}

export function measureHeroHostHeightPx(heroBand: HTMLElement): number {
  const host = heroBand.parentElement
  if (!host) return readAppHeightPx()
  return host.getBoundingClientRect().height
}

export function heroBandHeightForSheetInset(
  hostHeightPx: number,
  sheetInsetPx: number,
): number {
  return Math.max(0, Math.round(hostHeightPx - sheetInsetPx))
}
