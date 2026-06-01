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
import { useSnackbar, useSnackbarLayoutBaseline } from "@/shared/snackbar"
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
import { buildMapMarkersFromOffers, MapViewFab } from "@/features/map"
import { filterOffersByTimePreset } from "@/features/offers/utils/offerCampaign"
import {
  filterOfferCardsForDiscover,
  getEffectiveOfferForDiscover,
  isDiscoverEmptyTriggerFilter,
} from "@/features/discover/utils/filterDiscoverOffers"
import { removeClaimedOfferById } from "@/features/offers/utils/claimedOfferState"
import { updateClaimedOfferPaymentMethod } from "@/features/offers/utils/updateClaimedOfferPaymentMethod"
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
import { createPostPaymentHomeSnackbar } from "@/features/payBill/constants/postPaymentHomeSnackbar"
import type { PayBillFlowEntry } from "@/features/payBill/payBill.types"
import {
  AtVenueNoClaimedOffersSheet,
  getRestaurantDetailDemo,
  RestaurantDetailScreen,
  VenueClosedSheet,
} from "@/features/restaurant"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import { MapSurfaceErrorBoundary } from "./MapSurfaceErrorBoundary"
import type {
  ClaimData,
  ClaimedOffer,
  ClaimOfferModalOffer,
  PaymentMethod,
} from "@/features/offers/offers.types"
import type { UserClaim } from "@/features/restaurant/utils/offerState"

const MapLayer = lazy(() =>
  import("@/features/map/components/MapLayer").then((m) => ({
    default: m.MapLayer,
  })),
)

export function HomeScreen() {
  const {
    state: filterState,
    sheetKey,
    dateOptionRows,
    openSheet,
    closeSheet,
    applySheetValue,
    toggleOpenNowToday,
    clearOpenNowFilter,
    setOpenAtTime,
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
    scrollToTopSignal,
    sectionList,
    openSectionList,
    closeSectionList,
    restaurantDetailSlug,
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
  const liveNowFilter =
    getEffectiveOfferForDiscover(filterState) === "live"
  const showFilteredEmpty =
    mergedDiscoverOffers.length === 0 &&
    isDiscoverEmptyTriggerFilter(filterState)
  const mapMarkers = useMemo(
    () => buildMapMarkersFromOffers(mergedDiscoverOffers),
    [mergedDiscoverOffers],
  )
  const focusedOffer = useMemo(
    () => findOfferByRestaurantId(mergedDiscoverOffers, focusRestaurantId),
    [mergedDiscoverOffers, focusRestaurantId],
  )
  const mapPlaceOpen = Boolean(focusRestaurantId && focusedOffer)
  const [mapPlaceCardFilterPending, setMapPlaceCardFilterPending] =
    useState(false)

  const runWithMapPlaceCardFilterSkeleton = useCallback((work: () => void) => {
    setMapPlaceCardFilterPending(true)
    work()
    queueMicrotask(() => {
      window.setTimeout(() => setMapPlaceCardFilterPending(false), 320)
    })
  }, [])

  const applySheetValueWithSkeleton = useCallback(
    (...args: Parameters<typeof applySheetValue>) => {
      runWithMapPlaceCardFilterSkeleton(() => applySheetValue(...args))
    },
    [applySheetValue, runWithMapPlaceCardFilterSkeleton],
  )

  const toggleOpenNowTodayWithSkeleton = useCallback(() => {
    runWithMapPlaceCardFilterSkeleton(() => toggleOpenNowToday())
  }, [runWithMapPlaceCardFilterSkeleton, toggleOpenNowToday])

  const clearOpenNowFilterWithSkeleton = useCallback(() => {
    runWithMapPlaceCardFilterSkeleton(() => clearOpenNowFilter())
  }, [clearOpenNowFilter, runWithMapPlaceCardFilterSkeleton])

  const setOpenAtTimeWithSkeleton = useCallback(
    (time: Parameters<typeof setOpenAtTime>[0]) => {
      runWithMapPlaceCardFilterSkeleton(() => setOpenAtTime(time))
    },
    [runWithMapPlaceCardFilterSkeleton, setOpenAtTime],
  )

  const resetAllFiltersWithSkeleton = useCallback(() => {
    runWithMapPlaceCardFilterSkeleton(() => resetAllFilters())
  }, [resetAllFilters, runWithMapPlaceCardFilterSkeleton])

  useEffect(() => {
    if (!focusRestaurantId) return
    if (!findOfferByRestaurantId(mergedDiscoverOffers, focusRestaurantId)) {
      onClearFocus()
    }
  }, [focusRestaurantId, mergedDiscoverOffers, onClearFocus])

  const mapCardOverlayRef = useRef<HTMLDivElement>(null)
  const [measuredMapFloatingOverlayPx, setMeasuredMapFloatingOverlayPx] =
    useState(0)
  /** Resolved offer for {@link ClaimOfferModal}; avoids re-looking up by id (can fail across demo rebuilds). */
  const [pendingClaimOffer, setPendingClaimOffer] =
    useState<ClaimOfferModalOffer | null>(null)
  const [postClaimSuccess, setPostClaimSuccess] = useState<ClaimedOffer | null>(
    null,
  )
  const [claimedByOfferId, setClaimedByOfferId] = useState<
    Record<string, ClaimedOffer>
  >({})
  const [claimedView, setClaimedView] = useState<ClaimedOffer | null>(null)
  const [payBillEntry, setPayBillEntry] = useState<PayBillFlowEntry | null>(null)
  const [atVenueNoClaimPayInfoOpen, setAtVenueNoClaimPayInfoOpen] = useState(false)
  const [venueClosedSheetOpen, setVenueClosedSheetOpen] = useState(false)
  const [pendingAtVenuePayBillEntry, setPendingAtVenuePayBillEntry] =
    useState<PayBillFlowEntry | null>(null)
  const continueAtVenuePayAfterCloseRef = useRef(false)
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

  const latestClaimedOfferForHome = useMemo(() => {
    const list = Object.values(claimedByOfferId)
    if (list.length === 0) return null
    return list.reduce((a, b) => (a.claimedAt >= b.claimedAt ? a : b))
  }, [claimedByOfferId])

  const homeClaimedOfferCard = useMemo(() => {
    if (!latestClaimedOfferForHome) return null
    const model = getRestaurantDetailDemo(latestClaimedOfferForHome.restaurantSlug)
    const card = findOfferCardById(model, latestClaimedOfferForHome.offerId)
    if (!card) return null
    return {
      ...card,
      restaurantName: card.restaurantName ?? model.name,
    }
  }, [latestClaimedOfferForHome, catalogSnapshot])

  const openClaimedOfferDetails = useCallback(
    (claim: ClaimedOffer) => {
      openRestaurantDetail(claim.restaurantSlug)
      closeSectionList()
      setSearchOpen(false)
      setPendingClaimOffer(null)
      setPostClaimSuccess(null)
      setClaimedView(claim)
    },
    [closeSectionList, openRestaurantDetail, setSearchOpen],
  )

  const handleHomeClaimedOfferPress = useCallback(
    (offerId: string) => {
      const claim = claimedByOfferId[offerId]
      if (!claim) return
      openClaimedOfferDetails(claim)
    },
    [claimedByOfferId, openClaimedOfferDetails],
  )

  const handleDiscoverRestaurantPress = useCallback(
    (slug: string) => {
      const model = getRestaurantDetailDemo(slug)
      const activeClaim = findActiveClaimForRestaurant(
        slug,
        model,
        claimedByOfferId,
      )
      if (activeClaim) {
        openClaimedOfferDetails(activeClaim)
        return
      }
      openRestaurantDetail(slug)
    },
    [claimedByOfferId, openClaimedOfferDetails, openRestaurantDetail],
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
      setPendingClaimOffer(mapOfferCardToClaimModalOffer(card))
    },
    [baseRestaurantDetail, restaurantDetailSlug, snackbar],
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
      setPendingClaimOffer(null)
      setPostClaimSuccess(claimed)
    },
    [restaurantDetailSlug],
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

  const handlePostClaimSuccessDone = useCallback(() => {
    setPostClaimSuccess(null)
  }, [])

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
      setPendingClaimOffer(null)
      setPostClaimSuccess(null)
      closeRestaurantDetail()
    },
    [closeRestaurantDetail],
  )

  const handlePayFromClaimedOfferPrepare = useCallback(() => {
    if (!claimedView) return
    const claim = claimedView
    const detail = getRestaurantDetailDemo(claim.restaurantSlug)
    setPayBillEntry({
      restaurantName: detail.name,
      restaurantSlug: claim.restaurantSlug,
      offer: claim,
    })
  }, [claimedView, catalogSnapshot])

  const handlePayFromClaimedOfferComplete = useCallback(() => {
    setClaimedView(null)
  }, [])

  const clearClaimedOfferAfterPayment = useCallback(
    (offerId?: string, showSnackbar = false) => {
      if (offerId) {
        setClaimedByOfferId((prev) => removeClaimedOfferById(prev, offerId))
      }
      setClaimedView(null)
      setPendingClaimOffer(null)
      if (showSnackbar) {
        requestAnimationFrame(() => {
          snackbar.add(
            createPostPaymentHomeSnackbar(() => {
              // Review flow not wired yet; placeholder lives in the toast.
            }),
          )
        })
      }
    },
    [snackbar],
  )

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
      showSnackbar = false,
    }: {
      restaurantSlug: string
      offerId?: string
      showSnackbar?: boolean
    }) => {
      openRestaurantDetail(restaurantSlug)
      if (offerId) {
        setClaimedByOfferId((prev) => removeClaimedOfferById(prev, offerId))
      }
      setClaimedView(null)
      setPayBillEntry(null)
      setPendingClaimOffer(null)
      if (showSnackbar) {
        requestAnimationFrame(() => {
          snackbar.add(
            createPostPaymentHomeSnackbar(() => {
              // Review flow not wired yet; placeholder lives in the toast.
            }),
          )
        })
      }
    },
    [openRestaurantDetail, snackbar],
  )

  const fulfillPaidOfferAndOpenRestaurant = useCallback(() => {
    const slug = payBillEntry?.restaurantSlug
    const offerId = payBillEntry?.offer?.offerId
    if (!slug) {
      setPayBillEntry(null)
      return
    }
    finishSuccessfulPayment({ restaurantSlug: slug, offerId })
  }, [finishSuccessfulPayment, payBillEntry])

  const handlePayBillFlowClose = exitPayFlowToRestaurant

  const handlePayBillPaidDone = useCallback(() => {
    requestAnimationFrame(() => {
      snackbar.add(
        createPostPaymentHomeSnackbar(() => {
          // Review flow not wired yet; placeholder lives in the toast.
        }),
      )
    })
  }, [snackbar])

  const handleConfirmBillClaimedComplete = useCallback(() => {
    const offerId = claimedView?.offerId
    if (!offerId) return
    clearClaimedOfferAfterPayment(offerId, true)
  }, [claimedView, clearClaimedOfferAfterPayment])

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
    setOpenAtTime: setOpenAtTimeWithSkeleton,
    filterState,
  }

  const mapSurface = sheetSnap === "full" ? "flat" : "floating"
  const showBottomNav =
    !searchOpen && !sectionList && !restaurantDetailSlug && !adminPlacesOpen
  const showBottomSheet =
    !mapPlaceOpen && !restaurantDetailSlug && !adminPlacesOpen
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
    homeClaimedOfferCard,
    userClaims,
    claimedOffersById: claimedByOfferId,
    onHomeClaimedOfferPress: handleHomeClaimedOfferPress,
    discoverLayoutEpoch,
    onOpenAdminPlaces: openAdminPlaces,
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

  /** Keep discover inert under full-screen overlays so focus cannot sit beneath them. */
  const discoverUnderClaimSheetsInert =
    pendingClaimOffer != null ||
    postClaimSuccess != null ||
    claimedView != null ||
    payBillEntry != null

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
      {adminPlacesOpen ? (
        <AdminPlacesScreen onClose={closeAdminPlaces} />
      ) : null}
      {restaurantDetailSlug && restaurantDetailModel ? (
        <RestaurantDetailScreen
          key={restaurantDetailSlug}
          model={restaurantDetailModel}
          userClaims={userClaims}
          claimedOffersById={claimedByOfferId}
          onBack={() => {
            setPendingClaimOffer(null)
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
          onPayBill={handleOpenPayBill}
        />
      ) : null}
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
          isOpen
          onOpenChange={(open) => {
            if (!open) setPendingClaimOffer(null)
          }}
          offer={pendingClaimOffer}
          onClose={() => setPendingClaimOffer(null)}
          onClaimed={handleClaimed}
          container={portalRoot ?? undefined}
        />
      ) : null}
      {claimedView && claimedOfferPageRestaurant ? (
        <ClaimedOfferPage
          ref={claimedOfferPageRef}
          key={`${claimedView.offerId}-${claimedView.offerWindowCloses}`}
          restaurant={claimedOfferPageRestaurant}
          claim={claimedView}
          onClose={handleClaimedOfferClose}
          onCancelOffer={handleCancelClaimedOffer}
          onPayWithBoltDineOut={handlePayFromClaimedOfferPrepare}
          onPayWithBoltDineOutComplete={handlePayFromClaimedOfferComplete}
          onConfirmBillComplete={handleConfirmBillClaimedComplete}
          onPaymentMethodChange={handleClaimedOfferPaymentMethodChange}
        />
      ) : null}
      {postClaimSuccess ?
        <ClaimOfferSuccessSheet
          key={postClaimSuccess.offerId}
          isOpen
          discountPercent={postClaimSuccess.discountPercent}
          paymentMethod={postClaimSuccess.paymentMethod}
          restaurantName={baseRestaurantDetail?.name ?? ""}
          onOpenChange={(open) => {
            if (!open) setPostClaimSuccess(null)
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
      />
    </div>
  )
}
