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
}

export function useBottomSheet({
  snap,
  onSnapChange,
  focusRestaurantId,
  onClearFocus,
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

  const settledHeight = useMemo(() => heightForSnap(snap, winH), [snap, winH])
  const displayHeight =
    dragging && dragHeight !== null ? dragHeight : settledHeight

  useEffect(() => {
    dragViewportRef.current = {
      appH: winH,
      maxH: fullSheetHeightPx(winH),
    }
  }, [winH])

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
      if (Math.abs(dy) < 8) {
        const override = shortTapOverrideRef.current
        shortTapOverrideRef.current = null
        if (override?.()) {
          setDragging(false)
          setDragHeight(null)
          return
        }
        if (snap === "minimized") onSnapChange("peek")
        else if (snap === "peek") onSnapChange("full")
        else onSnapChange("peek")
      } else {
        shortTapOverrideRef.current = null
        const raw = dragStartHeight.current - dy
        const clamped = Math.min(maxH, Math.max(minH, Math.round(raw)))
        onSnapChange(snapFromHeight(clamped, appH))
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
  }, [dragging, minH, onSnapChange, snap])

  const beginDrag = useCallback(
    (
      e: React.PointerEvent,
      options?: { onShortTap?: () => boolean },
    ) => {
      e.preventDefault()
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
    [settledHeight],
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
