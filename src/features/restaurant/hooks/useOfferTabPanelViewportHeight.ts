import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefCallback,
} from "react"

/**
 * Tracks the active offer-date tabpanel's content height so a horizontal
 * pager can use `overflow: hidden` without inheriting the max height of
 * every sibling (flex row would stretch to the tallest panel).
 */
export function useOfferTabPanelViewportHeight(activeTabId: string) {
  const panelRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [height, setHeight] = useState<number | null>(null)

  const registerPanelRef = useCallback(
    (id: string): RefCallback<HTMLDivElement> => {
      return (el) => {
        if (el) panelRefs.current.set(id, el)
        else panelRefs.current.delete(id)
      }
    },
    [],
  )

  const measure = useCallback(() => {
    const el = panelRefs.current.get(activeTabId)
    if (!el) return
    setHeight(el.scrollHeight)
  }, [activeTabId])

  useLayoutEffect(() => {
    measure()
    const el = panelRefs.current.get(activeTabId)
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [activeTabId, measure])

  return { viewportHeight: height, registerPanelRef }
}
