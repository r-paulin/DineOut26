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

    /** Debounced for continuous resize (discover dock drag). */
    const measureDeferred = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        applyMeasured(measureMaxSnackbarAnchorInset(root))
      })
    }

    /** Sync when anchors mount/unmount so inset updates before the next paint. */
    const measureSync = () => {
      applyMeasured(measureMaxSnackbarAnchorInset(root))
    }

    measureSync()

    const ro = new ResizeObserver(measureDeferred)
    ro.observe(root)

    const mo = new MutationObserver(measureSync)
    mo.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-snackbar-anchor"],
    })

    window.addEventListener("resize", measureDeferred)
    window.visualViewport?.addEventListener("resize", measureDeferred)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener("resize", measureDeferred)
      window.visualViewport?.removeEventListener("resize", measureDeferred)
    }
  }, [scope])
}
