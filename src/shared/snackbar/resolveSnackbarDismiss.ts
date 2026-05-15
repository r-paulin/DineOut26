import type { SnackbarContent } from "@/shared/snackbar/snackbar.types"

export interface ResolvedSnackbarDismiss {
  showCloseButton: boolean
  swipeToDismiss: boolean
  timeoutMs: number
}

const DEFAULT_TIMEOUT_MS = 5000

/**
 * Maps {@link SnackbarContent} to dismiss UI and Sonner swipe behavior.
 * Legacy `dismissible: false` disables swipe only; close stays unless `showCloseButton: false`.
 */
export function resolveSnackbarDismiss(
  content: SnackbarContent,
): ResolvedSnackbarDismiss {
  const showCloseButton = content.showCloseButton !== false
  const swipeToDismiss =
    content.swipeToDismiss ??
    (content.dismissible === false ? false : true)

  const raw = content.timeout
  const timeoutMs =
    raw == null || raw === Number.POSITIVE_INFINITY || !Number.isFinite(raw) ?
      DEFAULT_TIMEOUT_MS
    : raw > 0 ? raw
    : DEFAULT_TIMEOUT_MS

  return { showCloseButton, swipeToDismiss, timeoutMs }
}
