import { useLayoutEffect, useRef, useState, type RefObject } from "react"
import type { SheetSnap } from "@/features/offers/offers.types"

export interface UseDiscoverDockLayoutArgs {
  searchPanelRef: RefObject<HTMLDivElement | null>
  discoverDockRef: RefObject<HTMLDivElement | null>
  discoverDockActive: boolean
  sheetSnap: SheetSnap
}

export interface UseDiscoverDockLayoutResult {
  discoverLayoutEpoch: number
  discoverDockBottomInsetPx: number | null
}

/**
 * Measures search stack + docked bottom sheet, drives `--search-stack-height`,
 * `--discover-full-sheet-gap`, and bumps an epoch for map / sheet layout sync.
 */
export function useDiscoverDockLayout({
  searchPanelRef,
  discoverDockRef,
  discoverDockActive,
  sheetSnap,
}: UseDiscoverDockLayoutArgs): UseDiscoverDockLayoutResult {
  const [discoverLayoutEpoch, setDiscoverLayoutEpoch] = useState(0)
  const [discoverDockBottomInsetPx, setDiscoverDockBottomInsetPx] = useState<
    number | null
  >(null)
  const lastSearchStackHeightRef = useRef(0)
  const lastDockInsetRef = useRef(0)
  const lastFullGapAppliedPxRef = useRef(0)

  useLayoutEffect(() => {
    const el = searchPanelRef.current
    if (!el || typeof ResizeObserver === "undefined") return

    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height)
      if (h <= 0) return
      const prev = lastSearchStackHeightRef.current
      if (h === prev) return
      if (prev > 0) {
        lastFullGapAppliedPxRef.current = 0
        document.documentElement.style.removeProperty("--discover-full-sheet-gap")
      }
      lastSearchStackHeightRef.current = h
      document.documentElement.style.setProperty("--search-stack-height", `${h}px`)
      setDiscoverLayoutEpoch((n) => n + 1)
    }

    const ro = new ResizeObserver(apply)
    ro.observe(el)
    apply()
    return () => {
      ro.disconnect()
      lastSearchStackHeightRef.current = 0
      document.documentElement.style.removeProperty("--search-stack-height")
    }
  }, [searchPanelRef])

  useLayoutEffect(() => {
    if (!discoverDockActive) {
      setDiscoverDockBottomInsetPx(null)
      lastDockInsetRef.current = 0
      return
    }
    const el = discoverDockRef.current
    if (!el || typeof ResizeObserver === "undefined") return

    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height)
      if (h <= 0) return
      if (h === lastDockInsetRef.current) return
      lastDockInsetRef.current = h
      setDiscoverDockBottomInsetPx(h)
      setDiscoverLayoutEpoch((n) => n + 1)
    }

    const ro = new ResizeObserver(apply)
    ro.observe(el)
    apply()
    return () => {
      ro.disconnect()
      lastDockInsetRef.current = 0
      setDiscoverDockBottomInsetPx(null)
    }
  }, [discoverDockActive, discoverDockRef])

  useLayoutEffect(() => {
    if (!discoverDockActive || sheetSnap !== "full") {
      if (lastFullGapAppliedPxRef.current !== 0) {
        lastFullGapAppliedPxRef.current = 0
        document.documentElement.style.removeProperty(
          "--discover-full-sheet-gap",
        )
        setDiscoverLayoutEpoch((n) => n + 1)
      }
      return
    }
    const dock = discoverDockRef.current
    const search = searchPanelRef.current
    if (!dock || !search) return
    const sheet = dock.firstElementChild
    if (!(sheet instanceof HTMLElement)) return
    const gap =
      sheet.getBoundingClientRect().top - search.getBoundingClientRect().bottom
    const measured = gap > 1 ? Math.ceil(gap) : 0
    const next = Math.max(lastFullGapAppliedPxRef.current, measured)
    if (next === lastFullGapAppliedPxRef.current) return
    lastFullGapAppliedPxRef.current = next
    document.documentElement.style.setProperty(
      "--discover-full-sheet-gap",
      `${next}px`,
    )
    setDiscoverLayoutEpoch((n) => n + 1)
  }, [
    discoverDockActive,
    sheetSnap,
    discoverLayoutEpoch,
    discoverDockRef,
    searchPanelRef,
  ])

  useLayoutEffect(() => {
    return () => {
      document.documentElement.style.removeProperty("--discover-full-sheet-gap")
    }
  }, [])

  return { discoverLayoutEpoch, discoverDockBottomInsetPx }
}
