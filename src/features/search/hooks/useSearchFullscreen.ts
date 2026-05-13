import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { addRecentSearch, getRecentSearches } from "@/features/search/utils/recentSearches"
import type { SearchFullscreenProps } from "@/features/search/search.types"
import { createLogger } from "@/shared/utils/logger"

const log = createLogger("search")

const RESULTS_DELAY_MS = 520

export function useSearchFullscreen({
  onClose,
}: Pick<
  SearchFullscreenProps,
  "onClose"
>) {
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [recents, setRecents] = useState(() => getRecentSearches())
  const queryRef = useRef("")

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    queryRef.current = query
    const trimmed = query.trim()
    if (!trimmed) {
      startTransition(() => setShowResults(false))
      return
    }
    startTransition(() => setShowResults(false))
    const id = window.setTimeout(() => {
      if (queryRef.current.trim()) {
        startTransition(() => setShowResults(true))
      }
    }, RESULTS_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [query])

  const trimmedQuery = query.trim()
  const contentPhase: "browse" | "typingSkeleton" | "results" = !trimmedQuery
    ? "browse"
    : showResults
      ? "results"
      : "typingSkeleton"

  const refreshRecents = useCallback(() => {
    setRecents(getRecentSearches())
  }, [])

  const submitQuery = useCallback(() => {
    const q = query.trim()
    if (!q) return
    addRecentSearch(q)
    refreshRecents()
    log.debug("search submit:", q)
  }, [query, refreshRecents])

  const handleCancel = useCallback(() => {
    setQuery("")
    onClose()
  }, [onClose])

  const pickRecent = useCallback(
    (q: string) => {
      setQuery(q)
      addRecentSearch(q)
      refreshRecents()
    },
    [refreshRecents],
  )

  const pickCategory = useCallback(
    (label: string) => {
      setQuery(label)
      addRecentSearch(label)
      refreshRecents()
      log.debug("category:", label)
    },
    [refreshRecents],
  )

  const showBrowse = contentPhase === "browse"

  return {
    query,
    setQuery,
    contentPhase,
    showBrowse,
    recents,
    handleCancel,
    pickRecent,
    pickCategory,
    submitQuery,
  }
}
