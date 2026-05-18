import {
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
} from "react"
import {
  shouldUpdateSnackbarInsetPx,
} from "@/shared/snackbar/snackbarInset"
import { SnackbarInsetContext } from "@/shared/snackbar/SnackbarInsetContext"

export interface UseSnackbarBottomInsetOptions {
  enabled?: boolean
}

/**
 * Overrides `--snackbar-bottom-inset` while mounted (stacked for nested screens).
 * Updates run in layout effect via {@link SnackbarInsetContext.replaceTop}.
 */
export function useSnackbarBottomInset(
  insetPx: number,
  options: UseSnackbarBottomInsetOptions = {},
): void {
  const { enabled = true } = options
  const ctx = useContext(SnackbarInsetContext)
  const registeredRef = useRef(false)
  const lastAppliedRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (!ctx) return

    if (!enabled) {
      if (registeredRef.current) {
        ctx.pop()
        registeredRef.current = false
        lastAppliedRef.current = null
      }
      return
    }

    const prev = lastAppliedRef.current
    if (
      registeredRef.current &&
      prev != null &&
      !shouldUpdateSnackbarInsetPx(prev, insetPx)
    ) {
      return
    }

    lastAppliedRef.current = insetPx
    if (!registeredRef.current) {
      ctx.replaceTop(insetPx)
      registeredRef.current = true
    } else {
      ctx.replaceTop(insetPx)
    }

    return () => {
      if (registeredRef.current) {
        ctx.pop()
        registeredRef.current = false
        lastAppliedRef.current = null
      }
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
  }, [anchorRef, enabled])

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
