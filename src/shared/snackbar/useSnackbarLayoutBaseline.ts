import { useMemo } from "react"
import { resolveSnackbarLayoutBaseline } from "@/shared/snackbar/snackbarInset"
import { useSnackbarBottomInset } from "@/shared/snackbar/useSnackbarBottomInset"

export interface UseSnackbarLayoutBaselineArgs {
  showBottomNav: boolean
}

/**
 * Pushes tab bar / safe-area baseline onto the snackbar inset stack.
 * Footer screens should use `[data-snackbar-anchor]`; the observer takes the max of
 * anchor vs this baseline.
 */
export function useSnackbarLayoutBaseline({
  showBottomNav,
}: UseSnackbarLayoutBaselineArgs): void {
  const insetPx = useMemo(
    () => resolveSnackbarLayoutBaseline({ showBottomNav }),
    [showBottomNav],
  )

  useSnackbarBottomInset(insetPx)
}
