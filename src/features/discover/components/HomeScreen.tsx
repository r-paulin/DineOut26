import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import {
  scheduleSnackbarAdd,
  useSnackbar,
  useSnackbarLayoutBaseline,
} from "@/shared/snackbar"
import { BottomNav } from "@/shared/components/BottomNav"
import { useDeviceShell } from "@/shared/context/useDeviceShell"
import {
  BottomSheet,
  ClaimOfferModal,
  ClaimedOfferPage,
  type ClaimedOfferPageHandle,
  ClaimOfferSuccessSheet,
  MapPlaceCardOpened,
  SectionOffersListScreen,
  claimOffer,
  findActiveClaimForRestaurant,
  findOfferCardById,
  getOffersAllRestaurants,
  getOffersDinner,
  getOffersNearYou,
  getOffersToday,
  getTimePickerConfig,
  mapOfferCardToClaimModalOffer,
} from "@/features/offers"
import {
  buildMapMarkersFromOffers,
  distanceSqFromMapCenter,
  MapViewFab,
} from "@/features/map"
import { filterOffersByTimePreset } from "@/features/offers/utils/offerCampaign"
import {
  filterOfferCardsForDiscover,
  getEffectiveOfferForDiscover,
  isDiscoverEmptyTriggerFilter,
} from "@/features/discover/utils/filterDiscoverOffers"
import { FilteredOffersFullscreen } from "@/features/discover/components/FilteredOffersFullscreen"
import { ensureOfferCardListGallery } from "@/features/offers/utils/ensureOfferCardListGallery"
import { hasActiveDiscoverFilters } from "@/features/search/utils/hasActiveDiscoverFilters"
import { ActiveOfferConflictSheet } from "@/features/offers/components/claimFlow/ActiveOfferConflictSheet"
import { removeClaimedOfferById } from "@/features/offers/utils/claimedOfferState"
import type { HomeClaimedOfferItem } from "@/features/discover/components/HomeClaimedOffersCarousel"
import {
  buildPaidOfferRecordFromClaim,
  buildPaidOfferRecordFromPaySnapshot,
  isPaidOfferPaymentDetailsAvailable,
  paidOfferRecordToClaimStub,
} from "@/features/offers/utils/buildPaidOfferRecord"
import { updateClaimedOfferPaymentMethod } from "@/features/offers/utils/updateClaimedOfferPaymentMethod"
import { checkInClaimOffer } from "@/features/offers/utils/claimOffer"
import { formatClaimedArrivalDate } from "@/features/offers/utils/formatClaimedArrivalDate"
import {
  offerWindowBaseDateFromSchedule,
  resolveScheduleYmd,
} from "@/features/offers/utils/offerScheduleLocal"
import {
  FilterSheet,
  SearchFullscreen,
  SearchPanel,
} from "@/features/search"
import { useDiscoverDockLayout } from "@/features/discover/hooks/useDiscoverDockLayout"
import { useDiscoverScreen } from "@/features/discover/hooks/useDiscoverScreen"
import { AdminPlacesScreen } from "@/features/restaurants/components/AdminPlacesScreen"
import { useRestaurantCatalogSnapshot } from "@/features/restaurants/restaurantCatalogRuntime"
import { findOfferByRestaurantId } from "@/features/offers/utils/findOfferByRestaurantId"
import { PayBillFlow } from "@/features/payBill"
import { PaymentConfirmationScreen } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationScreen"
import { createPostPaymentHomeSnackbar } from "@/features/payBill/constants/postPaymentHomeSnackbar"
import type { PayBillCompletionSnapshot, PayBillFlowEntry } from "@/features/payBill/payBill.types"
import {
  AtVenueNoClaimedOffersSheet,
  getRestaurantDetailDemo,
  RestaurantDetailScreen,
  VenueClosedSheet,
} from "@/features/restaurant"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import { Z_PAY_BILL_FLOW } from "@/features/restaurant/constants/screenLayers"
import { MapSurfaceErrorBoundary } from "./MapSurfaceErrorBoundary"
import type {
  ClaimData,
  ClaimedOffer,
  ClaimOfferModalOffer,
  PaidOfferRecord,
  PaymentMethod,
} from "@/features/offers/offers.types"
import type { UserClaim } from "@/features/restaurant/utils/offerState"
import { useModalOverlayLock } from "@/shared/hooks/useModalOverlayLock"
import {
  MOTION_REDUCED_S,
  MOTION_SHEET_SEQUENTIAL_GAP_S,
  motionReduced,
} from "@/shared/motion"

const MapLayer = lazy(() =>
  import("@/features/map/components/MapLayer").then((m) => ({
    default: m.MapLayer,
  })),
)

/**
 * Intentional filtered-list skeleton hold (iOS anti-flicker): long enough for a
 * soft shimmer pass without a sub-300ms flash. Synthetic filter apply only.
 */
const FILTERED_LIST_SKELETON_MS = 700

export function HomeScreen() {
  const {
    state: filterState,
    sheetKey,
    dateOptionRows,
    openSheet,
    closeSheet,
    applySheetValue,
    applyDateTimeFilter,
    toggleOpenNowToday,
    clearOpenNowFilter,
    resetAllFilters,
    getChipLabel,
    isChipActive,
    isChipLocked,
    openNowTrailing,
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
  } = useDiscoverScreen()

  const catalogSnapshot = useRestaurantCatalogSnapshot()
  const discoverNow = useMemo(
    () => new Date(),
    [filterState, catalogSnapshot],
  )

  const offersToday = useMemo(
    () =>
      filterOfferCardsForDiscover(
        filterOffersByTimePreset(getOffersToday(), "any"),
        filterState,
        discoverNow,
      ),
    [catalogSnapshot, filterState, discoverNow],
  )
  const offersDinner = useMemo(
    () =>
      filterOfferCardsForDiscover(
        filterOffersByTimePreset(getOffersDinner(), "any"),
        filterState,
        discoverNow,
      ),
    [catalogSnapshot, filterState, discoverNow],
  )
  const offersNearYou = useMemo(
    () =>
      filterOfferCardsForDiscover(
        filterOffersByTimePreset(getOffersNearYou(), "any"),
        filterState,
        discoverNow,
      ),
    [catalogSnapshot, filterState, discoverNow],
  )
  const offersAllRestaurants = useMemo(
    () =>
      filterOfferCardsForDiscover(
        filterOffersByTimePreset(getOffersAllRestaurants(), "any"),
        filterState,
        discoverNow,
      ),
    [catalogSnapshot, filterState, discoverNow],
  )
  const mergedDiscoverOffers = useMemo(
    () => [
      ...offersToday,
      ...offersDinner,
      ...offersNearYou,
      ...offersAllRestaurants,
    ],
    [offersToday, offersDinner, offersNearYou, offersAllRestaurants],
  )
  /**
   * Map pins keep venues that miss the selected time slot (shown grey). Other
   * filters still apply; time-slot matching only drives enabled vs closed style.
   */
  const mapDiscoverOffers = useMemo(() => {
    const stateForMap = { ...filterState, timeSlot: "any" as const }
    return [
      ...filterOfferCardsForDiscover(
        filterOffersByTimePreset(getOffersToday(), "any"),
        stateForMap,
        discoverNow,
      ),
      ...filterOfferCardsForDiscover(
        filterOffersByTimePreset(getOffersDinner(), "any"),
        stateForMap,
        discoverNow,
      ),
      ...filterOfferCardsForDiscover(
        filterOffersByTimePreset(getOffersNearYou(), "any"),
        stateForMap,
        discoverNow,
      ),
      ...filterOfferCardsForDiscover(
        filterOffersByTimePreset(getOffersAllRestaurants(), "any"),
        stateForMap,
        discoverNow,
      ),
    ]
  }, [catalogSnapshot, filterState, discoverNow])
  /**
   * Deduped list rows for the filtered fullscreen. Prefer “All restaurants”
   * XL cards (multi-image galleries) over single-image carousel rows.
   */
  const filteredListOffers = useMemo(() => {
    const ordered = [
      ...offersAllRestaurants,
      ...offersToday,
      ...offersDinner,
      ...offersNearYou,
    ]
    const seen = new Set<string>()
    const rows: ReturnType<typeof ensureOfferCardListGallery>[] = []
    for (const o of ordered) {
      const slug = o.restaurantSlug ?? o.id
      if (seen.has(slug)) continue
      seen.add(slug)
      rows.push(ensureOfferCardListGallery(o))
    }
    return rows
  }, [offersAllRestaurants, offersToday, offersDinner, offersNearYou])
  const liveNowFilter =
    getEffectiveOfferForDiscover(filterState) === "live"
  const showFilteredEmpty =
    mergedDiscoverOffers.length === 0 &&
    isDiscoverEmptyTriggerFilter(filterState)
  const mapMarkers = useMemo(
    () =>
      buildMapMarkersFromOffers(mapDiscoverOffers, filterState.timeSlot),
    [mapDiscoverOffers, filterState.timeSlot],
  )
  const focusedOffer = useMemo(
    () => findOfferByRestaurantId(mapDiscoverOffers, focusRestaurantId),
    [mapDiscoverOffers, focusRestaurantId],
  )
  const mapPlaceOpen = Boolean(focusRestaurantId && focusedOffer)
  const [mapPlaceCardFilterPending, setMapPlaceCardFilterPending] =
    useState(false)
  const [filteredListOpen, setFilteredListOpen] = useState(false)
  const [filteredListLoading, setFilteredListLoading] = useState(false)
  const [filterApplyEpoch, setFilterApplyEpoch] = useState(0)
  const filteredLoadTimerRef = useRef<number | null>(null)

  const bumpFilteredListLoading = useCallback(() => {
    setFilteredListLoading(true)
    if (filteredLoadTimerRef.current != null) {
      window.clearTimeout(filteredLoadTimerRef.current)
    }
    filteredLoadTimerRef.current = window.setTimeout(() => {
      setFilteredListLoading(false)
      filteredLoadTimerRef.current = null
    }, FILTERED_LIST_SKELETON_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (filteredLoadTimerRef.current != null) {
        window.clearTimeout(filteredLoadTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (filterApplyEpoch === 0) return
    // Open + skeleton on apply when filters are active. Clear/Reset keeps the
    // expanded list open (exit via View map / search / venue).
    if (hasActiveDiscoverFilters(filterState)) {
      setFilteredListOpen(true)
      bumpFilteredListLoading()
    } else if (filteredListOpen) {
      bumpFilteredListLoading()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- epoch gates; filterState from that commit
  }, [bumpFilteredListLoading, filterApplyEpoch])

  const runWithMapPlaceCardFilterSkeleton = useCallback((work: () => void) => {
    setMapPlaceCardFilterPending(true)
    work()
    queueMicrotask(() => {
      window.setTimeout(() => setMapPlaceCardFilterPending(false), 320)
    })
  }, [])

  const markFilterApplied = useCallback(() => {
    setFilterApplyEpoch((n) => n + 1)
  }, [])

  const applySheetValueWithSkeleton = useCallback(
    (...args: Parameters<typeof applySheetValue>) => {
      runWithMapPlaceCardFilterSkeleton(() => {
        applySheetValue(...args)
        markFilterApplied()
      })
    },
    [applySheetValue, markFilterApplied, runWithMapPlaceCardFilterSkeleton],
  )

  const applyDateTimeFilterWithSkeleton = useCallback(
    (
      date: Parameters<typeof applyDateTimeFilter>[0],
      timeSlot: Parameters<typeof applyDateTimeFilter>[1],
    ) => {
      if (filterState.date === date && filterState.timeSlot === timeSlot) {
        applyDateTimeFilter(date, timeSlot)
        return
      }
      runWithMapPlaceCardFilterSkeleton(() => {
        applyDateTimeFilter(date, timeSlot)
        markFilterApplied()
      })
    },
    [
      applyDateTimeFilter,
      filterState.date,
      filterState.timeSlot,
      markFilterApplied,
      runWithMapPlaceCardFilterSkeleton,
    ],
  )

  const toggleOpenNowTodayWithSkeleton = useCallback(() => {
    runWithMapPlaceCardFilterSkeleton(() => {
      toggleOpenNowToday()
      markFilterApplied()
    })
  }, [
    markFilterApplied,
    runWithMapPlaceCardFilterSkeleton,
    toggleOpenNowToday,
  ])

  const clearOpenNowFilterWithSkeleton = useCallback(() => {
    runWithMapPlaceCardFilterSkeleton(() => {
      clearOpenNowFilter()
      markFilterApplied()
    })
  }, [
    clearOpenNowFilter,
    markFilterApplied,
    runWithMapPlaceCardFilterSkeleton,
  ])

  const resetAllFiltersWithSkeleton = useCallback(() => {
    runWithMapPlaceCardFilterSkeleton(() => {
      resetAllFilters()
      markFilterApplied()
    })
  }, [
    markFilterApplied,
    resetAllFilters,
    runWithMapPlaceCardFilterSkeleton,
  ])

  const closeFilteredList = useCallback(() => {
    setFilteredListOpen(false)
    setFilteredListLoading(false)
  }, [])

  useEffect(() => {
    if (!focusRestaurantId) return
    if (!findOfferByRestaurantId(mapDiscoverOffers, focusRestaurantId)) {
      onClearFocus()
    }
  }, [focusRestaurantId, mapDiscoverOffers, onClearFocus])

  const mapCardOverlayRef = useRef<HTMLDivElement>(null)
  const [measuredMapFloatingOverlayPx, setMeasuredMapFloatingOverlayPx] =
    useState(0)
  /** Resolved offer for {@link ClaimOfferModal}; avoids re-looking up by id (can fail across demo rebuilds). */
  const [pendingClaimOffer, setPendingClaimOffer] =
    useState<ClaimOfferModalOffer | null>(null)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const pendingPostClaimSuccessRef = useRef<ClaimedOffer | null>(null)
  const claimModalExitHandledRef = useRef(false)
  const [activeOfferConflict, setActiveOfferConflict] = useState<{
    blocking: ClaimedOffer
    pendingOffer: ClaimOfferModalOffer
    pendingClaimData: ClaimData
  } | null>(null)
  const [postClaimSuccess, setPostClaimSuccess] = useState<ClaimedOffer | null>(
    null,
  )
  const postClaimSuccessTimerRef = useRef<number | null>(null)
  const clearScheduledPostClaimSuccess = useCallback(() => {
    if (postClaimSuccessTimerRef.current != null) {
      window.clearTimeout(postClaimSuccessTimerRef.current)
      postClaimSuccessTimerRef.current = null
    }
  }, [])

  const dismissPostClaimSuccess = useCallback(() => {
    clearScheduledPostClaimSuccess()
    setPostClaimSuccess(null)
  }, [clearScheduledPostClaimSuccess])

  /** iOS-style sequential sheets: animate claim modal out, then present success. */
  const schedulePostClaimSuccess = useCallback(
    (claimed: ClaimedOffer) => {
      clearScheduledPostClaimSuccess()
      pendingPostClaimSuccessRef.current = claimed
      setClaimModalOpen(false)
    },
    [clearScheduledPostClaimSuccess],
  )

  const dismissClaimModalImmediate = useCallback(() => {
    pendingPostClaimSuccessRef.current = null
    clearScheduledPostClaimSuccess()
    setClaimModalOpen(false)
    setPendingClaimOffer(null)
  }, [clearScheduledPostClaimSuccess])

  const handleClaimModalExitComplete = useCallback(() => {
    if (claimModalExitHandledRef.current) return
    claimModalExitHandledRef.current = true

    const claimed = pendingPostClaimSuccessRef.current
    if (claimed) {
      pendingPostClaimSuccessRef.current = null
      setPendingClaimOffer(null)
      const delayMs = Math.round(
        (motionReduced() ? MOTION_REDUCED_S : MOTION_SHEET_SEQUENTIAL_GAP_S) *
          1000,
      )
      postClaimSuccessTimerRef.current = window.setTimeout(() => {
        postClaimSuccessTimerRef.current = null
        setPostClaimSuccess(claimed)
      }, delayMs)
      return
    }

    setPendingClaimOffer(null)
  }, [clearScheduledPostClaimSuccess])

  useEffect(() => {
    if (claimModalOpen) claimModalExitHandledRef.current = false
  }, [claimModalOpen])

  useEffect(
    () => () => {
      clearScheduledPostClaimSuccess()
    },
    [clearScheduledPostClaimSuccess],
  )

  const [claimedByOfferId, setClaimedByOfferId] = useState<
    Record<string, ClaimedOffer>
  >({})
  const [paidByOfferId, setPaidByOfferId] = useState<
    Record<string, PaidOfferRecord>
  >({})
  const [paidConfirmationOfferId, setPaidConfirmationOfferId] = useState<
    string | null
  >(null)
  const [claimedView, setClaimedView] = useState<ClaimedOffer | null>(null)
  const [payBillEntry, setPayBillEntry] = useState<PayBillFlowEntry | null>(null)
  const [atVenueNoClaimPayInfoOpen, setAtVenueNoClaimPayInfoOpen] = useState(false)
  const [venueClosedSheetOpen, setVenueClosedSheetOpen] = useState(false)
  const [pendingAtVenuePayBillEntry, setPendingAtVenuePayBillEntry] =
    useState<PayBillFlowEntry | null>(null)
  const continueAtVenuePayAfterCloseRef = useRef(false)
  const pendingPayBillEntryFromClaimRef = useRef<PayBillFlowEntry | null>(null)
  const claimedOfferPageRef = useRef<ClaimedOfferPageHandle>(null)
  const { portalRoot } = useDeviceShell()
  const snackbar = useSnackbar()

  const baseRestaurantDetail = useMemo(
    () =>
      restaurantDetailSlug ?
        getRestaurantDetailDemo(restaurantDetailSlug)
      : null,
    [restaurantDetailSlug, catalogSnapshot],
  )

  const restaurantDetailModel = baseRestaurantDetail

  const userClaims: readonly UserClaim[] = useMemo(() => {
    const now = new Date()
    return Object.values(claimedByOfferId).map((c) => {
      let scheduleYmd = c.offerScheduleYmd
      if (scheduleYmd == null) {
        const model = getRestaurantDetailDemo(c.restaurantSlug)
        const card = findOfferCardById(model, c.offerId)
        if (card?.offerScheduleDate != null) {
          scheduleYmd = resolveScheduleYmd(card.offerScheduleDate, now)
        }
      }
      return {
        offerId: c.offerId,
        claimedAt: c.claimedAt,
        scheduleYmd,
      }
    })
  }, [claimedByOfferId, catalogSnapshot])

  const homeClaimedOffers = useMemo((): HomeClaimedOfferItem[] => {
    const sorted = Object.values(claimedByOfferId).sort((a, b) => {
      const dist =
        distanceSqFromMapCenter(a.restaurantSlug) -
        distanceSqFromMapCenter(b.restaurantSlug)
      if (dist !== 0) return dist
      return b.claimedAt - a.claimedAt
    })
    return sorted.flatMap((claim): HomeClaimedOfferItem[] => {
      const model = getRestaurantDetailDemo(claim.restaurantSlug)
      const card = findOfferCardById(model, claim.offerId)
      if (!card) return []
      return [
        {
          offer: {
            ...card,
            restaurantName: card.restaurantName ?? model.name,
          },
          venueSlug: claim.restaurantSlug,
          claim,
        },
      ]
    })
  }, [claimedByOfferId, catalogSnapshot])

  const openClaimedOfferPage = useCallback(
    (claim: ClaimedOffer) => {
      closeSectionList()
      setSearchOpen(false)
      dismissClaimModalImmediate()
      dismissPostClaimSuccess()
      setClaimedView(claim)
    },
    [closeSectionList, dismissClaimModalImmediate, dismissPostClaimSuccess, setSearchOpen],
  )

  /** Claimed offer over an open or newly opened restaurant detail (chip, pay bill, etc.). */
  const openClaimedOfferDetails = useCallback(
    (claim: ClaimedOffer) => {
      openRestaurantDetail(claim.restaurantSlug)
      openClaimedOfferPage(claim)
    },
    [openClaimedOfferPage, openRestaurantDetail],
  )

  const handleHomeClaimedOfferPress = useCallback(
    (claim: ClaimedOffer) => {
      setClaimedView(null)
      dismissClaimModalImmediate()
      dismissPostClaimSuccess()
      openRestaurantDetail(claim.restaurantSlug)
    },
    [dismissClaimModalImmediate, dismissPostClaimSuccess, openRestaurantDetail],
  )

  const handleDiscoverRestaurantPress = useCallback(
    (slug: string) => {
      setClaimedView(null)
      dismissClaimModalImmediate()
      dismissPostClaimSuccess()
      openRestaurantDetail(slug, filterState.date)
    },
    [
      dismissClaimModalImmediate,
      dismissPostClaimSuccess,
      filterState.date,
      openRestaurantDetail,
    ],
  )

  const claimedOfferPageRestaurant = useMemo(() => {
    if (!claimedView) return null
    const d = getRestaurantDetailDemo(claimedView.restaurantSlug)
    return { name: d.name }
  }, [claimedView, catalogSnapshot])

  useLayoutEffect(() => {
    if (!mapPlaceOpen) return
    const el = mapCardOverlayRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const measure = () => {
      const h = el.getBoundingClientRect().height
      setMeasuredMapFloatingOverlayPx(h > 0 ? Math.ceil(h) : 0)
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mapPlaceOpen, focusedOffer?.id])
  const mapFloatingOverlayPx = mapPlaceOpen ? measuredMapFloatingOverlayPx : 0

  const searchPanelRef = useRef<HTMLDivElement>(null)
  const discoverDockRef = useRef<HTMLDivElement>(null)

  const beginClaimOfferFlow = useCallback(
    (id: string) => {
      if (!restaurantDetailSlug || !baseRestaurantDetail) {
        snackbar.add({
          description: "Something went wrong. Try again.",
          timeout: 4000,
        })
        return
      }
      const card = findOfferCardById(baseRestaurantDetail, id)
      if (!card) {
        snackbar.add({
          description: "Could not find this offer. Try again.",
          timeout: 4000,
        })
        return
      }
      const scheduleOpts =
        card.offerScheduleDate != null ?
          { offerScheduleDate: card.offerScheduleDate }
        : undefined
      const cfg = getTimePickerConfig(
        {
          isAllDay: Boolean(card.isAllDay),
          offerStart: card.offerStart ?? "12:00",
          offerEnd: card.offerEnd ?? "23:00",
          workingHoursStart: card.workingHoursStart ?? "12:00",
          workingHoursEnd: card.workingHoursEnd ?? "23:00",
        },
        new Date(),
        scheduleOpts,
      )
      if (cfg.mode === "slots" && (!cfg.slots || cfg.slots.length === 0)) {
        snackbar.add({
          description: "This offer is no longer available to claim.",
          timeout: 4000,
        })
        return
      }
      clearScheduledPostClaimSuccess()
      pendingPostClaimSuccessRef.current = null
      setPendingClaimOffer(mapOfferCardToClaimModalOffer(card))
      setClaimModalOpen(true)
    },
    [baseRestaurantDetail, clearScheduledPostClaimSuccess, restaurantDetailSlug, snackbar],
  )

  const completeClaim = useCallback(
    (data: ClaimData, card: RestaurantOfferCardModel) => {
      if (!restaurantDetailSlug) return
      const now = new Date()
      const baseDate =
        offerWindowBaseDateFromSchedule(card.offerScheduleDate, now) ?? now
      const claimed = claimOffer({
        ...data,
        offerId: card.id,
        restaurantSlug: restaurantDetailSlug,
        discountPercent: card.discountPercent,
        arrivalDateLabel: formatClaimedArrivalDate(baseDate),
        promoText: card.paymentPromoText,
        minOrderEur: card.minOrderEur,
        maxSavingEur: card.maxSavingEur,
        isAllDay: Boolean(card.isAllDay),
        workingHoursEnd: card.workingHoursEnd ?? "23:00",
        offerStart: card.isAllDay ? undefined : card.offerStart,
        offerEnd:
          card.isAllDay ? (card.workingHoursEnd ?? "23:00") : (card.offerEnd ?? "23:00"),
        offerWindowBaseDate: baseDate,
        offerScheduleYmd:
          card.offerScheduleDate != null ?
            resolveScheduleYmd(card.offerScheduleDate, now)
          : undefined,
      })
      setClaimedByOfferId((prev) => ({ ...prev, [card.id]: claimed }))
      schedulePostClaimSuccess(claimed)
    },
    [restaurantDetailSlug, schedulePostClaimSuccess],
  )

  const handleOfferAvailablePress = useCallback(
    (id: string) => {
      if (!restaurantDetailSlug || !baseRestaurantDetail) {
        snackbar.add({
          description: "Something went wrong. Try again.",
          timeout: 4000,
        })
        return
      }
      const card = findOfferCardById(baseRestaurantDetail, id)
      if (!card) {
        snackbar.add({
          description: "Could not find this offer. Try again.",
          timeout: 4000,
        })
        return
      }
      beginClaimOfferFlow(id)
    },
    [baseRestaurantDetail, beginClaimOfferFlow, restaurantDetailSlug, snackbar],
  )

  const handleClaimed = useCallback(
    (data: ClaimData) => {
      if (!pendingClaimOffer || !baseRestaurantDetail) return
      const card = findOfferCardById(baseRestaurantDetail, pendingClaimOffer.id)
      if (!card) {
        snackbar.add({
          description: "Could not complete claim. Try again.",
          timeout: 4000,
        })
        return
      }
      completeClaim(data, card)
    },
    [baseRestaurantDetail, completeClaim, pendingClaimOffer, snackbar],
  )

  const handleClaimConflict = useCallback(
    (blocking: ClaimedOffer, claimData: ClaimData) => {
      if (!pendingClaimOffer) return
      setActiveOfferConflict({
        blocking,
        pendingOffer: pendingClaimOffer,
        pendingClaimData: claimData,
      })
    },
    [pendingClaimOffer],
  )

  const blockingConflictRestaurantName = useMemo(() => {
    if (!activeOfferConflict) return ""
    const model = getRestaurantDetailDemo(activeOfferConflict.blocking.restaurantSlug)
    return model.name
  }, [activeOfferConflict, catalogSnapshot])

  const handleConflictCancelBlockingOffer = useCallback(() => {
    if (!activeOfferConflict || !baseRestaurantDetail) return
    const { blocking, pendingOffer, pendingClaimData } = activeOfferConflict
    setClaimedByOfferId((prev) => removeClaimedOfferById(prev, blocking.offerId))
    setActiveOfferConflict(null)
    const card = findOfferCardById(baseRestaurantDetail, pendingOffer.id)
    if (!card) {
      snackbar.add({
        description: "Could not complete claim. Try again.",
        timeout: 4000,
      })
      return
    }
    completeClaim(pendingClaimData, card)
  }, [activeOfferConflict, baseRestaurantDetail, completeClaim, snackbar])

  const handlePostClaimSuccessDone = useCallback(() => {
    dismissPostClaimSuccess()
  }, [dismissPostClaimSuccess])

  const handleClaimedOfferClose = useCallback(() => {
    setClaimedView(null)
  }, [])

  const dismissClaimedViewAnimated = useCallback(
    (after?: () => void) => {
      if (!claimedView) {
        after?.()
        return
      }
      const dismiss = claimedOfferPageRef.current?.dismissAnimated
      if (dismiss) {
        dismiss(() => {
          setClaimedView(null)
          after?.()
        })
        return
      }
      setClaimedView(null)
      after?.()
    },
    [claimedView],
  )

  const handleCancelClaimedOffer = useCallback(
    (offerId: string) => {
      setClaimedByOfferId((prev) => removeClaimedOfferById(prev, offerId))
      setClaimedView(null)
      dismissClaimModalImmediate()
      dismissPostClaimSuccess()
      closeRestaurantDetail()
    },
    [closeRestaurantDetail, dismissClaimModalImmediate, dismissPostClaimSuccess],
  )

  const handlePayFromClaimedOfferPrepare = useCallback(() => {
    if (!claimedView?.checkedInAt) return
    const claim = claimedView
    const detail = getRestaurantDetailDemo(claim.restaurantSlug)
    pendingPayBillEntryFromClaimRef.current = {
      restaurantName: detail.name,
      restaurantSlug: claim.restaurantSlug,
      offer: claim,
    }
  }, [claimedView, catalogSnapshot])

  const handleCheckInClaimedOffer = useCallback(
    (offerId: string) => {
      if (!claimedView || claimedView.offerId !== offerId) return
      const checkedIn = checkInClaimOffer(claimedView)
      setClaimedView(checkedIn)
      setClaimedByOfferId((prev) => {
        const current = prev[offerId]
        if (!current) return prev
        return { ...prev, [offerId]: checkInClaimOffer(current) }
      })
    },
    [claimedView],
  )

  const handlePayFromClaimedOfferComplete = useCallback(() => {
    const entry = pendingPayBillEntryFromClaimRef.current
    pendingPayBillEntryFromClaimRef.current = null
    setClaimedView(null)
    if (entry) setPayBillEntry(entry)
  }, [])

  const handleOpenPayBill = useCallback(() => {
    if (!restaurantDetailSlug || !baseRestaurantDetail) return
    if (!baseRestaurantDetail.isOpen) {
      setVenueClosedSheetOpen(true)
      return
    }
    const claim = findActiveClaimForRestaurant(
      restaurantDetailSlug,
      baseRestaurantDetail,
      claimedByOfferId,
    )
    if (claim) {
      openClaimedOfferDetails(claim)
      return
    }
    setPendingAtVenuePayBillEntry({
      restaurantName: baseRestaurantDetail.name,
      restaurantSlug: restaurantDetailSlug,
      offer: null,
    })
    setAtVenueNoClaimPayInfoOpen(true)
  }, [baseRestaurantDetail, claimedByOfferId, openClaimedOfferDetails, restaurantDetailSlug])

  const handleAtVenueNoClaimPayInfoContinue = useCallback(() => {
    if (!pendingAtVenuePayBillEntry) return
    continueAtVenuePayAfterCloseRef.current = true
    setAtVenueNoClaimPayInfoOpen(false)
  }, [pendingAtVenuePayBillEntry])

  const handleAtVenueSheetAfterClose = useCallback(() => {
    if (!continueAtVenuePayAfterCloseRef.current) return
    continueAtVenuePayAfterCloseRef.current = false
    const entry = pendingAtVenuePayBillEntry
    if (!entry) return
    setPayBillEntry(entry)
    setPendingAtVenuePayBillEntry(null)
  }, [pendingAtVenuePayBillEntry])

  const handleAtVenueNoClaimPayInfoOpenChange = useCallback((open: boolean) => {
    setAtVenueNoClaimPayInfoOpen(open)
    if (!open && !continueAtVenuePayAfterCloseRef.current) {
      setPendingAtVenuePayBillEntry(null)
    }
  }, [])

  /** Back from bill amount / early dismiss — keep restaurant detail open. */
  const exitPayFlowToRestaurant = useCallback(() => {
    setPayBillEntry(null)
  }, [])

  const finishSuccessfulPayment = useCallback(
    ({
      restaurantSlug,
      offerId,
      paidRecord,
      showSnackbar = false,
    }: {
      restaurantSlug: string
      offerId?: string
      paidRecord?: PaidOfferRecord
      showSnackbar?: boolean
    }) => {
      openRestaurantDetail(restaurantSlug)
      if (paidRecord) {
        setPaidByOfferId((prev) => ({
          ...prev,
          [paidRecord.offerId]: paidRecord,
        }))
        if (offerId) {
          setClaimedByOfferId((prev) => removeClaimedOfferById(prev, offerId))
        }
      }
      setClaimedView(null)
      setPayBillEntry(null)
      dismissClaimModalImmediate()
      if (showSnackbar) {
        scheduleSnackbarAdd(snackbar.add, createPostPaymentHomeSnackbar(() => {
          // Review flow not wired yet; placeholder lives in the toast.
        }))
      }
    },
    [openRestaurantDetail, snackbar],
  )

  const fulfillPaidOfferAndOpenRestaurant = useCallback(
    (snapshot?: PayBillCompletionSnapshot | null) => {
      const slug =
        snapshot?.restaurantSlug ?? payBillEntry?.restaurantSlug
      if (!slug) {
        setPayBillEntry(null)
        return
      }
      const paidRecord =
        snapshot ? buildPaidOfferRecordFromPaySnapshot(snapshot) : null
      if (!paidRecord) {
        setPayBillEntry(null)
        return
      }
      finishSuccessfulPayment({
        restaurantSlug: slug,
        offerId: paidRecord.offerId,
        paidRecord,
      })
    },
    [finishSuccessfulPayment, payBillEntry],
  )

  const handlePayBillFlowClose = exitPayFlowToRestaurant

  const handlePayBillPaidDone = useCallback(() => {
    scheduleSnackbarAdd(snackbar.add, createPostPaymentHomeSnackbar(() => {
      // Review flow not wired yet; placeholder lives in the toast.
    }))
  }, [snackbar])

  const handleConfirmBillClaimedComplete = useCallback(() => {
    const claim = claimedView
    if (!claim?.checkedInAt) return
    const paidRecord = buildPaidOfferRecordFromClaim(claim)
    finishSuccessfulPayment({
      restaurantSlug: claim.restaurantSlug,
      offerId: claim.offerId,
      paidRecord,
      showSnackbar: true,
    })
  }, [claimedView, finishSuccessfulPayment])

  const handlePaidOfferPress = useCallback(
    (offerId: string) => {
      const paid = paidByOfferId[offerId]
      if (!paid || !isPaidOfferPaymentDetailsAvailable(paid)) return
      setPaidConfirmationOfferId(offerId)
    },
    [paidByOfferId],
  )

  const handlePaidConfirmationDismiss = useCallback(() => {
    setPaidConfirmationOfferId(null)
  }, [])

  const paidConfirmationRecord =
    paidConfirmationOfferId ?
      paidByOfferId[paidConfirmationOfferId]
    : null

  const paidConfirmationShellRef = useRef<HTMLDivElement>(null)

  useModalOverlayLock({
    active: paidConfirmationRecord != null,
    containerRef: paidConfirmationShellRef,
    onEscape: handlePaidConfirmationDismiss,
  })

  const handleClaimedOfferPaymentMethodChange = useCallback(
    (paymentMethod: PaymentMethod) => {
      const offerId = claimedView?.offerId
      if (!offerId || !claimedView) return
      const updated = updateClaimedOfferPaymentMethod(claimedView, paymentMethod)
      setClaimedView(updated)
      setClaimedByOfferId((prev) => {
        const current = prev[offerId]
        if (!current) return prev
        return {
          ...prev,
          [offerId]: updateClaimedOfferPaymentMethod(current, paymentMethod),
        }
      })
    },
    [claimedView],
  )

  const filterBarProps = {
    getChipLabel,
    isChipActive,
    isChipLocked,
    openNowTrailing,
    openSheet,
    toggleOpenNowToday: toggleOpenNowTodayWithSkeleton,
    clearOpenNowFilter: clearOpenNowFilterWithSkeleton,
    filterState,
  }

  const mapSurface = sheetSnap === "full" ? "flat" : "floating"
  const showBottomNav =
    !searchOpen &&
    !sectionList &&
    !filteredListOpen &&
    !restaurantDetailSlug &&
    !adminPlacesOpen
  const showBottomSheet =
    !mapPlaceOpen &&
    !filteredListOpen &&
    !restaurantDetailSlug &&
    !adminPlacesOpen
  const discoverDockActive = showBottomNav && showBottomSheet

  const { discoverLayoutEpoch, discoverDockBottomInsetPx } = useDiscoverDockLayout({
    searchPanelRef,
    discoverDockRef,
    discoverDockActive,
    sheetSnap,
  })

  useSnackbarLayoutBaseline({ showBottomNav })

  const bottomSheetProps = {
    snap: sheetSnap,
    onSnapChange: setSheetSnap,
    offersToday,
    offersDinner,
    offersNearYou,
    offersAllRestaurants,
    focusRestaurantId,
    onClearFocus,
    scrollToTopSignal,
    onSeeAllSection: openSectionList,
    onRestaurantPress: handleDiscoverRestaurantPress,
    homeClaimedOffers,
    userClaims,
    claimedOffersById: claimedByOfferId,
    onHomeClaimedOfferPress: handleHomeClaimedOfferPress,
    discoverLayoutEpoch,
    onOpenAdminPlaces: openAdminPlaces,
    selectedDate: filterState.date,
    liveNowFilter,
    showFilteredEmpty,
    onResetFilters: resetAllFiltersWithSkeleton,
  }

  const mapFallback = (
    <div
      className="absolute inset-0 z-[1] bg-neutral-secondary"
      aria-hidden
    />
  )

  const claimedOfferPageNode =
    claimedView && claimedOfferPageRestaurant ?
      <ClaimedOfferPage
        ref={claimedOfferPageRef}
        key={`${claimedView.offerId}-${claimedView.offerWindowCloses}`}
        restaurant={claimedOfferPageRestaurant}
        claim={claimedView}
        onClose={handleClaimedOfferClose}
        onCancelOffer={handleCancelClaimedOffer}
        onCheckIn={handleCheckInClaimedOffer}
        onPayWithBoltDineOut={handlePayFromClaimedOfferPrepare}
        onPayWithBoltDineOutComplete={handlePayFromClaimedOfferComplete}
        onConfirmBillComplete={handleConfirmBillClaimedComplete}
        onPaymentMethodChange={handleClaimedOfferPaymentMethodChange}
      />
    : null

  /** Keep discover inert under full-screen overlays so focus cannot sit beneath them. */
  const discoverUnderClaimSheetsInert =
    pendingClaimOffer != null ||
    activeOfferConflict != null ||
    postClaimSuccess != null ||
    claimedView != null ||
    payBillEntry != null ||
    paidConfirmationOfferId != null

  return (
    <div
      className="relative w-full max-w-[var(--shell-width)] mx-auto bg-layer-floor-1 overflow-x-visible overflow-y-hidden shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.2)]"
      style={{
        minHeight: "var(--app-h)",
        height: "var(--app-h)",
      }}
    >
      <div
        className="contents"
        {...(discoverUnderClaimSheetsInert ? { inert: true as const } : {})}
      >
      <MapSurfaceErrorBoundary fallback={mapFallback}>
        <Suspense fallback={mapFallback}>
          <div className="absolute inset-0 z-[1]">
            <MapLayer
              selectedMarkerId={selectedMarkerId}
              onMarkerClick={onMarkerClick}
              onMapBackgroundClick={onMapBackgroundClick}
              sheetSnap={sheetSnap}
              mapFloatingOverlayHeightPx={mapFloatingOverlayPx}
              markers={mapMarkers}
              discoverLayoutEpoch={discoverLayoutEpoch}
              discoverDockBottomInsetPx={
                discoverDockActive ? discoverDockBottomInsetPx : null
              }
            />
            {mapPlaceOpen && focusedOffer ? (
              <div
                ref={mapCardOverlayRef}
                className="pointer-events-none absolute bottom-[var(--nav-layout-offset)] left-0 right-0 z-[15] px-2 pb-3"
                role="region"
                aria-label="Restaurant on map"
              >
                <div className="pointer-events-auto">
                  <MapPlaceCardOpened
                    offer={focusedOffer}
                    filterPending={
                      mapPlaceCardFilterPending && mapPlaceOpen
                    }
                    liveNowFilter={liveNowFilter}
                    onClose={onClearFocus}
                    onRestaurantPress={handleDiscoverRestaurantPress}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </Suspense>
      </MapSurfaceErrorBoundary>
      <SearchPanel
        ref={searchPanelRef}
        onOpenSearch={() => {
          closeSectionList()
          closeAdminPlaces()
          setSearchOpen(true)
        }}
        sheetExpanded={sheetSnap === "full"}
        surface={mapSurface}
        {...filterBarProps}
      />
      {discoverDockActive ? (
        <div
          ref={discoverDockRef}
          className="pointer-events-none fixed bottom-0 left-1/2 z-[25] flex w-full max-w-[var(--shell-width)] -translate-x-1/2 flex-col [&>*]:pointer-events-auto"
        >
          <BottomSheet {...bottomSheetProps} docked />
          <BottomNav activeTab={activeTab} onTabChange={onTabChange} docked />
        </div>
      ) : null}
      {showBottomSheet && !discoverDockActive ? (
        <BottomSheet {...bottomSheetProps} />
      ) : null}
      {sheetSnap === "full" &&
      !searchOpen &&
      !sectionList &&
      !filteredListOpen &&
      !restaurantDetailSlug &&
      !adminPlacesOpen ? (
        <MapViewFab onClick={onViewMapFab} />
      ) : null}
      {showBottomNav && !discoverDockActive ? (
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      ) : null}
      </div>
      {searchOpen ? (
        <SearchFullscreen
          onClose={() => setSearchOpen(false)}
          activeTab={activeTab}
          onTabChange={onTabChange}
          surface="flat"
          onRestaurantPress={handleDiscoverRestaurantPress}
          {...filterBarProps}
        />
      ) : null}
      {sectionList ? (
        <SectionOffersListScreen
          onClose={closeSectionList}
          title={sectionList.title}
          activeTab={activeTab}
          onTabChange={onTabChange}
          surface="flat"
          onRestaurantPress={handleDiscoverRestaurantPress}
          {...filterBarProps}
        />
      ) : null}
      {filteredListOpen ? (
        <FilteredOffersFullscreen
          offers={filteredListOffers}
          loading={filteredListLoading}
          selectedDate={filterState.date}
          liveNowFilter={liveNowFilter}
          onClose={closeFilteredList}
          onOpenSearch={() => {
            closeFilteredList()
            setSearchOpen(true)
          }}
          onViewMap={onViewFilteredMap}
          onResetFilters={resetAllFiltersWithSkeleton}
          onRestaurantPress={(slug) => {
            closeFilteredList()
            handleDiscoverRestaurantPress(slug)
          }}
          surface="flat"
          {...filterBarProps}
        />
      ) : null}
      {adminPlacesOpen ? (
        <AdminPlacesScreen onClose={closeAdminPlaces} />
      ) : null}
      {restaurantDetailSlug && restaurantDetailModel ? (
        <RestaurantDetailScreen
          key={restaurantDetailSlug}
          model={restaurantDetailModel}
          selectedOfferDate={restaurantDetailDate}
          userClaims={userClaims}
          claimedOffersById={claimedByOfferId}
          paidOffersById={paidByOfferId}
          onBack={() => {
            dismissClaimModalImmediate()
            if (claimedView) {
              dismissClaimedViewAnimated(() => {
                closeRestaurantDetail()
              })
              return
            }
            closeRestaurantDetail()
          }}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onOfferAvailablePress={handleOfferAvailablePress}
          onOfferClaimedPress={(id) => {
            const c = claimedByOfferId[id]
            if (c) openClaimedOfferDetails(c)
          }}
          onPaidOfferPress={handlePaidOfferPress}
          onPayBill={handleOpenPayBill}
        />
      ) : null}
      {paidConfirmationRecord && portalRoot ?
        <div
          className="fixed inset-0 flex w-full justify-center bg-layer-floor-1"
          style={{ zIndex: Z_PAY_BILL_FLOW }}
        >
          <div
            ref={paidConfirmationShellRef}
            className="relative h-[var(--app-h)] w-full max-w-[var(--shell-width)] overflow-hidden bg-layer-floor-1 shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.2)]"
            style={{ minHeight: "var(--app-h)", height: "var(--app-h)" }}
          >
            <PaymentConfirmationScreen
              restaurantName={
                paidConfirmationRecord.restaurantName ??
                baseRestaurantDetail?.name ??
                ""
              }
              paidAmount={paidConfirmationRecord.paidAmountEur ?? 0}
              receiptTotal={paidConfirmationRecord.receiptTotalEur ?? 0}
              tip={paidConfirmationRecord.tipEur ?? null}
              paymentCode={paidConfirmationRecord.paymentCode ?? ""}
              offer={paidOfferRecordToClaimStub(paidConfirmationRecord)}
              cashbackEarnedEur={paidConfirmationRecord.cashbackEarnedEur ?? 0}
              startRevealed
              onDismiss={handlePaidConfirmationDismiss}
              onDone={handlePaidConfirmationDismiss}
            />
          </div>
        </div>
      : null}
      {payBillEntry && portalRoot ?
        <PayBillFlow
          key={`pay-${payBillEntry.offer?.offerId ?? payBillEntry.restaurantSlug}`}
          entry={payBillEntry}
          portalContainer={portalRoot}
          onClose={handlePayBillFlowClose}
          onExitAfterPayment={fulfillPaidOfferAndOpenRestaurant}
          onPaidDone={handlePayBillPaidDone}
        />
      : null}
      {restaurantDetailSlug && pendingClaimOffer ? (
        <ClaimOfferModal
          key={pendingClaimOffer.id}
          isOpen={claimModalOpen}
          onOpenChange={(open) => {
            if (!open) setClaimModalOpen(false)
          }}
          offer={pendingClaimOffer}
          restaurantSlug={restaurantDetailSlug}
          claimedByOfferId={claimedByOfferId}
          onClose={() => setClaimModalOpen(false)}
          onExitComplete={handleClaimModalExitComplete}
          onClaimed={handleClaimed}
          onConflict={handleClaimConflict}
          container={portalRoot ?? undefined}
        />
      ) : null}
      {activeOfferConflict ?
        <ActiveOfferConflictSheet
          isOpen
          onOpenChange={(open) => {
            if (!open) setActiveOfferConflict(null)
          }}
          blockingRestaurantName={blockingConflictRestaurantName}
          onCancelBlockingOffer={handleConflictCancelBlockingOffer}
          container={portalRoot ?? undefined}
        />
      : null}
      {claimedOfferPageNode && portalRoot ?
        createPortal(claimedOfferPageNode, portalRoot)
      : claimedOfferPageNode}
      {postClaimSuccess ?
        <ClaimOfferSuccessSheet
          key={postClaimSuccess.offerId}
          isOpen
          paymentMethod={postClaimSuccess.paymentMethod}
          onOpenChange={(open) => {
            if (!open) dismissPostClaimSuccess()
          }}
          onDone={handlePostClaimSuccessDone}
          container={portalRoot}
        />
      : null}
      <VenueClosedSheet
        isOpen={venueClosedSheetOpen}
        onOpenChange={setVenueClosedSheetOpen}
        container={portalRoot}
      />
      {pendingAtVenuePayBillEntry && baseRestaurantDetail ? (
        <AtVenueNoClaimedOffersSheet
          isOpen={atVenueNoClaimPayInfoOpen}
          onOpenChange={handleAtVenueNoClaimPayInfoOpenChange}
          restaurantName={baseRestaurantDetail.name}
          container={portalRoot}
          onContinue={handleAtVenueNoClaimPayInfoContinue}
          onAfterClose={handleAtVenueSheetAfterClose}
        />
      ) : null}
      <FilterSheet
        sheetKey={sheetKey}
        filterState={filterState}
        dateOptionRows={dateOptionRows}
        onClose={closeSheet}
        onApply={applySheetValueWithSkeleton}
        onApplyDateTime={applyDateTimeFilterWithSkeleton}
      />
    </div>
  )
}
