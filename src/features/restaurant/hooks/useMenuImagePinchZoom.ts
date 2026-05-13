import { useLayoutEffect, useRef, useState } from "react"

const MIN = 1
const MAX = 4

function touchDistance(t: TouchList): number {
  if (t.length < 2) return 0
  const a = t[0]!
  const b = t[1]!
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

/**
 * Pinch-to-zoom and ctrl+wheel zoom for a menu image wrapper (non-passive listeners).
 * When `isActive` becomes false, zoom resets so returning to a slide does not keep a stale scale.
 */
export function useMenuImagePinchZoom(isActive: boolean) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const scaleRef = useRef(1)
  const pinchBaseDist = useRef(0)
  const pinchBaseScale = useRef(1)

  useLayoutEffect(() => {
    if (!isActive) {
      queueMicrotask(() => {
        setScale(1)
      })
    }
  }, [isActive])

  useLayoutEffect(() => {
    scaleRef.current = scale
  }, [scale])

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v))

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchBaseDist.current = touchDistance(e.touches)
        pinchBaseScale.current = scaleRef.current
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchBaseDist.current > 8) {
        e.preventDefault()
        const d = touchDistance(e.touches)
        if (d <= 0) return
        const next = clamp(
          pinchBaseScale.current * (d / pinchBaseDist.current),
        )
        setScale(next)
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchBaseDist.current = 0
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08
      setScale((s) => clamp(s * factor))
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)
    el.addEventListener("touchcancel", onTouchEnd)
    el.addEventListener("wheel", onWheel, { passive: false })

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchEnd)
      el.removeEventListener("wheel", onWheel)
    }
  }, [])

  return { wrapRef, scale }
}
