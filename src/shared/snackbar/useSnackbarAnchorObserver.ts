import { useLayoutEffect, useRef } from "react"
import {
  measureMaxSnackbarAnchorInset,
  shouldUpdateSnackbarInsetPx,
} from "@/shared/snackbar/snackbarInset"

/**
 * Keeps anchor inset in sync with all `[data-snackbar-anchor]` nodes under `scope`.
 */
export function useSnackbarAnchorObserver(
  scope: HTMLElement | null,
  onInsetChange: (px: number) => void,
): void {
  const onInsetChangeRef = useRef(onInsetChange)
  onInsetChangeRef.current = onInsetChange
  const lastMeasuredRef = useRef(0)

  useLayoutEffect(() => {
    if (typeof ResizeObserver === "undefined") return

    const root = scope ?? document.documentElement
    let raf = 0

    const applyMeasured = (px: number) => {
      if (!shouldUpdateSnackbarInsetPx(lastMeasuredRef.current, px)) return
      lastMeasuredRef.current = px
      onInsetChangeRef.current(px)
    }

    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        applyMeasured(measureMaxSnackbarAnchorInset(root))
      })
    }

    applyMeasured(measureMaxSnackbarAnchorInset(root))

    const ro = new ResizeObserver(measure)
    ro.observe(root)

    const mo = new MutationObserver(measure)
    mo.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-snackbar-anchor"],
    })

    window.addEventListener("resize", measure)
    window.visualViewport?.addEventListener("resize", measure)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener("resize", measure)
      window.visualViewport?.removeEventListener("resize", measure)
    }
  }, [scope])
}
