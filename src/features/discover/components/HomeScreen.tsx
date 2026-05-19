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
  ClaimOfferSuccessSheet,
  MapPlaceCardOpened,
  OfferDetailsSheet,
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
import { filterOfferCardsForDiscover } from "@/features/discover/utils/filterDiscoverOffers"
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
import type { PayBillFlowEntry } from "@/features/payBill/payBill.types"
import {
  AtVenueNoClaimedOffersSheet,
  getRestaurantDetailDemo,
  RestaurantDetailScreen,
  RestaurantOfferClaimInfoSheet,
} from "@/features/restaurant"
import { hasSeenWalkInOfferInfoThisSession } from "@/features/restaurant/utils/walkInOfferInfoSession"
import { getOfferBannerWindowPhase } from "@/features/restaurant/utils/offerBannerWindowPhase"
import { toOfferForBanner } from "@/features/restaurant/utils/offerState"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import { MapSurfaceErrorBoundary } from "./MapSurfaceErrorBoundary"
import type {
  ClaimData,
  ClaimedOffer,
  ClaimOfferModalOffer,
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

  useEffect(() => {
    if (!focusRestaurantId) return
    if (!findOfferByRestaurantId(mergedDiscoverOffers, focusRestaurantId)) {
      onClearFocus()
    }
  }, [focusRestaurantId, mergedDiscoverOffers, onClearFocus])

  const mapCardOverlayRef = useRef<HTMLDivElement>(null)
  const [measuredMapFloatingOverlayPx, setMeasuredMapFloatingOverlayPx] =
    useState(0)
  const [offerClaimModalOfferId, setOfferClaimModalOfferId] = useState<
    string | null
  >(null)
  /** Resolved offer for {@link ClaimOfferModal}; avoids re-looking up by id (can fail across demo rebuilds). */
  const [pendingClaimOffer, setPendingClaimOffer] =
    useState<ClaimOfferModalOffer | null>(null)
  const [offerDetailsOffer, setOfferDetailsOffer] =
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
  const [pendingAtVenuePayBillEntry, setPendingAtVenuePayBillEntry] =
    useState<PayBillFlowEntry | null>(null)
  const continueAtVenuePayAfterCloseRef = useRef(false)
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

  const handleHomeClaimedOfferPress = useCallback(() => {
    if (!latestClaimedOfferForHome) return
    setClaimedView(latestClaimedOfferForHome)
  }, [latestClaimedOfferForHome])

  const claimedOfferPageRestaurant = useMemo(() => {
    if (!claimedView) return null
    const d = getRestaurantDetailDemo(claimedView.restaurantSlug)
    return { name: d.name, address: d.address, phone: d.phone }
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
      const offerPayload = mapOfferCardToClaimModalOffer(card)
      setOfferClaimModalOfferId(null)
      setOfferDetailsOffer(null)
      setPendingClaimOffer(offerPayload)
    },
    [baseRestaurantDetail, restaurantDetailSlug, snackbar],
  )

  const openOfferDetails = useCallback(
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
      setOfferClaimModalOfferId(null)
      setPendingClaimOffer(null)
      setOfferDetailsOffer(mapOfferCardToClaimModalOffer(card))
    },
    [baseRestaurantDetail, restaurantDetailSlug, snackbar],
  )

  const completeClaim = useCallback(
    (data: ClaimData, card: RestaurantOfferCardModel) => {
      if (!restaurantDetailSlug) return
      const now = new Date()
      const claimed = claimOffer({
        ...data,
        offerId: card.id,
        restaurantSlug: restaurantDetailSlug,
        discountPercent: card.discountPercent,
        arrivalDateLabel: card.date,
        promoText: card.paymentPromoText,
        minOrderEur: card.minOrderEur,
        maxSavingEur: card.maxSavingEur,
        isAllDay: Boolean(card.isAllDay),
        workingHoursEnd: card.workingHoursEnd ?? "23:00",
        offerEnd:
          card.isAllDay ? (card.workingHoursEnd ?? "23:00") : (card.offerEnd ?? "23:00"),
        offerWindowBaseDate: offerWindowBaseDateFromSchedule(
          card.offerScheduleDate,
          now,
        ),
        offerScheduleYmd:
          card.offerScheduleDate != null ?
            resolveScheduleYmd(card.offerScheduleDate, now)
          : undefined,
      })
      setClaimedByOfferId((prev) => ({ ...prev, [card.id]: claimed }))
      setPendingClaimOffer(null)
      setOfferDetailsOffer(null)
      setPostClaimSuccess(claimed)
    },
    [restaurantDetailSlug],
  )

  const handleOfferAvailablePress = useCallback(
    (id: string) => {
      if (hasSeenWalkInOfferInfoThisSession()) {
        openOfferDetails(id)
        return
      }
      setOfferClaimModalOfferId(id)
    },
    [openOfferDetails],
  )

  const handleInfoContinue = useCallback(() => {
    const id = offerClaimModalOfferId
    if (!id) return
    setOfferClaimModalOfferId(null)
    openOfferDetails(id)
  }, [offerClaimModalOfferId, openOfferDetails])

  const handleOfferDetailsContinue = useCallback(() => {
    if (!offerDetailsOffer || !baseRestaurantDetail) return
    const card = findOfferCardById(baseRestaurantDetail, offerDetailsOffer.id)
    if (!card) {
      snackbar.add({
        description: "Could not find this offer. Try again.",
        timeout: 4000,
      })
      return
    }
    const phase = getOfferBannerWindowPhase(toOfferForBanner(card), Date.now())
    if (phase === "prebook") {
      beginClaimOfferFlow(card.id)
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
    completeClaim(
      {
        arrivalTime: cfg.initialValue,
        guestCount: 2,
        paymentMethod: "dineout",
      },
      card,
    )
  }, [
    baseRestaurantDetail,
    beginClaimOfferFlow,
    completeClaim,
    offerDetailsOffer,
    snackbar,
  ])

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

  const handleCancelClaimedOffer = useCallback(() => {
    const offerId = claimedView?.offerId
    if (offerId) {
      setClaimedByOfferId((prev) => {
        if (!(offerId in prev)) return prev
        const next = { ...prev }
        delete next[offerId]
        return next
      })
    }
    setClaimedView(null)
    setOfferClaimModalOfferId(null)
    setPendingClaimOffer(null)
    setOfferDetailsOffer(null)
    setPostClaimSuccess(null)
    closeRestaurantDetail()
  }, [claimedView, closeRestaurantDetail])

  const handlePayFromClaimedOffer = useCallback(() => {
    if (!claimedView) return
    const detail = getRestaurantDetailDemo(claimedView.restaurantSlug)
    setClaimedView(null)
    setPayBillEntry({
      restaurantName: detail.name,
      restaurantSlug: claimedView.restaurantSlug,
      offer: claimedView,
    })
  }, [claimedView, catalogSnapshot])

  const handleOpenPayBill = useCallback(() => {
    if (!restaurantDetailSlug || !baseRestaurantDetail) return
    const claim = findActiveClaimForRestaurant(
      restaurantDetailSlug,
      baseRestaurantDetail,
      claimedByOfferId,
    )
    if (claim) {
      setClaimedView(claim)
      return
    }
    setPendingAtVenuePayBillEntry({
      restaurantName: baseRestaurantDetail.name,
      restaurantSlug: restaurantDetailSlug,
      offer: null,
    })
    setAtVenueNoClaimPayInfoOpen(true)
  }, [baseRestaurantDetail, claimedByOfferId, restaurantDetailSlug])

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

  const fulfillPaidOfferAndExitHome = useCallback(() => {
    const offerId = payBillEntry?.offer?.offerId
    if (offerId) {
      setClaimedByOfferId((prev) => {
        if (!(offerId in prev)) return prev
        const next = { ...prev }
        delete next[offerId]
        return next
      })
    }
    setPayBillEntry(null)
    closeRestaurantDetail()
  }, [closeRestaurantDetail, payBillEntry])

  const handlePayBillFlowClose = exitPayFlowToRestaurant

  const handlePayBillPaidDone = useCallback(() => {
    snackbar.add({
      title: "Thanks for dining with us",
      description: "Leave a quick review to share your feedback",
      actions: [{ label: "Leave a review", onClick: () => {} }],
      timeout: 5000,
    })
  }, [snackbar])

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

  useSnackbarLayoutBaseline({
    discoverDockActive,
    discoverDockBottomInsetPx,
    showBottomNav,
  })

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
    onRestaurantPress: openRestaurantDetail,
    homeClaimedOfferCard,
    userClaims,
    claimedOffersById: claimedByOfferId,
    onHomeClaimedOfferPress: handleHomeClaimedOfferPress,
    discoverLayoutEpoch,
    onOpenAdminPlaces: openAdminPlaces,
  }

  const mapFallback = (
    <div
      className="absolute inset-0 z-[1] bg-neutral-secondary"
      aria-hidden
    />
  )

  return (
    <div
      className="relative w-full max-w-[var(--shell-width)] mx-auto bg-layer-floor-1 overflow-x-visible overflow-y-hidden shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.2)]"
      style={{
        minHeight: "var(--app-h)",
        height: "var(--app-h)",
      }}
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
                    onClose={onClearFocus}
                    onRestaurantPress={openRestaurantDetail}
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
      {searchOpen ? (
        <SearchFullscreen
          onClose={() => setSearchOpen(false)}
          activeTab={activeTab}
          onTabChange={onTabChange}
          surface="flat"
          onRestaurantPress={openRestaurantDetail}
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
          onRestaurantPress={openRestaurantDetail}
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
            setOfferClaimModalOfferId(null)
            setPendingClaimOffer(null)
            setClaimedView(null)
            closeRestaurantDetail()
          }}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onOfferAvailablePress={handleOfferAvailablePress}
          onOfferClaimedPress={(id) => {
            const c = claimedByOfferId[id]
            if (c) setClaimedView(c)
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
          onExitAfterPayment={fulfillPaidOfferAndExitHome}
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
          key={`${claimedView.offerId}-${claimedView.offerWindowCloses}`}
          restaurant={claimedOfferPageRestaurant}
          claim={claimedView}
          onClose={handleClaimedOfferClose}
          onCancelOffer={handleCancelClaimedOffer}
          onPayWithBoltDineOut={handlePayFromClaimedOffer}
          portalContainer={portalRoot}
        />
      ) : null}
      {offerDetailsOffer ?
        <OfferDetailsSheet
          key={offerDetailsOffer.id}
          isOpen
          offer={offerDetailsOffer}
          onOpenChange={(open) => {
            if (!open) setOfferDetailsOffer(null)
          }}
          onContinue={handleOfferDetailsContinue}
          container={portalRoot}
        />
      : null}
      {postClaimSuccess ?
        <ClaimOfferSuccessSheet
          key={postClaimSuccess.offerId}
          isOpen
          discountPercent={postClaimSuccess.discountPercent}
          paymentMethod={postClaimSuccess.paymentMethod}
          onOpenChange={(open) => {
            if (!open) setPostClaimSuccess(null)
          }}
          onDone={handlePostClaimSuccessDone}
          container={portalRoot}
        />
      : null}
      {restaurantDetailSlug &&
      offerClaimModalOfferId != null &&
      pendingClaimOffer == null &&
      offerDetailsOffer == null ?
        <RestaurantOfferClaimInfoSheet
          isOpen
          onOpenChange={(open) => {
            if (!open) setOfferClaimModalOfferId(null)
          }}
          container={portalRoot}
          onContinue={handleInfoContinue}
        />
      : null}
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
