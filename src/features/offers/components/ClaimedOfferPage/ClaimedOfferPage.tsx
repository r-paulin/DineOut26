import { Button, Dialog, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { ClaimedOfferCancelRow } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferCancelRow"
import { ClaimedOfferDetailsSection } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferDetailsSection"
import { ClaimedOfferDisclaimer } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferDisclaimer"
import { ClaimedOfferHeroSection } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferHeroSection"
import { ClaimedOfferHowToUseSection } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferHowToUseSection"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  formatClaimedOfferFoodLabel,
  isClaimCheckedIn,
} from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import gsap from "gsap"
import { createClaimedOfferCheckInSnackbar } from "@/features/offers/constants/claimedOfferCheckInSnackbar"
import { cancelOffer } from "@/features/offers/utils/claimOffer"
import {
  isClaimedOfferForToday,
  resolveClaimedOfferDateLabel,
} from "@/features/offers/utils/formatClaimedArrivalDate"
import { Z_CLAIMED_OFFER_PAGE } from "@/features/restaurant/constants/screenLayers"
import { CardDivider } from "@/shared/components/CardDivider"
import { useSlideInPanel } from "@/shared/hooks/useSlideInPanel"
import { scheduleSnackbarAdd, useSnackbar } from "@/shared/snackbar"
import {
  EASE_STANDARD_IN,
  MOTION_DETAIL_SCRIM,
  MOTION_MICRO_S,
} from "@/shared/motion"
import { motionReduced } from "@/shared/motion/motionHelpers"
import { googleMapsSearchUrl } from "@/shared/utils/googleMapsSearchUrl"
import { useOfferExpired } from "./useOfferCountdown"

export interface ClaimedOfferPageProps {
  restaurant: {
    name: string
    address: string
  }
  claim: ClaimedOffer
  onClose: () => void
  onCancelOffer: (offerId: string) => void
  onCheckIn?: (offerId: string) => void
  /** When user chose Bolt DineOut at claim time, opens the in-app pay bill flow (parent provides navigation). */
  onPayWithBoltDineOut?: () => void
  /** After claimed-offer exit animation when opening pay bill. */
  onPayWithBoltDineOutComplete?: () => void
  /** Card/cash: parent dismisses to restaurant after venue payment. */
  onConfirmBill?: () => void
  /** After claimed-offer exit animation when confirming bill. */
  onConfirmBillComplete?: () => void
  /** When true (e.g. success sheet open on top), block interaction and a11y tree. */
  interactionLocked?: boolean
}

export interface ClaimedOfferPageHandle {
  /** Slide out, then run `after` (defaults to {@link ClaimedOfferPageProps.onClose}). */
  dismissAnimated: (after?: () => void) => void
}

/**
 * Post-claim full-screen panel (GSAP slide-in). Figma `19867:37819`.
 */
export const ClaimedOfferPage = forwardRef<
  ClaimedOfferPageHandle,
  ClaimedOfferPageProps
>(function ClaimedOfferPage(
  {
    restaurant,
    claim,
    onClose,
    onCancelOffer,
    onCheckIn,
    onPayWithBoltDineOut,
    onPayWithBoltDineOutComplete,
    onConfirmBill,
    onConfirmBillComplete,
    interactionLocked = false,
  },
  ref,
) {
  const onCloseRef = useRef(onClose)
  const onCancelOfferRef = useRef(onCancelOffer)
  const onCheckInRef = useRef(onCheckIn)
  const onPayWithBoltDineOutRef = useRef(onPayWithBoltDineOut)
  const onPayWithBoltDineOutCompleteRef = useRef(onPayWithBoltDineOutComplete)
  const onConfirmBillRef = useRef(onConfirmBill)
  const onConfirmBillCompleteRef = useRef(onConfirmBillComplete)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelPending, setCancelPending] = useState(false)
  const [cancelDialogPortal, setCancelDialogPortal] = useState<HTMLElement | null>(
    null,
  )
  const checkedIn = isClaimCheckedIn(claim)
  const claimIsForToday = isClaimedOfferForToday(claim)
  const expired = useOfferExpired(claim.offerWindowCloses)
  const offerTitle =
    claim.offerDetailLabel ?? formatClaimedOfferFoodLabel(claim.discountPercent)
  const mapsHref = googleMapsSearchUrl(restaurant.address)

  const { rootRef, scrimRef, panelRef, runExit } = useSlideInPanel(
    {
      axis: "y",
      scrimOpacity: MOTION_DETAIL_SCRIM,
      skipEnter: interactionLocked,
    },
    onCloseRef,
  )
  const closeRef = useRef<HTMLButtonElement>(null)

  const snackbar = useSnackbar()
  const snackbarAnchorRef = useRef<HTMLDivElement>(null)

  const runDismiss = useCallback(
    (after?: () => void) => {
      const closeBtn = closeRef.current
      const startPanelExit = () => runExit(after)

      if (motionReduced() || !closeBtn) {
        startPanelExit()
        return
      }

      gsap.killTweensOf(closeBtn)
      gsap.set(closeBtn, { opacity: 1 })
      gsap.to(closeBtn, {
        opacity: 0,
        duration: MOTION_MICRO_S,
        ease: EASE_STANDARD_IN,
        onComplete: startPanelExit,
        onInterrupt: startPanelExit,
      })
    },
    [runExit],
  )

  useLayoutEffect(() => {
    onCloseRef.current = onClose
    onCancelOfferRef.current = onCancelOffer
    onCheckInRef.current = onCheckIn
    onPayWithBoltDineOutRef.current = onPayWithBoltDineOut
    onPayWithBoltDineOutCompleteRef.current = onPayWithBoltDineOutComplete
    onConfirmBillRef.current = onConfirmBill
    onConfirmBillCompleteRef.current = onConfirmBillComplete
  }, [
    onClose,
    onCancelOffer,
    onCheckIn,
    onPayWithBoltDineOut,
    onPayWithBoltDineOutComplete,
    onConfirmBill,
    onConfirmBillComplete,
  ])

  useImperativeHandle(
    ref,
    () => ({
      dismissAnimated: (after) => {
        runDismiss(after ?? (() => onCloseRef.current()))
      },
    }),
    [runDismiss],
  )

  useLayoutEffect(() => {
    setCancelDialogPortal(rootRef.current)
  }, [rootRef])

  const handleAnimatedClose = useCallback(() => {
    runDismiss()
  }, [runDismiss])

  const handleConfirmCancel = useCallback(async () => {
    if (cancelPending) return
    const offerId = claim.offerId
    setCancelPending(true)
    try {
      await cancelOffer(offerId)
      setCancelDialogOpen(false)
      snackbar.add({
        description: "Offer cancelled",
        timeout: 4000,
      })
      runDismiss(() => {
        onCancelOfferRef.current(offerId)
      })
    } catch {
      snackbar.add({
        description: "Could not cancel offer. Try again.",
        timeout: 4000,
      })
    } finally {
      setCancelPending(false)
    }
  }, [cancelPending, claim.offerId, runDismiss, snackbar])

  const handleCheckIn = useCallback(() => {
    if (expired || checkedIn || !claimIsForToday) return
    onCheckInRef.current?.(claim.offerId)
    scheduleSnackbarAdd(
      snackbar.add,
      createClaimedOfferCheckInSnackbar(restaurant.name),
    )
  }, [checkedIn, claim.offerId, claimIsForToday, expired, restaurant.name, snackbar])

  const handlePay = useCallback(() => {
    if (!checkedIn || !onPayWithBoltDineOutRef.current) return
    onPayWithBoltDineOutRef.current()
    runDismiss(() => {
      onPayWithBoltDineOutCompleteRef.current?.()
    })
  }, [checkedIn, runDismiss])

  const handleConfirmBill = useCallback(() => {
    if (!checkedIn) return
    if (!onConfirmBillRef.current && !onConfirmBillCompleteRef.current) return
    onConfirmBillRef.current?.()
    runDismiss(() => {
      onConfirmBillCompleteRef.current?.()
    })
  }, [checkedIn, runDismiss])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 mx-auto box-border flex w-full max-w-[var(--shell-width)] flex-col"
      style={{
        zIndex: Z_CLAIMED_OFFER_PAGE,
        minHeight: "var(--app-h)",
        // Vaul/Radix may leave `pointer-events: none` on <body> after the claim
        // drawer. Close has `pointer-events-auto`; Check in does not — without
        // this, check-in is untappable while the X still works.
        pointerEvents: interactionLocked ? "none" : "auto",
      }}
      role="region"
      aria-label={`Claimed offer at ${restaurant.name}`}
      {...(interactionLocked ? { inert: true as const } : {})}
    >
      <div
        ref={scrimRef}
        className="pointer-events-none absolute inset-0 z-0 bg-black/15"
        style={motionReduced() ? { opacity: MOTION_DETAIL_SCRIM } : undefined}
        aria-hidden
      />
      <div
        ref={panelRef}
        className="relative z-[1] flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-special-brand-alt"
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={handleAnimatedClose}
          className={claimedOfferLayout.fixedClose}
        >
          <Cross size="md" className="text-static-key-dark" aria-hidden />
        </button>

        <div className={claimedOfferLayout.pageScroll}>
          <ClaimedOfferHeroSection
            restaurantName={restaurant.name}
            mapsHref={mapsHref}
          />

          <div className={claimedOfferLayout.shelfFloor}>
            <div data-mode="light" className={claimedOfferLayout.howToUseCard}>
              <ClaimedOfferHowToUseSection
                discountPercent={claim.discountPercent}
                pin={claim.pin}
                checkedIn={checkedIn}
                expired={expired}
                claimIsForToday={claimIsForToday}
                paymentMethod={claim.paymentMethod}
                cashbackPercent={claim.discountAddPercent}
                onCheckIn={handleCheckIn}
                onPay={handlePay}
                onConfirmBill={handleConfirmBill}
              />
            </div>

            <CardDivider />

            <div data-mode="light" className={claimedOfferLayout.detailsCard}>
              <ClaimedOfferDetailsSection
                discountLabel={offerTitle}
                arrivalDate={resolveClaimedOfferDateLabel(claim)}
                arrivalTime={claim.arrivalTime}
                guestCount={claim.guestCount}
              />

              <ClaimedOfferCancelRow
                checkedIn={checkedIn}
                onCancel={() => setCancelDialogOpen(true)}
              />

              <ClaimedOfferDisclaimer
                minOrderEur={claim.minOrderEur}
                onTermsPress={() => {
                  snackbar.add({
                    description:
                      "Terms and conditions will be available in a future release.",
                    timeout: 4000,
                  })
                }}
              />
            </div>
            <div className={claimedOfferLayout.shelfFloorFill} aria-hidden />
          </div>
        </div>

        <div
          ref={snackbarAnchorRef}
          data-snackbar-anchor=""
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3] h-0"
          aria-hidden
        />
      </div>

      <Dialog
        isOpen={cancelDialogOpen}
        onRequestClose={() => {
          if (!cancelPending) setCancelDialogOpen(false)
        }}
        title="Are you sure?"
        variant="alert"
        portalContainer={cancelDialogPortal ?? undefined}
      >
        <Dialog.Content>
          <div className={claimedOfferLayout.alertDialogContent}>
            <Typography variant="body-m-regular" color="secondary" as="p" align="center">
              {"You\u2019ll lose this offer"}
            </Typography>
            <div className={claimedOfferLayout.alertDialogButtonStack}>
              <Button
                fullWidth
                variant="danger"
                size="lg"
                disabled={cancelPending}
                onClick={() => void handleConfirmCancel()}
              >
                Cancel offer
              </Button>
              <Button
                fullWidth
                variant="secondary"
                size="lg"
                disabled={cancelPending}
                onClick={() => setCancelDialogOpen(false)}
              >
                Back
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  )
})
