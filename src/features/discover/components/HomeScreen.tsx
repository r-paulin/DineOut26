import { lazy, Suspense, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useSnackbar } from "@/shared/snackbar"
import { BottomNav } from "@/shared/components/BottomNav"
import { useDeviceShell } from "@/shared/context/useDeviceShell"
import {
  BottomSheet,
  ClaimOfferModal,
  ClaimedOfferPage,
  MapPlaceCardOpened,
  OFFERS_ALL_RESTAURANTS,
  OFFERS_DINNER,
  OFFERS_NEAR_YOU,
  OFFERS_TODAY,
  SectionOffersListScreen,
  claimOffer,
  findOfferCardById,
  getTimePickerConfig,
  mapOfferCardToClaimModalOffer,
} from "@/features/offers"
import { buildMapMarkersFromOffers, MapViewFab } from "@/features/map"
import { getArrivalTimeSheetSlots } from "@/features/offers/utils/offerTimePicker"
import { filterOffersByTimePreset } from "@/features/offers/utils/offerCampaign"
import { offerWindowBaseDateFromSchedule } from "@/features/offers/utils/offerScheduleLocal"
import {
  FilterSheet,
  SearchFullscreen,
  SearchPanel,
} from "@/features/search"
import { useDiscoverScreen } from "@/features/discover/hooks/useDiscoverScreen"
import { findOfferByRestaurantId } from "@/features/offers/utils/findOfferByRestaurantId"
import { PayBillFlow } from "@/features/payBill"
import type { PayBillFlowEntry } from "@/features/payBill/payBill.types"
import { buildPayBillAmountBadges } from "@/features/payBill/utils/payBillAmountBadges"
import {
  getRestaurantDetailDemo,
  RestaurantDetailScreen,
  RestaurantOfferClaimInfoSheet,
} from "@/features/restaurant"
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
  } = useDiscoverScreen()

  const preset = filterState.offerTimePreset
  const offersToday = useMemo(
    () => filterOffersByTimePreset(OFFERS_TODAY, preset),
    [preset],
  )
  const offersDinner = useMemo(
    () => filterOffersByTimePreset(OFFERS_DINNER, preset),
    [preset],
  )
  const offersNearYou = useMemo(
    () => filterOffersByTimePreset(OFFERS_NEAR_YOU, preset),
    [preset],
  )
  const offersAllRestaurants = useMemo(
    () => filterOffersByTimePreset(OFFERS_ALL_RESTAURANTS, preset),
    [preset],
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
  const mapCardOverlayRef = useRef<HTMLDivElement>(null)
  const [measuredMapFloatingOverlayPx, setMeasuredMapFloatingOverlayPx] =
    useState(0)
  const [offerClaimModalOfferId, setOfferClaimModalOfferId] = useState<
    string | null
  >(null)
  /** Resolved offer for {@link ClaimOfferModal}; avoids re-looking up by id (can fail across demo rebuilds). */
  const [pendingClaimOffer, setPendingClaimOffer] =
    useState<ClaimOfferModalOffer | null>(null)
  const [claimedByOfferId, setClaimedByOfferId] = useState<
    Record<string, ClaimedOffer>
  >({})
  const [claimedView, setClaimedView] = useState<ClaimedOffer | null>(null)
  const [payBillEntry, setPayBillEntry] = useState<PayBillFlowEntry | null>(null)
  const { portalRoot } = useDeviceShell()
  const snackbar = useSnackbar()

  /** Full-screen overlays hide {@link BottomNav}; keep snackbars above sticky CTAs — `index.css`. */
  useLayoutEffect(() => {
    const el = document.documentElement
    const overlayNoNav =
      (searchOpen ||
        sectionList != null ||
        restaurantDetailSlug != null ||
        claimedView != null) &&
      payBillEntry == null
    if (overlayNoNav) {
      el.setAttribute("data-dineout-overlay-no-nav", "")
    } else {
      el.removeAttribute("data-dineout-overlay-no-nav")
    }
    return () => {
      el.removeAttribute("data-dineout-overlay-no-nav")
    }
  }, [
    searchOpen,
    sectionList,
    restaurantDetailSlug,
    claimedView,
    payBillEntry,
  ])

  const baseRestaurantDetail = useMemo(
    () =>
      restaurantDetailSlug ?
        getRestaurantDetailDemo(restaurantDetailSlug)
      : null,
    [restaurantDetailSlug],
  )

  const restaurantDetailModel = baseRestaurantDetail

  const userClaims: readonly UserClaim[] = useMemo(
    () =>
      Object.values(claimedByOfferId).map((c) => ({
        offerId: c.offerId,
        claimedAt: c.claimedAt,
      })),
    [claimedByOfferId],
  )

  const latestClaimedOfferForHome = useMemo(() => {
    const list = Object.values(claimedByOfferId)
    if (list.length === 0) return null
    return list.reduce((a, b) => (a.claimedAt >= b.claimedAt ? a : b))
  }, [claimedByOfferId])

  const homeClaimedOfferCard = useMemo(() => {
    if (!latestClaimedOfferForHome) return null
    const model = getRestaurantDetailDemo(latestClaimedOfferForHome.restaurantSlug)
    return findOfferCardById(model, latestClaimedOfferForHome.offerId) ?? null
  }, [latestClaimedOfferForHome])

  const handleHomeClaimedOfferPress = useCallback(() => {
    if (!latestClaimedOfferForHome) return
    setClaimedView(latestClaimedOfferForHome)
  }, [latestClaimedOfferForHome])

  const claimedOfferPageRestaurant = useMemo(() => {
    if (!claimedView) return null
    const d = getRestaurantDetailDemo(claimedView.restaurantSlug)
    return { name: d.name, address: d.address, phone: d.phone }
  }, [claimedView])

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

  const handleInfoContinue = useCallback(() => {
    const id = offerClaimModalOfferId
    if (!id || !restaurantDetailSlug || !baseRestaurantDetail) {
      snackbar.add({
        description: "Something went wrong. Try again.",
        timeout: 4000,
      })
      return
    }
    const card = findOfferCardById(baseRestaurantDetail, id)
    if (!card) {
      snackbar.add({
        description: "Couldn't find this offer. Try again.",
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
    if (getArrivalTimeSheetSlots(cfg).length === 0) {
      snackbar.add({
        description: "This offer is no longer available to claim",
        timeout: 4000,
      })
      return
    }
    const offerPayload = mapOfferCardToClaimModalOffer(card)
    // Unmount info sheet and mount claim modal in one batch so only one Vaul
    // root is active; offer payload is stored — do not re-derive from model.
    setOfferClaimModalOfferId(null)
    setPendingClaimOffer(offerPayload)
  }, [
    baseRestaurantDetail,
    offerClaimModalOfferId,
    restaurantDetailSlug,
    snackbar,
  ])

  const handleClaimed = useCallback(
    (data: ClaimData) => {
      if (!pendingClaimOffer || !restaurantDetailSlug || !baseRestaurantDetail)
        return
      const card = findOfferCardById(baseRestaurantDetail, pendingClaimOffer.id)
      if (!card) {
        snackbar.add({
          description: "Couldn't complete claim. Try again.",
          timeout: 4000,
        })
        return
      }
      const now = new Date()
      const claimed = claimOffer({
        ...data,
        offerId: card.id,
        restaurantSlug: restaurantDetailSlug,
        discountPercent: card.discountPercent,
        arrivalDateLabel: card.date,
        promoText: card.paymentPromoText,
        isAllDay: Boolean(card.isAllDay),
        workingHoursEnd: card.workingHoursEnd ?? "23:00",
        offerEnd:
          card.isAllDay ? (card.workingHoursEnd ?? "23:00") : (card.offerEnd ?? "23:00"),
        offerWindowBaseDate: offerWindowBaseDateFromSchedule(
          card.offerScheduleDate,
          now,
        ),
      })
      setClaimedByOfferId((prev) => ({ ...prev, [card.id]: claimed }))
      setPendingClaimOffer(null)
      snackbar.add({
        title: "Offer claimed",
        description: "Open it when you arrive and show it to staff",
        actions: [
          {
            label: "View offer",
            onClick: () => {
              setClaimedView(claimed)
            },
          },
        ],
        timeout: 5000,
      })
    },
    [
      baseRestaurantDetail,
      pendingClaimOffer,
      restaurantDetailSlug,
      snackbar,
    ],
  )

  const handleClaimedOfferClose = useCallback(() => {
    setClaimedView(null)
  }, [])

  const handleCancelClaimedOffer = useCallback(() => {
    setClaimedByOfferId((prev) => {
      const next = { ...prev }
      if (claimedView) delete next[claimedView.offerId]
      return next
    })
    setClaimedView(null)
  }, [claimedView])

  const handleOpenPayBill = useCallback(() => {
    if (!restaurantDetailSlug || !baseRestaurantDetail) return
    const claims = Object.values(claimedByOfferId).filter(
      (c) => c.restaurantSlug === restaurantDetailSlug,
    )
    for (const claim of claims) {
      if (findOfferCardById(baseRestaurantDetail, claim.offerId)) {
        setPayBillEntry({
          restaurantName: baseRestaurantDetail.name,
          restaurantSlug: restaurantDetailSlug,
          offer: claim,
          billAmountBadges: buildPayBillAmountBadges(baseRestaurantDetail, claim),
        })
        return
      }
    }
    setPayBillEntry({
      restaurantName: baseRestaurantDetail.name,
      restaurantSlug: restaurantDetailSlug,
      offer: null,
      billAmountBadges: buildPayBillAmountBadges(baseRestaurantDetail, null),
    })
  }, [baseRestaurantDetail, claimedByOfferId, restaurantDetailSlug])

  const handlePayBillFlowClose = useCallback(() => {
    setPayBillEntry(null)
  }, [])

  const handlePayBillRatingDismiss = useCallback(() => {
    closeRestaurantDetail()
    snackbar.add({
      title: "Thank you for your order with DineOut",
      description: "We appreciate you choosing DineOut",
      timeout: 4500,
    })
  }, [closeRestaurantDetail, snackbar])

  const handlePayBillRated = useCallback(() => {
    closeRestaurantDetail()
    snackbar.add({
      title: "Thanks for your feedback",
      description: "Your rating helps other diners",
      timeout: 4000,
    })
  }, [closeRestaurantDetail, snackbar])

  const filterBarProps = {
    getChipLabel,
    isChipActive,
    isChipLocked,
    openNowTrailing,
    openSheet,
    toggleOpenNowToday,
    clearOpenNowFilter,
    setOpenAtTime,
    filterState,
  }

  const mapSurface = sheetSnap === "full" ? "flat" : "floating"
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
            />
            {mapPlaceOpen && focusedOffer ? (
              <div
                ref={mapCardOverlayRef}
                className="pointer-events-none absolute bottom-[var(--nav-height)] left-0 right-0 z-[15] px-3 pb-3"
                role="region"
                aria-label="Restaurant on map"
              >
                <div className="pointer-events-auto">
                  <MapPlaceCardOpened
                    offer={focusedOffer}
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
        onOpenSearch={() => {
          closeSectionList()
          setSearchOpen(true)
        }}
        sheetExpanded={sheetSnap === "full"}
        surface={mapSurface}
        {...filterBarProps}
      />
      {!mapPlaceOpen && !restaurantDetailSlug ? (
        <BottomSheet
          snap={sheetSnap}
          onSnapChange={setSheetSnap}
          offersToday={offersToday}
          offersDinner={offersDinner}
          offersNearYou={offersNearYou}
          offersAllRestaurants={offersAllRestaurants}
          focusRestaurantId={focusRestaurantId}
          onClearFocus={onClearFocus}
          scrollToTopSignal={scrollToTopSignal}
          onSeeAllSection={openSectionList}
          onRestaurantPress={openRestaurantDetail}
          homeClaimedOfferCard={homeClaimedOfferCard}
          userClaims={userClaims}
          claimedOffersById={claimedByOfferId}
          onHomeClaimedOfferPress={handleHomeClaimedOfferPress}
        />
      ) : null}
      {sheetSnap === "full" &&
      !searchOpen &&
      !sectionList &&
      !restaurantDetailSlug ? (
        <MapViewFab onClick={onViewMapFab} />
      ) : null}
      {!searchOpen && !sectionList && !restaurantDetailSlug ? (
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      ) : null}
      {searchOpen ? (
        <SearchFullscreen
          onClose={() => setSearchOpen(false)}
          surface="flat"
          onRestaurantPress={openRestaurantDetail}
          {...filterBarProps}
        />
      ) : null}
      {sectionList ? (
        <SectionOffersListScreen
          onClose={closeSectionList}
          title={sectionList.title}
          surface="flat"
          onRestaurantPress={openRestaurantDetail}
          {...filterBarProps}
        />
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
          onOfferAvailablePress={(id) => setOfferClaimModalOfferId(id)}
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
          onRated={handlePayBillRated}
          onRatingDismiss={handlePayBillRatingDismiss}
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
          portalContainer={portalRoot}
        />
      ) : null}
      {restaurantDetailSlug &&
      offerClaimModalOfferId != null &&
      pendingClaimOffer == null ? (
        <RestaurantOfferClaimInfoSheet
          isOpen
          onOpenChange={(open) => {
            if (!open) setOfferClaimModalOfferId(null)
          }}
          container={portalRoot}
          onContinue={handleInfoContinue}
        />
      ) : null}
      <FilterSheet
        sheetKey={sheetKey}
        filterState={filterState}
        dateOptionRows={dateOptionRows}
        onClose={closeSheet}
        onApply={applySheetValue}
      />
    </div>
  )
}
