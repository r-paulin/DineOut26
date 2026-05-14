import { useLayoutEffect, useRef, useState } from "react"

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

function snapshotsEqual(
  a: VisualViewportLayoutSnapshot | null,
  b: VisualViewportLayoutSnapshot | null,
): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  return (
    a.offsetTop === b.offsetTop &&
    a.height === b.height &&
    a.overlapBottom === b.overlapBottom
  )
}

/**
 * Tracks `visualViewport` for touch layouts: shrinks full-screen shells and exposes
 * bottom overlap so fixed layers (drawers, footers) sit above the on-screen keyboard.
 */
export function useVisualViewportLayout(
  enabled: boolean,
): VisualViewportLayoutSnapshot | null {
  const [snap, setSnap] = useState<VisualViewportLayoutSnapshot | null>(() => {
    if (typeof window === "undefined" || !enabled) return null
    return readSnapshot()
  })
  const rafRef = useRef(0)
  const lastCommittedRef = useRef<VisualViewportLayoutSnapshot | null>(snap)

  useLayoutEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      lastCommittedRef.current = null
      setSnap(null)
      return
    }
    const vv = window.visualViewport
    if (!vv) {
      lastCommittedRef.current = null
      setSnap(null)
      return
    }

    const commitIfChanged = () => {
      const next = readSnapshot()
      if (snapshotsEqual(lastCommittedRef.current, next)) return
      lastCommittedRef.current = next
      setSnap(next)
    }

    const scheduleSync = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        commitIfChanged()
      })
    }

    commitIfChanged()
    vv.addEventListener("resize", scheduleSync)
    vv.addEventListener("scroll", scheduleSync)
    return () => {
      vv.removeEventListener("resize", scheduleSync)
      vv.removeEventListener("scroll", scheduleSync)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled])

  return enabled ? snap : null
}
