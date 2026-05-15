import { useLayoutEffect } from "react"
import { measureMaxSnackbarAnchorInset } from "@/shared/snackbar/snackbarInset"

/**
 * Keeps anchor inset in sync with all `[data-snackbar-anchor]` nodes under `scope`.
 */
export function useSnackbarAnchorObserver(
  scope: HTMLElement | null,
  onInsetChange: (px: number) => void,
): void {
  useLayoutEffect(() => {
    if (typeof ResizeObserver === "undefined") return

    const root = scope ?? document.documentElement
    let raf = 0

    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        onInsetChange(measureMaxSnackbarAnchorInset(root))
      })
    }

    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(root)

    const mo = new MutationObserver(measure)
    mo.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-snackbar-anchor", "class", "style"],
    })

    window.addEventListener("resize", measure)
    window.visualViewport?.addEventListener("resize", measure)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener("resize", measure)
      window.visualViewport?.removeEventListener("resize", measure)
      onInsetChange(0)
    }
  }, [onInsetChange, scope])
}
