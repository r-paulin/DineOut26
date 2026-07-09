import gsap from "gsap"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { findActiveClaimForRestaurant } from "@/features/offers/utils/claimFlowModel"
import { useDeviceShell } from "@/shared/context/useDeviceShell"
import { useSlideInPanel } from "@/shared/hooks/useSlideInPanel"
import {
  EASE_EMPHASIZED_ENTER,
  EASE_EMPHASIZED_EXIT,
  MOTION_DETAIL_SCRIM,
  MOTION_PUSH_S,
} from "@/shared/motion"
import { motionReduced } from "@/shared/motion/motionHelpers"
import { buildVenueSharePayload } from "@/shared/utils/venueShare"
import { slideOffScreenXPx } from "@/shared/utils/slideOffScreenXPx"
import { useRestaurantDetailHeaderTitle } from "@/features/restaurant/hooks/useRestaurantDetailHeaderTitle"
import { useRestaurantHeroStatusPill } from "@/features/restaurant/hooks/useRestaurantHeroStatusPill"
import { useRestaurantOpenHoursUi } from "@/features/restaurant/hooks/useRestaurantOpenHoursUi"
import type { RestaurantDetailScreenProps } from "@/features/restaurant/restaurantDetail.types"
import { googleMapsSearchUrl } from "@/shared/utils/googleMapsSearchUrl"
import { toTelHref } from "@/shared/utils/telHref"
import { RestaurantDetailAtVenueBar } from "./RestaurantDetailAtVenueBar"
import { RestaurantDetailHeader } from "./RestaurantDetailHeader"
import { RestaurantDetailOffersSection } from "./RestaurantDetailOffersSection"
import { RestaurantDetailQuickActions } from "./RestaurantDetailQuickActions"
import {
  CardDivider,
  CARD_DIVIDER_GROOVE_BG_CLASS,
  CARD_DIVIDER_SECTION_ABOVE_CLASS,
  CARD_DIVIDER_SECTION_BELOW_CLASS,
  CARD_DIVIDER_SECTION_MIDDLE_CLASS,
} from "@/shared/components/CardDivider"
import { RestaurantDetailStatsBar } from "./RestaurantDetailStatsBar"
import { RestaurantAbout } from "./RestaurantAbout"
import { RestaurantDetailMenuSection } from "./RestaurantDetailMenuSection"
import { RestaurantDetailVenueSection } from "./RestaurantDetailVenueSection"
import { RestaurantMenuGalleryModal } from "./RestaurantMenuGalleryModal"
import { RestaurantAddressSheet } from "./RestaurantAddressSheet"
import { RestaurantOpenHoursSheet } from "./RestaurantOpenHoursSheet"
import { RestaurantOverlayNavHeader } from "./RestaurantOverlayNavHeader"
import { RestaurantRatingSheet } from "./RestaurantRatingSheet"
import { RestaurantReportProblemSheet } from "./RestaurantReportProblemSheet"

/**
 * Full-screen restaurant detail: scrollable body, prototype data from
 * {@link getRestaurantDetailDemo}.
 *
 * Entry / exit: push + scrim via GSAP. Do not put animated transform/opacity on
 * these nodes via React `style` — re-renders would reset them mid-tween.
 * Respects `prefers-reduced-motion`.
 *
 * **About** is an in-stack page over the main scroll (same shell as detail), not
 * a portaled modal — see `aboutOpen` / `aboutStackRef`.
 */
export function RestaurantDetailScreen({
  model,
  onBack,
  selectedOfferDate,
  onOpenHours,
  onOpenMenu,
  onOpenMaps,
  onCall,
  onOpenReviews,
  onOpenPriceInfo,
  onPayBill,
  onMoreAboutVenue,
  onShare,
  onOfferAvailablePress,
  onOfferClaimedPress,
  userClaims,
  claimedOffersById,
  paidOffersById = {},
  onPaidOfferPress,
  onReportProblem,
}: RestaurantDetailScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const menuSectionRef = useRef<HTMLElement>(null)
  const venueSectionRef = useRef<HTMLElement>(null)
  const aboutScrollRef = useRef<HTMLDivElement>(null)
  /** In-panel About stack (covers main scroll only). */
  const stackAreaRef = useRef<HTMLDivElement>(null)
  const aboutStackRef = useRef<HTMLDivElement>(null)
  const onBackRef = useRef(onBack)
  const aboutExitingRef = useRef(false)
  const venueBarExitRef = useRef<(() => void) | null>(null)
  const { rootRef, scrimRef, panelRef, runExit } = useSlideInPanel(
    { scrimOpacity: MOTION_DETAIL_SCRIM },
    onBackRef,
  )
  const { portalRoot } = useDeviceShell()
  const [ratingSheetOpen, setRatingSheetOpen] = useState(false)
  const [openHoursSheetOpen, setOpenHoursSheetOpen] = useState(false)
  const [addressSheetOpen, setAddressSheetOpen] = useState(false)
  const [menuGalleryOpen, setMenuGalleryOpen] = useState(false)
  const [menuGalleryInitialIndex, setMenuGalleryInitialIndex] = useState(0)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [reportProblemOpen, setReportProblemOpen] = useState(false)
  const { titleOpacity, onScroll } = useRestaurantDetailHeaderTitle()
  const statusPill = useRestaurantHeroStatusPill(model.weeklyOpenHours)
  const hoursUi = useRestaurantOpenHoursUi(model.weeklyOpenHours)
  const aboutRestaurantLive = useMemo(
    () => ({
      ...model.about,
      isOpenNow: hoursUi.isOpenNow,
      hoursRowSubtitle: hoursUi.venueHoursRowSubtitle,
    }),
    [hoursUi.isOpenNow, hoursUi.venueHoursRowSubtitle, model.about],
  )
  const {
    titleOpacity: aboutTitleOpacity,
    onScroll: onAboutTitleScroll,
    reset: resetAboutTitleOpacity,
  } = useRestaurantDetailHeaderTitle()

  const mapsHref = googleMapsSearchUrl(model.address)
  const telHref = toTelHref(model.phone)

  const hasActiveVenueClaim = useMemo(
    () =>
      findActiveClaimForRestaurant(model.slug, model, claimedOffersById) !=
      null,
    [claimedOffersById, model],
  )

  const showAtVenueBar = hasActiveVenueClaim && !aboutOpen

  useEffect(() => {
    onBackRef.current = onBack
  }, [onBack])

  const handleAnimatedBack = useCallback(() => {
    venueBarExitRef.current?.()
    runExit()
  }, [runExit])

  const registerVenueBarExit = useCallback(
    (runVenueBarExit: (() => void) | null) => {
      venueBarExitRef.current = runVenueBarExit
    },
    [],
  )

  /**
   * About opens as an in-stack page (same shell as detail): horizontal slide
   * only — no second scrim or portal.
   */
  useLayoutEffect(() => {
    if (!aboutOpen) return

    const area = stackAreaRef.current
    const stack = aboutStackRef.current
    if (!area || !stack) return

    if (motionReduced()) {
      gsap.set(stack, { x: 0, clearProps: "transform" })
      return
    }

    const offX = slideOffScreenXPx(stack, area)
    gsap.set(stack, { x: offX, force3D: true })

    const ctx = gsap.context(() => {
      gsap.to(stack, {
        x: 0,
        duration: MOTION_PUSH_S,
        ease: EASE_EMPHASIZED_ENTER,
        force3D: true,
      })
    }, area)

    return () => {
      ctx.revert()
      aboutExitingRef.current = false
      const s = aboutStackRef.current
      if (s) gsap.killTweensOf(s)
    }
  }, [aboutOpen])

  const handleOpenReviews = useCallback(() => {
    if (onOpenReviews === null) return
    onOpenReviews?.()
    setRatingSheetOpen(true)
  }, [onOpenReviews])

  const handleOpenHours = useCallback(() => {
    if (onOpenHours === null) return
    onOpenHours?.()
    setOpenHoursSheetOpen(true)
  }, [onOpenHours])

  const handleOpenAddress = useCallback(() => {
    setAddressSheetOpen(true)
  }, [])

  const handleGetDirections = useCallback(() => {
    onOpenMaps?.()
  }, [onOpenMaps])

  const scrollToMenuSection = useCallback(() => {
    if (onOpenMenu === null) return
    onOpenMenu?.()
    menuSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [onOpenMenu])

  const scrollToVenueSection = useCallback(() => {
    venueSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const openMenuGalleryAt = useCallback((index = 0) => {
    setMenuGalleryInitialIndex(index)
    setMenuGalleryOpen(true)
  }, [])

  const handleOpenMenuGallery = useCallback(() => {
    openMenuGalleryAt(0)
  }, [openMenuGalleryAt])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    onScroll(el.scrollTop)
  }, [onScroll])

  const handleAboutScroll = useCallback(() => {
    const el = aboutScrollRef.current
    if (!el) return
    onAboutTitleScroll(el.scrollTop)
  }, [onAboutTitleScroll])

  useLayoutEffect(() => {
    if (!aboutOpen) {
      resetAboutTitleOpacity()
      return
    }
    const el = aboutScrollRef.current
    if (el) {
      el.scrollTop = 0
    }
    resetAboutTitleOpacity()
  }, [aboutOpen, model.slug, resetAboutTitleOpacity])

  const handleShare = useCallback(async () => {
    const data = buildVenueSharePayload({
      name: model.name,
      description: model.about.description,
      website: model.about.website,
    })
    const nav = typeof navigator !== "undefined" ? navigator : undefined
    if (nav?.share) {
      if (nav.canShare && !nav.canShare(data)) {
        onShare?.()
        return
      }
      try {
        await nav.share(data)
        onShare?.()
      } catch (e: unknown) {
        const aborted =
          e &&
          typeof e === "object" &&
          "name" in e &&
          (e as { name: string }).name === "AbortError"
        if (!aborted) {
          onShare?.()
        }
      }
    } else {
      onShare?.()
    }
  }, [model.about.description, model.about.website, model.name, onShare])

  const openAbout = useCallback(() => {
    setOpenHoursSheetOpen(false)
    setRatingSheetOpen(false)
    setAddressSheetOpen(false)
    setMenuGalleryOpen(false)
    onMoreAboutVenue?.()
    setAboutOpen(true)
  }, [onMoreAboutVenue])

  const handleAnimatedCloseAbout = useCallback(() => {
    if (aboutExitingRef.current) return
    aboutExitingRef.current = true

    const stack = aboutStackRef.current
    const area = stackAreaRef.current
    const finishAboutExit = () => {
      aboutExitingRef.current = false
      setAboutOpen(false)
    }

    if (motionReduced() || !stack || !area) {
      finishAboutExit()
      return
    }

    const offX = slideOffScreenXPx(stack, area)

    gsap.killTweensOf(stack)
    gsap.to(stack, {
      x: offX,
      duration: MOTION_PUSH_S,
      ease: EASE_EMPHASIZED_EXIT,
      force3D: true,
      onComplete: finishAboutExit,
      onInterrupt: finishAboutExit,
    })
  }, [])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[118] flex w-full max-w-[var(--shell-width)] mx-auto flex-col box-border"
      style={{ minHeight: "var(--app-h)" }}
      role="dialog"
      aria-modal="true"
      aria-label={model.name}
    >
      <div
        ref={scrimRef}
        className="pointer-events-none absolute inset-0 z-0 bg-black/15"
        style={motionReduced() ? { opacity: MOTION_DETAIL_SCRIM } : undefined}
        aria-hidden
      />
      <div
        ref={panelRef}
        className="relative z-[1] flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-layer-floor-1 shadow-[-6px_0_20px_rgba(0,0,0,0.06)]"
      >
        <div
          ref={stackAreaRef}
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div
            ref={scrollRef}
            className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${CARD_DIVIDER_GROOVE_BG_CLASS}`}
            onScroll={handleScroll}
            style={{
              paddingBottom:
                showAtVenueBar ?
                  "calc(env(safe-area-inset-bottom, 0px) + 10rem)"
                : "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
            }}
            aria-hidden={aboutOpen}
            {...(aboutOpen ? { inert: true } : {})}
          >
            <RestaurantDetailHeader
              key={model.slug}
              name={model.name}
              heroImageUrl={model.heroImageUrl}
              logoCandidates={model.logoCandidates}
              logoFallbackUrl={model.logoFallbackUrl}
              statusPill={statusPill}
              titleOpacity={titleOpacity}
              onBack={handleAnimatedBack}
              onShare={handleShare}
              onOpenHours={onOpenHours === null ? undefined : handleOpenHours}
            />
            <RestaurantDetailStatsBar
              ratingValue={model.ratingValue}
              reviewsLine={model.reviewsLine}
              priceRange={model.priceRange}
              areaLabel={model.areaLabel}
              address={model.address}
              onOpenReviews={handleOpenReviews}
              onOpenPriceInfo={onOpenPriceInfo ?? undefined}
              onOpenAddress={handleOpenAddress}
            />
            <div className={`${CARD_DIVIDER_SECTION_ABOVE_CLASS} px-0 pb-0`}>
              <RestaurantDetailQuickActions
                onOpenMenu={
                  onOpenMenu === null ? undefined : scrollToMenuSection
                }
                onOpenDirections={handleOpenAddress}
                onCall={
                  telHref && onCall ?
                    () => {
                      window.location.href = telHref
                      onCall()
                    }
                  : onCall ?
                    () => {
                      onCall()
                    }
                  : undefined
                }
                onOpenDetails={scrollToVenueSection}
              />
              <CardDivider />
              <RestaurantDetailOffersSection
                venueSlug={model.slug}
                tabs={model.offerDateTabs}
                offersByTabId={model.offersByTabId}
                preferredTabId={selectedOfferDate}
                userClaims={userClaims}
                claimedOffersById={claimedOffersById}
                paidOffersById={paidOffersById}
                onOfferAvailablePress={onOfferAvailablePress}
                onOfferClaimedPress={onOfferClaimedPress}
                onPaidOfferPress={onPaidOfferPress}
              />
            </div>
            <CardDivider />
            <div className={CARD_DIVIDER_SECTION_MIDDLE_CLASS}>
              <RestaurantDetailMenuSection
                ref={menuSectionRef}
                imageUrls={model.menuGalleryImages}
                onOpenGallery={openMenuGalleryAt}
              />
            </div>
            <CardDivider />
            <div className={CARD_DIVIDER_SECTION_BELOW_CLASS}>
              <RestaurantDetailVenueSection
              ref={venueSectionRef}
              name={model.name}
              cuisineTags={model.cuisineTags}
              venueGalleryCycles={model.venueGalleryCycles}
              venueHoursRowSubtitle={hoursUi.venueHoursRowSubtitle}
              isOpen={hoursUi.isOpenNow}
              address={model.address}
              phone={model.phone}
              onOpenHours={handleOpenHours}
              onOpenAddress={handleOpenAddress}
              onCall={onCall}
              onOpenAbout={openAbout}
              onOpenReportProblem={() => {
                setReportProblemOpen(true)
              }}
              />
            </div>
          </div>
          {aboutOpen ? (
            <div
              ref={aboutStackRef}
              className="absolute inset-0 z-[10] flex min-h-0 flex-col overflow-hidden bg-layer-floor-1 shadow-[-6px_0_20px_rgba(0,0,0,0.06)]"
              role="region"
              aria-label={`About ${model.name}`}
            >
              <RestaurantOverlayNavHeader
                title={model.name}
                titleOpacity={aboutTitleOpacity}
                backAriaLabel="Back to restaurant"
                shareAriaLabel="Share restaurant"
                onBack={handleAnimatedCloseAbout}
                onShare={() => {
                  void handleShare()
                }}
              />
              <div
                ref={aboutScrollRef}
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-layer-floor-1"
                style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)",
            }}
                onScroll={handleAboutScroll}
              >
                <RestaurantAbout
                  restaurant={aboutRestaurantLive}
                  venueGalleryCycles={model.venueGalleryCycles}
                  onOpenReviews={handleOpenReviews}
                  onOpenPriceInfo={onOpenPriceInfo ?? undefined}
                  onOpenHours={handleOpenHours}
                  onOpenMenuGallery={handleOpenMenuGallery}
                  onOpenAddress={handleOpenAddress}
                />
              </div>
            </div>
          ) : null}
          {showAtVenueBar ?
            <RestaurantDetailAtVenueBar
              onPress={onPayBill}
              animateIn
              onExitAnimationRef={registerVenueBarExit}
            />
          : null}
        </div>
      </div>
      <RestaurantRatingSheet
        isOpen={ratingSheetOpen}
        onOpenChange={setRatingSheetOpen}
        container={portalRoot}
      />
      <RestaurantOpenHoursSheet
        isOpen={openHoursSheetOpen}
        onOpenChange={setOpenHoursSheetOpen}
        container={portalRoot}
        weeklyRows={model.weeklyOpenHours}
      />
      <RestaurantAddressSheet
        isOpen={addressSheetOpen}
        onOpenChange={setAddressSheetOpen}
        container={portalRoot}
        restaurantName={model.name}
        address={model.address}
        restaurantSlug={model.slug}
        mapsHref={mapsHref}
        onGetDirections={handleGetDirections}
      />
      <RestaurantMenuGalleryModal
        isOpen={menuGalleryOpen}
        onOpenChange={setMenuGalleryOpen}
        imageUrls={model.menuGalleryImages}
        initialSlideIndex={menuGalleryInitialIndex}
        layout="vertical"
        container={portalRoot}
      />
      <RestaurantReportProblemSheet
        isOpen={reportProblemOpen}
        onOpenChange={setReportProblemOpen}
        container={portalRoot}
        onReport={(reasonIds) => {
          onReportProblem?.(reasonIds)
        }}
      />
    </div>
  )
}
