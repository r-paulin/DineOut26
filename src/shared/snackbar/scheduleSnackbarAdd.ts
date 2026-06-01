import type { SnackbarContent, SnackbarState } from "@/shared/snackbar/snackbar.types"

/**
 * Shows a snackbar after footer anchors and `--snackbar-bottom-inset` settle.
 * Uses double `requestAnimationFrame` (same timing as PayScreen tip snackbars).
 */
export function scheduleSnackbarAdd(
  add: SnackbarState["add"],
  content: SnackbarContent,
): () => void {
  let cancelled = false
  let raf2 = 0
  const raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => {
      if (!cancelled) add(content)
    })
  })
  return () => {
    cancelled = true
    cancelAnimationFrame(raf1)
    if (raf2) cancelAnimationFrame(raf2)
  }
}
