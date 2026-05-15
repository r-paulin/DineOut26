import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  type MutableRefObject,
  type RefObject,
} from "react"
import { SnackbarInsetContext } from "@/shared/snackbar/SnackbarInsetContext"

export interface UseSnackbarBottomInsetOptions {
  enabled?: boolean
}

/**
 * Overrides `--snackbar-bottom-inset` while mounted (stacked for nested screens).
 */
export function useSnackbarBottomInset(
  insetPx: number,
  options: UseSnackbarBottomInsetOptions = {},
): void {
  const { enabled = true } = options
  const ctx = useContext(SnackbarInsetContext)

  useEffect(() => {
    if (!enabled || !ctx) return
    ctx.push(insetPx)
    return () => {
      ctx.pop()
    }
  }, [ctx, enabled, insetPx])
}

export interface UseSnackbarBottomInsetFromElementOptions
  extends UseSnackbarBottomInsetOptions {
  /** @deprecated Global anchor observer handles measurement; kept for API compat. */
  minPx?: number
}

/**
 * Marks a footer element for the global anchor observer (`data-snackbar-anchor`).
 * Returns a callback ref — assign to the footer node (or sync via `anchorRef`).
 */
export function useSnackbarBottomInsetFromElement(
  anchorRef: RefObject<HTMLElement | null>,
  options: UseSnackbarBottomInsetFromElementOptions = {},
): (el: HTMLElement | null) => void {
  const { enabled = true } = options

  const callbackRef = useCallback(
    (el: HTMLElement | null) => {
      ;(anchorRef as MutableRefObject<HTMLElement | null>).current = el
      if (!enabled) return
      if (el) {
        el.setAttribute("data-snackbar-anchor", "")
      }
    },
    [anchorRef, enabled],
  )

  useLayoutEffect(() => {
    if (!enabled) return
    const el = anchorRef.current
    if (el) el.setAttribute("data-snackbar-anchor", "")
  })

  return callbackRef
}

/**
 * Callback ref that tags an element for snackbar inset measurement.
 */
export function useSnackbarAnchorRef<T extends HTMLElement = HTMLDivElement>(): (
  el: T | null,
) => void {
  return useCallback((el: T | null) => {
    if (el) {
      el.setAttribute("data-snackbar-anchor", "")
    }
  }, [])
}
