import { useCallback, useEffect, useRef, useState } from "react"
import type { MapMarkerData } from "@/features/map/map.types"
import type { SheetSnap } from "@/features/offers/offers.types"
import { useFilters } from "@/features/search/hooks/useFilters"
import type { DateValue } from "@/features/search/filters.types"
import { createLogger } from "@/shared/utils/logger"

const log = createLogger("discover")

export type DiscoverSectionListState = {
  title: string
}

export function useDiscoverScreen() {
  const filters = useFilters()
  const { closeSheet } = filters

  const [activeTab, setActiveTab] = useState("dineout")
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [focusRestaurantId, setFocusRestaurantId] = useState<string | null>(
    null,
  )
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>("peek")
  const [searchOpen, setSearchOpen] = useState(false)
  const [sectionList, setSectionList] = useState<DiscoverSectionListState | null>(
    null,
  )
  const [restaurantDetailSlug, setRestaurantDetailSlug] = useState<
    string | null
  >(null)
  const [restaurantDetailDate, setRestaurantDetailDate] = useState<DateValue>("today")
  const [adminPlacesOpen, setAdminPlacesOpen] = useState(false)
  /**
   * Monotonic counter that bumps each time the bottom sheet should jump back to
   * its scroll origin (e.g. when the user taps "View map"). The scroll content
   * watches this and resets `scrollTop` when the value changes.
   */
  const [scrollToTopSignal, setScrollToTopSignal] = useState(0)

  const sheetSnapRef = useRef(sheetSnap)
  useEffect(() => {
    sheetSnapRef.current = sheetSnap
  }, [sheetSnap])

  const focusRestaurantIdRef = useRef(focusRestaurantId)
  useEffect(() => {
    focusRestaurantIdRef.current = focusRestaurantId
  }, [focusRestaurantId])

  /** Sheet snap before opening the floating map card — restored when the card closes. */
  const snapBeforeMapCardRef = useRef<SheetSnap>("peek")

  const onMarkerClick = useCallback((m: MapMarkerData) => {
    snapBeforeMapCardRef.current = sheetSnapRef.current
    setSelectedMarkerId(m.id)
    setFocusRestaurantId(m.restaurantId ?? m.id)
  }, [])

  const onClearFocus = useCallback(() => {
    setFocusRestaurantId(null)
    setSelectedMarkerId(null)
    setSheetSnap(snapBeforeMapCardRef.current ?? "peek")
  }, [])

  const onMapBackgroundClick = useCallback(() => {
    const hadFocus = focusRestaurantIdRef.current != null
    setFocusRestaurantId(null)
    setSelectedMarkerId(null)
    if (hadFocus) {
      setSheetSnap(snapBeforeMapCardRef.current ?? "peek")
    } else {
      setSheetSnap("minimized")
    }
  }, [])

  const onTabChange = useCallback((id: string) => {
    setActiveTab(id)
    log.debug("tab:", id)
  }, [])

  const onViewMapFab = useCallback(() => {
    // Clear pin focus without restoring snap (onClearFocus would overwrite).
    setFocusRestaurantId(null)
    setSelectedMarkerId(null)
    setSheetSnap("peek")
    setScrollToTopSignal((s) => s + 1)
  }, [])

  /**
   * Filtered-results “View map”: caller closes the list; land on home map with
   * the sheet minimized (Figma map-first state) while filters stay applied.
   * Do not use onClearFocus — it restores the pre-card snap and undoes minimized.
   */
  const onViewFilteredMap = useCallback(() => {
    setFocusRestaurantId(null)
    setSelectedMarkerId(null)
    setSheetSnap("minimized")
    setScrollToTopSignal((s) => s + 1)
  }, [])

  const openSectionList = useCallback((payload: DiscoverSectionListState) => {
    setSearchOpen(false)
    setAdminPlacesOpen(false)
    setSectionList(payload)
  }, [])

  const closeSectionList = useCallback(() => setSectionList(null), [])

  const openRestaurantDetail = useCallback((slug: string, date?: DateValue) => {
    closeSheet()
    setSearchOpen(false)
    setSectionList(null)
    setAdminPlacesOpen(false)
    setRestaurantDetailDate(date ?? "today")
    setRestaurantDetailSlug(slug)
  }, [closeSheet])

  const closeRestaurantDetail = useCallback(() => {
    setRestaurantDetailSlug(null)
    setRestaurantDetailDate("today")
    setSheetSnap("peek")
  }, [])

  const openAdminPlaces = useCallback(() => {
    setSearchOpen(false)
    setSectionList(null)
    setRestaurantDetailSlug(null)
    setAdminPlacesOpen(true)
  }, [])

  const closeAdminPlaces = useCallback(() => {
    setAdminPlacesOpen(false)
  }, [])

  return {
    ...filters,
    activeTab,
    onTabChange,
    selectedMarkerId,
    onMarkerClick,
    onMapBackgroundClick,
    focusRestaurantId,
    onClearFocus,
    sheetSnap,
    setSheetSnap,
    searchOpen,
    setSearchOpen,
    onViewMapFab,
    onViewFilteredMap,
    scrollToTopSignal,
    sectionList,
    openSectionList,
    closeSectionList,
    restaurantDetailSlug,
    restaurantDetailDate,
    openRestaurantDetail,
    closeRestaurantDetail,
    adminPlacesOpen,
    openAdminPlaces,
    closeAdminPlaces,
  }
}
