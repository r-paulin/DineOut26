import { useLayoutEffect, useState } from "react"

export interface VisualViewportLayoutSnapshot {
  /** Pin `top` for a `position: fixed` shell (URL bar / visual viewport offset). */
  offsetTop: number
  /** Use as `height` / `maxHeight` so flex footers stay inside the visible viewport. */
  height: number
  /** Space occluded at the bottom of the layout viewport (e.g. virtual keyboard). */
  overlapBottom: number
}

function readSnapshot(): VisualViewportLayoutSnapshot | null {
  if (typeof window === "undefined" || !window.visualViewport) return null
  const vv = window.visualViewport
  const overlapBottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
  return {
    offsetTop: vv.offsetTop,
    height: vv.height,
    overlapBottom,
  }
}

/**
 * Tracks `visualViewport` for touch layouts: shrinks full-screen shells and exposes
 * bottom overlap so fixed layers (drawers, footers) sit above the on-screen keyboard.
 */
export function useVisualViewportLayout(
  enabled: boolean,
): VisualViewportLayoutSnapshot | null {
  const [snap, setSnap] = useState<VisualViewportLayoutSnapshot | null>(() =>
    enabled ? readSnapshot() : null,
  )

  useLayoutEffect(() => {
    if (!enabled) {
      setSnap(null)
      return
    }
    const vv = window.visualViewport
    if (!vv) {
      setSnap(null)
      return
    }
    const sync = () => {
      setSnap(readSnapshot())
    }
    sync()
    vv.addEventListener("resize", sync)
    vv.addEventListener("scroll", sync)
    return () => {
      vv.removeEventListener("resize", sync)
      vv.removeEventListener("scroll", sync)
    }
  }, [enabled])

  return enabled ? snap : null
}
