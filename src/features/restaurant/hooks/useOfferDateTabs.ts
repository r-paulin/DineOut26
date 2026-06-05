import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefCallback,
} from "react"
import type { RestaurantOfferDateTab } from "@/features/restaurant/restaurantDetail.types"

export interface UseOfferDateTabsResult {
  /** Currently visible tab id (guaranteed to exist in `tabs`). */
  activeTabId: string
  setActiveTabId: (id: string) => void
  /** Attach to the scrollable tablist container. */
  tablistRef: RefCallback<HTMLDivElement>
  /** Returns a stable ref callback per tab id. */
  registerTabRef: (id: string) => RefCallback<HTMLButtonElement>
  /** WAI-ARIA tabs keyboard handler (Arrow / Home / End). */
  onTabKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void
}

/**
 * Owns offer-date tab selection, scroll-into-view on activate, and roving-tabindex
 * keyboard navigation. Per-tab underline indicators are rendered in the section
 * (Figma `_Tab` — each column owns its own 2px bar).
 */
export function useOfferDateTabs(
  tabs: RestaurantOfferDateTab[],
): UseOfferDateTabsResult {
  const defaultId = useMemo(
    () =>
      tabs.find((t) => t.state === "active")?.id ?? tabs[0]?.id ?? "",
    [tabs],
  )

  const [activeTabId, setActiveTabId] = useState(defaultId)

  const resolvedActiveTabId =
    activeTabId && tabs.some((t) => t.id === activeTabId)
      ? activeTabId
      : defaultId

  const tablistElRef = useRef<HTMLDivElement | null>(null)
  const tabRefsMap = useRef<Map<string, HTMLButtonElement>>(new Map())
  const tabRefCallbacks = useRef<
    Map<string, RefCallback<HTMLButtonElement>>
  >(new Map())
  const firstPaintRef = useRef(true)

  useLayoutEffect(() => {
    const tab = tabRefsMap.current.get(resolvedActiveTabId)
    if (tab) {
      tab.scrollIntoView({
        behavior: firstPaintRef.current ? "auto" : "smooth",
        inline: "nearest",
        block: "nearest",
      })
    }
    firstPaintRef.current = false
  }, [resolvedActiveTabId, tabs])

  const tablistRef = useCallback<RefCallback<HTMLDivElement>>((el) => {
    tablistElRef.current = el
  }, [])

  const registerTabRef = useCallback(
    (id: string): RefCallback<HTMLButtonElement> => {
      let cb = tabRefCallbacks.current.get(id)
      if (!cb) {
        cb = (el) => {
          if (el) tabRefsMap.current.set(id, el)
          else tabRefsMap.current.delete(id)
        }
        tabRefCallbacks.current.set(id, cb)
      }
      return cb
    },
    [],
  )

  const onTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (tabs.length === 0) return
      const idx = tabs.findIndex((t) => t.id === resolvedActiveTabId)
      const nextIdx =
        e.key === "ArrowRight"
          ? (idx + 1) % tabs.length
          : e.key === "ArrowLeft"
            ? (idx - 1 + tabs.length) % tabs.length
            : e.key === "Home"
              ? 0
              : e.key === "End"
                ? tabs.length - 1
                : -1
      if (nextIdx === -1) return
      e.preventDefault()
      const next = tabs[nextIdx]
      if (!next) return
      setActiveTabId(next.id)
      tabRefsMap.current.get(next.id)?.focus()
    },
    [resolvedActiveTabId, tabs],
  )

  return {
    activeTabId: resolvedActiveTabId,
    setActiveTabId,
    tablistRef,
    registerTabRef,
    onTabKeyDown,
  }
}
