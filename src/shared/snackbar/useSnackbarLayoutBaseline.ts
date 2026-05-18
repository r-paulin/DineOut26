import { useMemo } from "react"
import { resolveSnackbarLayoutBaseline } from "@/shared/snackbar/snackbarInset"
import { useSnackbarBottomInset } from "@/shared/snackbar/useSnackbarBottomInset"

export interface UseSnackbarLayoutBaselineArgs {
  discoverDockActive: boolean
  discoverDockBottomInsetPx: number | null
  showBottomNav: boolean
}

/**
 * Pushes discover dock / tab bar / safe-area baseline onto the snackbar inset stack.
 * Footer screens should use `[data-snackbar-anchor]`; the observer takes the max of
 * anchor vs this baseline.
 */
export function useSnackbarLayoutBaseline({
  discoverDockActive,
  discoverDockBottomInsetPx,
  showBottomNav,
}: UseSnackbarLayoutBaselineArgs): void {
  const insetPx = useMemo(
    () =>
      resolveSnackbarLayoutBaseline({
        discoverDockActive,
        discoverDockBottomInsetPx,
        showBottomNav,
      }),
    [discoverDockActive, discoverDockBottomInsetPx, showBottomNav],
  )

  useSnackbarBottomInset(insetPx)
}
