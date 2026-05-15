import { useMemo } from "react"
import { readSafeAreaBottomPx, resolveSnackbarLayoutBaseline } from "@/shared/snackbar/snackbarInset"
import { useSnackbarBottomInset } from "@/shared/snackbar/useSnackbarBottomInset"

export interface UseSnackbarLayoutBaselineArgs {
  discoverDockActive: boolean
  discoverDockBottomInsetPx: number | null
  showBottomNav: boolean
  /** When true, only safe-area baseline applies (pay flow, etc.). */
  overlaysActive?: boolean
}

/**
 * Pushes discover dock / tab bar / safe-area baseline onto the snackbar inset stack.
 */
export function useSnackbarLayoutBaseline({
  discoverDockActive,
  discoverDockBottomInsetPx,
  showBottomNav,
  overlaysActive = false,
}: UseSnackbarLayoutBaselineArgs): void {
  const insetPx = useMemo(() => {
    if (overlaysActive) return readSafeAreaBottomPx()
    return resolveSnackbarLayoutBaseline({
      discoverDockActive,
      discoverDockBottomInsetPx,
      showBottomNav,
    })
  }, [
    discoverDockActive,
    discoverDockBottomInsetPx,
    overlaysActive,
    showBottomNav,
  ])

  useSnackbarBottomInset(insetPx)
}
