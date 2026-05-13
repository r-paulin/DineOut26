import type { SheetSnap } from "../offers.types"

/**
 * Legacy Figma peek height (px). Peek snap height is viewport-driven via
 * {@link peekSheetHeightPx}; this constant remains for snapshots / imports.
 */
export const SHEET_HEIGHT_PEEK = 368
/** Minimized: drag handle + sheet header (Figma discovery — no sticky row). */
export const SHEET_HEIGHT_MIN = 112

/** Minimum gap between peek and minimized snap heights (px) for drag math. */
const PEEK_MIN_CLEARANCE_ABOVE_MIN = 48

/** Resolve a CSS length from :root (may be rem) to CSS pixels. */
export function readCssLengthPx(property: string, fallback: number): number {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return fallback
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(property)
    .trim()
  if (!raw) return fallback
  if (/^-?\d+(\.\d+)?px$/.test(raw)) {
    const pxValue = Number.parseFloat(raw)
    return Number.isFinite(pxValue) && pxValue > 0 ? pxValue : fallback
  }
  if (!document.body) return fallback
  const probe = document.createElement("div")
  probe.style.cssText = `position:absolute;visibility:hidden;left:-9999px;height:${raw};width:0;margin:0;padding:0;border:0`
  document.body.appendChild(probe)
  const px = probe.offsetHeight
  document.body.removeChild(probe)
  return Number.isFinite(px) && px > 0 ? px : fallback
}

export function readNavHeightPx(): number {
  return readCssLengthPx("--nav-height", 62)
}

/** Tab bar + bottom safe area — matches fixed layers `bottom: var(--nav-layout-offset)`. */
export function readNavLayoutOffsetPx(): number {
  return readCssLengthPx("--nav-layout-offset", readNavHeightPx())
}

export function readSearchStackPx(): number {
  return readCssLengthPx("--search-stack-height", 128)
}

/** Live "app viewport" height in px. Resolves `--app-h` so the value matches
 * the device screen when wrapped (tablet/desktop) and the dynamic viewport on
 * mobile, falling back to `window.innerHeight` if the token isn't readable. */
export function readAppHeightPx(): number {
  const fallbackInnerHeight =
    typeof window === "undefined" ? 0 : window.innerHeight
  return readCssLengthPx("--app-h", fallbackInnerHeight)
}

/** Gap compensation (px) when full sheet is shorter than the space under the search stack. */
const FULL_SHEET_GAP_VAR = "--discover-full-sheet-gap"

function readFullSheetGapCompensationPx(): number {
  return readCssLengthPx(FULL_SHEET_GAP_VAR, 0)
}

/** Viewport height below search stack and above nav, without full-sheet gap tweak. */
export function baseFullSheetHeightPx(viewportInnerH: number): number {
  return Math.max(
    SHEET_HEIGHT_MIN,
    viewportInnerH - readNavLayoutOffsetPx() - readSearchStackPx(),
  )
}

/** Full sheet fills viewport below search stack and above nav (Figma expanded).
 * Optional {@link FULL_SHEET_GAP_VAR} on `:root` extends height when the sheet
 * sits below the measured search bottom (dock layout / rounding). */
export function fullSheetHeightPx(viewportInnerH: number): number {
  const gap = readFullSheetGapCompensationPx()
  return Math.max(SHEET_HEIGHT_MIN, baseFullSheetHeightPx(viewportInnerH) + gap)
}

/** Default discover peek: 60% of viewport, capped so it never exceeds flush full height. */
export function peekSheetHeightPx(viewportInnerH: number): number {
  const fullCap = baseFullSheetHeightPx(viewportInnerH)
  const target = Math.round(viewportInnerH * 0.6)
  const capped = Math.min(target, fullCap)
  const floored = Math.max(SHEET_HEIGHT_MIN + PEEK_MIN_CLEARANCE_ABOVE_MIN, capped)
  return Math.min(floored, fullCap)
}

export function heightForSnap(snap: SheetSnap, viewportInnerH: number): number {
  if (snap === "full") return fullSheetHeightPx(viewportInnerH)
  if (snap === "peek") return peekSheetHeightPx(viewportInnerH)
  return SHEET_HEIGHT_MIN
}

export function snapFromHeight(h: number, viewportInnerH: number): SheetSnap {
  const full = fullSheetHeightPx(viewportInnerH)
  const peekY = peekSheetHeightPx(viewportInnerH)
  const candidates: Array<{ snap: SheetSnap; y: number }> = [
    { snap: "minimized", y: SHEET_HEIGHT_MIN },
    { snap: "peek", y: peekY },
    { snap: "full", y: full },
  ]
  let best: SheetSnap = "peek"
  let bestD = Infinity
  for (const { snap, y } of candidates) {
    const d = Math.abs(h - y)
    if (d < bestD) {
      bestD = d
      best = snap
    }
  }
  return best
}
