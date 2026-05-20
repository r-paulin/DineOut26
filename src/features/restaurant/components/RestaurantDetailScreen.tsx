import { Typography } from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import ShareIosOutlined from "@bolteu/kalep-react-icons/dist/ShareIosOutlined"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useDeviceShell } from "@/shared/context/useDeviceShell"
import { useSlideInPanel } from "@/shared/hooks/useSlideInPanel"
import { buildVenueSharePayload } from "@/shared/utils/venueShare"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"
import { slideOffScreenXPx } from "@/shared/utils/slideOffScreenXPx"
import { useRestaurantDetailHeaderTitle } from "@/features/restaurant/hooks/useRestaurantDetailHeaderTitle"
import { useRestaurantHeroStatusPill } from "@/features/restaurant/hooks/useRestaurantHeroStatusPill"
import type { RestaurantDetailScreenProps } from "@/features/restaurant/restaurantDetail.types"
import { googleMapsSearchUrl } from "@/shared/utils/googleMapsSearchUrl"
import { toTelHref } from "@/shared/utils/telHref"
import { RestaurantDetailAtVenueBar } from "./RestaurantDetailAtVenueBar"
import { RestaurantDetailHeader } from "./RestaurantDetailHeader"
import { RestaurantDetailOffersSection } from "./RestaurantDetailOffersSection"
import { RestaurantDetailQuickActions } from "./RestaurantDetailQuickActions"
import { RestaurantDetailSectionDivider } from "./RestaurantDetailSectionDivider"
import { RestaurantDetailStatsBar } from "./RestaurantDetailStatsBar"
import { RestaurantAbout } from "./RestaurantAbout"
import { RestaurantDetailVenueSection } from "./RestaurantDetailVenueSection"
import { RestaurantMenuGalleryModal } from "./RestaurantMenuGalleryModal"
import { RestaurantOpenHoursSheet } from "./RestaurantOpenHoursSheet"
import { RestaurantRatingSheet } from "./RestaurantRatingSheet"
import { RestaurantReportProblemSheet } from "./RestaurantReportProblemSheet"

/**
 * Same cubic family as {@link BottomSheet} height (`0.32, 0.72, 0, 1`) so
 * discover → detail feels like one system (Apple-style “emphasized” ease).
 */
const EASE_DETAIL_ENTER = CustomEase.create(
  "detailPushEnter",
  "M0,0,C0.32,0.72,0,1,1,1",
)
/** Paired ease-in for dismiss — quick commitment, soft tail into off-screen. */
const EASE_DETAIL_EXIT = CustomEase.create(
  "detailPushExit",
  "M0,0,C0.58,0,0.92,0.36,1,1",
)

/** Enter + exit: panel and scrim each run this long (seconds). */
const DETAIL_MOTION_S = 0.6

/**
 * Optional offset between scrim and panel (seconds). `0` keeps both segments
 * exactly {@link DETAIL_MOTION_S} and ending together.
 */
const STAGGER_PANEL_AFTER_SCRIM_S = 0
const STAGGER_SCRIM_AFTER_PANEL_EXIT_S = 0

/** Figma 15886:44808 — 24px icons in ~44px touch targets, no chrome shadow. */
const ABOUT_OVERLAY_NAV_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-primary shadow-none outline-none ring-0 hover:bg-active-neutral-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-primary"

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
  onReportProblem,
}: RestaurantDetailScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const aboutScrollRef = useRef<HTMLDivElement>(null)
  /** In-panel About stack (covers main scroll only). */
  const stackAreaRef = useRef<HTMLDivElement>(null)
  const aboutStackRef = useRef<HTMLDivElement>(null)
  const onBackRef = useRef(onBack)
  const aboutExitingRef = useRef(false)
  const venueBarExitRef = useRef<(() => void) | null>(null)
  const { rootRef, scrimRef, panelRef, runExit } = useSlideInPanel(
    {
      motionDurationS: DETAIL_MOTION_S,
      easeEnter: EASE_DETAIL_ENTER,
      easeExit: EASE_DETAIL_EXIT,
      staggerPanelAfterScrimS: STAGGER_PANEL_AFTER_SCRIM_S,
      staggerScrimAfterPanelExitS: STAGGER_SCRIM_AFTER_PANEL_EXIT_S,
    },
    onBackRef,
  )
  const { portalRoot } = useDeviceShell()
  const [ratingSheetOpen, setRatingSheetOpen] = useState(false)
  const [openHoursSheetOpen, setOpenHoursSheetOpen] = useState(false)
  const [menuGalleryOpen, setMenuGalleryOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [reportProblemOpen, setReportProblemOpen] = useState(false)
  const { titleOpacity, onScroll } = useRestaurantDetailHeaderTitle()
  const statusPill = useRestaurantHeroStatusPill(model.weeklyOpenHours)
  const {
    titleOpacity: aboutTitleOpacity,
    onScroll: onAboutTitleScroll,
    reset: resetAboutTitleOpacity,
  } = useRestaurantDetailHeaderTitle()

  const mapsHref = googleMapsSearchUrl(model.address)
  const telHref = toTelHref(model.phone)

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

    if (prefersReducedMotion()) {
      gsap.set(stack, { x: 0, clearProps: "transform" })
      return
    }

    const offX = slideOffScreenXPx(stack, area)
    gsap.set(stack, { x: offX, force3D: true })

    const ctx = gsap.context(() => {
      gsap.to(stack, {
        x: 0,
        duration: DETAIL_MOTION_S,
        ease: EASE_DETAIL_ENTER,
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

  const handleOpenPriceInfo = useCallback(() => {
    if (onOpenPriceInfo === null) return
    onOpenPriceInfo?.()
    setMenuGalleryOpen(true)
  }, [onOpenPriceInfo])

  const handleOpenMenuGallery = useCallback(() => {
    if (onOpenMenu === null) return
    onOpenMenu?.()
    setMenuGalleryOpen(true)
  }, [onOpenMenu])

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

    if (prefersReducedMotion() || !stack || !area) {
      finishAboutExit()
      return
    }

    const offX = slideOffScreenXPx(stack, area)

    gsap.killTweensOf(stack)
    gsap.to(stack, {
      x: offX,
      duration: DETAIL_MOTION_S,
      ease: EASE_DETAIL_EXIT,
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
        style={prefersReducedMotion() ? { opacity: 1 } : undefined}
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
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-layer-floor-1"
            onScroll={handleScroll}
            style={{
              paddingBottom:
                "calc(env(safe-area-inset-bottom, 0px) + 10rem)",
            }}
            aria-hidden={aboutOpen}
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
            <div className="bg-layer-floor-1 px-0 pb-0">
              <RestaurantDetailStatsBar
                ratingValue={model.ratingValue}
                reviewsLine={model.reviewsLine}
                priceRange={model.priceRange}
                areaLabel={model.areaLabel}
                address={model.address}
                onOpenReviews={handleOpenReviews}
                onOpenPriceInfo={handleOpenPriceInfo}
                onOpenMaps={onOpenMaps}
              />
              <RestaurantDetailQuickActions
                onOpenMenu={
                  onOpenMenu === null ? undefined : handleOpenMenuGallery
                }
                onOpenDirections={
                  onOpenMaps ?
                    () => {
                      window.open(mapsHref, "_blank", "noopener,noreferrer")
                      onOpenMaps()
                    }
                  : undefined
                }
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
                onOpenDetails={openAbout}
              />
              <RestaurantDetailSectionDivider />
              <RestaurantDetailOffersSection
                tabs={model.offerDateTabs}
                offersByTabId={model.offersByTabId}
                userClaims={userClaims}
                claimedOffersById={claimedOffersById}
                onOfferAvailablePress={onOfferAvailablePress}
                onOfferClaimedPress={onOfferClaimedPress}
              />
            </div>
            <RestaurantDetailSectionDivider />
            <RestaurantDetailVenueSection
              name={model.name}
              cuisineTags={model.cuisineTags}
              venueGalleryCycles={model.venueGalleryCycles}
              openHoursSummary={model.openHoursSummary}
              isOpen={model.isOpen}
              address={model.address}
              phone={model.phone}
              onOpenHours={handleOpenHours}
              onOpenMenu={handleOpenMenuGallery}
              onOpenMaps={onOpenMaps}
              onCall={onCall}
              onMoreAboutVenue={openAbout}
              onOpenReportProblem={() => {
                setReportProblemOpen(true)
              }}
            />
          </div>
          {aboutOpen ? (
            <div
              ref={aboutStackRef}
              className="absolute inset-0 z-[10] flex min-h-0 flex-col overflow-hidden bg-layer-floor-1 shadow-[-6px_0_20px_rgba(0,0,0,0.06)]"
              role="region"
              aria-label={`About ${model.name}`}
            >
              <div className="flex w-full shrink-0 flex-col gap-[15px] bg-layer-floor-1 pt-[max(1.5rem,var(--safe-area-top))]">
                <div className="flex w-full items-center gap-4 px-6">
                  <button
                    type="button"
                    className={ABOUT_OVERLAY_NAV_BTN}
                    aria-label="Back to restaurant"
                    onClick={handleAnimatedCloseAbout}
                  >
                    <ArrowLeft size="md" className="text-primary" aria-hidden />
                  </button>
                  <div
                    className="flex min-w-0 flex-1 justify-center overflow-hidden px-2 text-center"
                    style={{ opacity: aboutTitleOpacity }}
                  >
                    <Typography
                      variant="body-m-accent"
                      color="primary"
                      as="span"
                      noWrap
                    >
                      {model.name}
                    </Typography>
                  </div>
                  <button
                    type="button"
                    className={ABOUT_OVERLAY_NAV_BTN}
                    aria-label="Share restaurant"
                    onClick={() => {
                      void handleShare()
                    }}
                  >
                    <ShareIosOutlined size="md" className="text-primary" aria-hidden />
                  </button>
                </div>
                <div
                  className="h-px w-full shrink-0 bg-[var(--color-border-separator)]"
                  aria-hidden
                />
              </div>
              <div
                ref={aboutScrollRef}
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-layer-floor-1"
                style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)",
            }}
                onScroll={handleAboutScroll}
              >
                <RestaurantAbout
                  restaurant={model.about}
                  galleryPortalContainer={portalRoot}
                  onOpenReviews={handleOpenReviews}
                  onOpenPriceInfo={handleOpenPriceInfo}
                  onOpenHours={handleOpenHours}
                  onOpenMenuGallery={handleOpenMenuGallery}
                />
              </div>
            </div>
          ) : null}
          {!aboutOpen ?
            <RestaurantDetailAtVenueBar
              onPress={onPayBill}
              animateIn={!aboutOpen}
              onExitAnimationRef={registerVenueBarExit}
            />
          : null}
        </div>
      </div>
      <RestaurantRatingSheet
        isOpen={ratingSheetOpen}
        onOpenChange={setRatingSheetOpen}
        googleMaps={model.ratingSheet.googleMaps}
        tripadvisor={model.ratingSheet.tripadvisor}
        container={portalRoot}
      />
      <RestaurantOpenHoursSheet
        isOpen={openHoursSheetOpen}
        onOpenChange={setOpenHoursSheetOpen}
        container={portalRoot}
        heading={model.openHoursSheetHeading}
        subtitle={model.openHoursSheetSubtitle}
        weeklyRows={model.weeklyOpenHours}
      />
      <RestaurantMenuGalleryModal
        isOpen={menuGalleryOpen}
        onOpenChange={setMenuGalleryOpen}
        imageUrls={model.menuGalleryImages}
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
