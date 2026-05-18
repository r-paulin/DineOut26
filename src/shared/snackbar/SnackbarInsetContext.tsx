import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react"
import { DeviceShellContext } from "@/shared/context/deviceShellContext"
import {
  applySnackbarBottomInsetPx,
  clearSnackbarBottomInsetOverride,
} from "@/shared/snackbar/snackbarInset"
import { useSnackbarAnchorObserver } from "@/shared/snackbar/useSnackbarAnchorObserver"

export interface SnackbarInsetContextValue {
  push: (px: number) => void
  pop: () => void
  /** Update the active stack top without push/pop (legacy; prefer `data-snackbar-anchor`). */
  replaceTop: (px: number) => void
}

export const SnackbarInsetContext =
  createContext<SnackbarInsetContextValue | null>(null)

function recomputeInset(
  stack: number[],
  anchorInsetPx: number,
): void {
  const stackTop = stack.at(-1)
  const effective = Math.max(anchorInsetPx, stackTop ?? 0)
  if (effective <= 0 && stackTop == null && anchorInsetPx <= 0) {
    clearSnackbarBottomInsetOverride()
    return
  }
  applySnackbarBottomInsetPx(effective)
}

export function SnackbarInsetController({ children }: { children: ReactNode }) {
  const { portalRoot } = useContext(DeviceShellContext)
  const stackRef = useRef<number[]>([])
  const anchorInsetRef = useRef(0)

  const recompute = useCallback(() => {
    recomputeInset(stackRef.current, anchorInsetRef.current)
  }, [])

  const setAnchorInset = useCallback(
    (px: number) => {
      const prev = anchorInsetRef.current
      if (prev === px) return
      anchorInsetRef.current = px
      recompute()
    },
    [recompute],
  )

  useSnackbarAnchorObserver(portalRoot, setAnchorInset)

  const push = useCallback(
    (px: number) => {
      stackRef.current.push(px)
      recompute()
    },
    [recompute],
  )

  const pop = useCallback(() => {
    stackRef.current.pop()
    recompute()
  }, [recompute])

  const replaceTop = useCallback(
    (px: number) => {
      if (stackRef.current.length === 0) {
        stackRef.current.push(px)
      } else {
        stackRef.current[stackRef.current.length - 1] = px
      }
      recompute()
    },
    [recompute],
  )

  const value = useMemo(
    () => ({ push, pop, replaceTop }),
    [pop, push, replaceTop],
  )

  return (
    <SnackbarInsetContext.Provider value={value}>
      {children}
    </SnackbarInsetContext.Provider>
  )
}
