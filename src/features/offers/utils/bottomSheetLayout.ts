import type { SheetSnap } from "../offers.types"

/** Figma HOME `BottomSheet` frame height (peek / default). */
export const SHEET_HEIGHT_PEEK = 368
/** Minimized: drag handle + sheet header (Figma discovery — no sticky row). */
export const SHEET_HEIGHT_MIN = 112

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
  return readCssLengthPx("--nav-height", 64)
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

/** Full sheet fills viewport below search stack and above nav (Figma expanded).
 * `--modal-top-gap` is not subtracted here — that inset is for overlay modals
 * only; this persistent sheet should meet the search stack with no extra gap. */
export function fullSheetHeightPx(viewportInnerH: number): number {
  return Math.max(
    SHEET_HEIGHT_MIN,
    viewportInnerH - readNavHeightPx() - readSearchStackPx(),
  )
}

export function heightForSnap(snap: SheetSnap, viewportInnerH: number): number {
  if (snap === "full") return fullSheetHeightPx(viewportInnerH)
  if (snap === "peek") return SHEET_HEIGHT_PEEK
  return SHEET_HEIGHT_MIN
}

export function snapFromHeight(h: number, viewportInnerH: number): SheetSnap {
  const full = fullSheetHeightPx(viewportInnerH)
  const peekY = SHEET_HEIGHT_PEEK
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
