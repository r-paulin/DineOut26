import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { SheetSnap } from "../offers.types"
import {
  fullSheetHeightPx,
  heightForSnap,
  readAppHeightPx,
  SHEET_HEIGHT_MIN,
  snapFromHeight,
} from "../utils/bottomSheetLayout"

export interface UseBottomSheetArgs {
  snap: SheetSnap
  onSnapChange: (snap: SheetSnap) => void
  /** Scroll “Today” carousel when a map pin focuses a restaurant (sheet visible). */
  focusRestaurantId: string | null
  onClearFocus?: () => void
  /** Increment when discover `--search-stack-height` updates so snap heights recompute. */
  discoverLayoutEpoch?: number
}

export function useBottomSheet({
  snap,
  onSnapChange,
  focusRestaurantId,
  onClearFocus,
  discoverLayoutEpoch = 0,
}: UseBottomSheetArgs) {
  const carouselTodayRef = useRef<HTMLDivElement>(null)
  const [winH, setWinH] = useState(() => readAppHeightPx())
  const dragViewportRef = useRef<{ appH: number; maxH: number }>({
    appH: winH,
    maxH: fullSheetHeightPx(winH),
  })
  const [dragging, setDragging] = useState(false)
  const dragStartClientY = useRef(0)
  const dragStartHeight = useRef(0)
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  /** When set, short tap (small vertical delta) runs this first; return true to skip default snap toggle. */
  const shortTapOverrideRef = useRef<(() => boolean) | null>(null)
  /** Snap at pointerdown — minimized skips live resize; tap / swipe release opens peek or dismisses from peek. */
  const dragStartSnapRef = useRef<SheetSnap>(snap)

  const settledHeight = useMemo(
    () => heightForSnap(snap, winH),
    [snap, winH, discoverLayoutEpoch],
  )
  const displayHeight =
    dragging && dragHeight !== null ? dragHeight : settledHeight

  useEffect(() => {
    dragViewportRef.current = {
      appH: winH,
      maxH: fullSheetHeightPx(winH),
    }
  }, [winH, discoverLayoutEpoch])

  useEffect(() => {
    const onResize = () => setWinH(readAppHeightPx())
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    if (!focusRestaurantId) return
    requestAnimationFrame(() => {
      const track = carouselTodayRef.current
      if (!track) return
      const el = Array.from(
        track.querySelectorAll<HTMLElement>("[data-restaurant]"),
      ).find((node) => node.dataset.restaurant === focusRestaurantId)
      if (el) {
        const left = el.offsetLeft - 24
        track.scrollTo({ left: Math.max(0, left), behavior: "smooth" })
      }
    })
  }, [focusRestaurantId])

  const minH = SHEET_HEIGHT_MIN

  useEffect(() => {
    if (!dragging) return

    const move = (e: PointerEvent) => {
      if (dragStartSnapRef.current === "minimized") return
      const bounds = dragViewportRef.current
      const { maxH } = bounds
      const dy = e.clientY - dragStartClientY.current
      const next = Math.round(
        Math.min(maxH, Math.max(minH, dragStartHeight.current - dy)),
      )
      setDragHeight(next)
    }

    const end = (e: PointerEvent) => {
      const bounds = dragViewportRef.current
      const { appH, maxH } = bounds
      const dy = e.clientY - dragStartClientY.current
      const startSnap = dragStartSnapRef.current
      /** Touch slop: minimized + peek need a wider band so small moves aren’t misread. */
      const tapSlopPx =
        startSnap === "minimized" || startSnap === "peek" ? 22 : 8
      if (Math.abs(dy) < tapSlopPx) {
        const override = shortTapOverrideRef.current
        shortTapOverrideRef.current = null
        if (override?.()) {
          setDragging(false)
          setDragHeight(null)
          return
        }
        if (startSnap === "minimized") onSnapChange("peek")
        else if (startSnap === "peek") {
          /** Down / neutral → dismiss to minimized; clear upward nudge → full. */
          if (dy < 0) onSnapChange("full")
          else onSnapChange("minimized")
        } else onSnapChange("peek")
      } else {
        shortTapOverrideRef.current = null
        if (startSnap === "minimized") {
          if (dy < 0) onSnapChange("peek")
        } else {
          const raw = dragStartHeight.current - dy
          const clamped = Math.min(maxH, Math.max(minH, Math.round(raw)))
          if (startSnap === "peek") {
            const peekY = heightForSnap("peek", appH)
            const band = peekY - minH
            /** Below ~40% of the peek→min band: treat as dismiss (nearest-neighbour alone needs a past-midpoint drag). */
            const dismissThreshold =
              band > 0 ? minH + band * 0.4 : peekY
            if (dy > 12 && clamped <= dismissThreshold) {
              onSnapChange("minimized")
            } else {
              onSnapChange(snapFromHeight(clamped, appH))
            }
          } else {
            onSnapChange(snapFromHeight(clamped, appH))
          }
        }
      }
      setDragging(false)
      setDragHeight(null)
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
    window.addEventListener("pointercancel", end)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
      window.removeEventListener("pointercancel", end)
    }
  }, [dragging, minH, onSnapChange])

  const beginDrag = useCallback(
    (
      e: React.PointerEvent,
      options?: { onShortTap?: () => boolean },
    ) => {
      e.preventDefault()
      dragStartSnapRef.current = snap
      shortTapOverrideRef.current = options?.onShortTap ?? null
      const appH = readAppHeightPx()
      setWinH(appH)
      dragViewportRef.current = {
        appH,
        maxH: fullSheetHeightPx(appH),
      }
      setDragging(true)
      dragStartClientY.current = e.clientY
      dragStartHeight.current = settledHeight
      setDragHeight(settledHeight)
    },
    [settledHeight, snap],
  )

  const showStickyHeader = snap === "peek"
  const showDragHandle = snap === "peek" || snap === "minimized"

  const onHeaderToggleKey = useCallback(
    (ev: React.KeyboardEvent) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault()
        if (snap === "minimized") onSnapChange("peek")
        else if (snap === "peek") onSnapChange("full")
        else onSnapChange("peek")
        onClearFocus?.()
      }
    },
    [onClearFocus, onSnapChange, snap],
  )

  return {
    carouselTodayRef,
    displayHeight,
    dragging,
    beginDrag,
    onHeaderToggleKey,
    showStickyHeader,
    showDragHandle,
  }
}
