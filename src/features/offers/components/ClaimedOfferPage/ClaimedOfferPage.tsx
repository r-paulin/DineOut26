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
import { ClaimedOfferCheckInFooter } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferCheckInFooter"
import { ClaimedOfferDetailsSection } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferDetailsSection"
import { ClaimedOfferDisclaimer } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferDisclaimer"
import { ClaimedOfferHeroSection } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferHeroSection"
import { ClaimedOfferActionFooter } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferActionFooter"
import { ClaimedOfferHowItWorksSheet } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferHowItWorksSheet"
import { ClaimedOfferPaymentMethodSheet } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferPaymentMethodSheet"
import { VenuePaymentConfirmDialog } from "@/features/offers/components/ClaimedOfferPage/VenuePaymentConfirmDialog"
import { ClaimedOfferPinBanner } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferPinBanner"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  formatClaimedOfferFoodLabel,
  isClaimCheckedIn,
} from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import { DineOutCashbackBannerSlot } from "@/features/offers/components/paymentMethod/DineOutCashbackBannerSlot"
import type { ClaimedOffer, PaymentMethod } from "@/features/offers/offers.types"
import gsap from "gsap"
import { createClaimedOfferCheckInSnackbar } from "@/features/offers/constants/claimedOfferCheckInSnackbar"
import { cancelOffer } from "@/features/offers/utils/claimOffer"
import {
  isClaimedOfferForToday,
  resolveClaimedOfferDateLabel,
} from "@/features/offers/utils/formatClaimedArrivalDate"
import { Z_CLAIMED_OFFER_PAGE } from "@/features/restaurant/constants/screenLayers"
import { AnimatedCollapse } from "@/shared/components/AnimatedCollapse"
import { useSlideInPanel } from "@/shared/hooks/useSlideInPanel"
import { scheduleSnackbarAdd, useSnackbar } from "@/shared/snackbar"
import {
  EASE_STANDARD_IN,
  MOTION_DETAIL_SCRIM,
  MOTION_MICRO_S,
} from "@/shared/motion"
import { motionReduced } from "@/shared/motion/motionHelpers"
import { useOfferExpired } from "./useOfferCountdown"

export interface ClaimedOfferPageProps {
  restaurant: {
    name: string
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
  onPaymentMethodChange?: (paymentMethod: PaymentMethod) => void
}

export interface ClaimedOfferPageHandle {
  /** Slide out, then run `after` (defaults to {@link ClaimedOfferPageProps.onClose}). */
  dismissAnimated: (after?: () => void) => void
}

/**
 * Post-claim full-screen panel (GSAP slide-in, same motion family as restaurant detail).
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
    onPaymentMethodChange,
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
  const onPaymentMethodChangeRef = useRef(onPaymentMethodChange)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [venuePaymentDialogOpen, setVenuePaymentDialogOpen] = useState(false)
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)
  const [paymentMethodSheetOpen, setPaymentMethodSheetOpen] = useState(false)
  const [sheetPortal, setSheetPortal] = useState<HTMLElement | null>(null)
  const [cancelPending, setCancelPending] = useState(false)
  const [cancelDialogPortal, setCancelDialogPortal] = useState<HTMLElement | null>(
    null,
  )
  const checkedIn = isClaimCheckedIn(claim)
  const claimIsForToday = isClaimedOfferForToday(claim)
  const expired = useOfferExpired(claim.offerWindowCloses)
  const showCardCashUpsell = claim.paymentMethod === "card_or_cash"
  const offerTitle =
    claim.offerDetailLabel ?? formatClaimedOfferFoodLabel(claim.discountPercent)

  const { rootRef, scrimRef, panelRef, runExit } = useSlideInPanel(
    { axis: "y", scrimOpacity: MOTION_DETAIL_SCRIM },
    onCloseRef,
  )
  const closeRef = useRef<HTMLButtonElement>(null)

  const snackbar = useSnackbar()
  const snackbarAnchorRef = useRef<HTMLDivElement>(null)

  /** Close chrome fades before the panel slides away (Figma exit read). */
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
    onPaymentMethodChangeRef.current = onPaymentMethodChange
  }, [
    onClose,
    onCancelOffer,
    onCheckIn,
    onPayWithBoltDineOut,
    onPayWithBoltDineOutComplete,
    onConfirmBill,
    onConfirmBillComplete,
    onPaymentMethodChange,
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
    setSheetPortal(rootRef.current)
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
    if (expired || checkedIn) return
    onCheckInRef.current?.(claim.offerId)
    scheduleSnackbarAdd(snackbar.add, createClaimedOfferCheckInSnackbar())
  }, [checkedIn, claim.offerId, expired, snackbar])

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

  const handlePaymentMethodChange = useCallback((next: PaymentMethod) => {
    onPaymentMethodChangeRef.current?.(next)
  }, [])

  const handleVenuePaymentConfirmRequest = useCallback(() => {
    setVenuePaymentDialogOpen(true)
  }, [])

  const handleConfirmVenuePayment = useCallback(() => {
    setVenuePaymentDialogOpen(false)
    handlePaymentMethodChange("card_or_cash")
  }, [handlePaymentMethodChange])

  const handleConfirmBoltFoodPayment = useCallback(() => {
    setVenuePaymentDialogOpen(false)
    handlePaymentMethodChange("dineout")
  }, [handlePaymentMethodChange])

  const handleHowItWorksPress = useCallback(() => {
    setHowItWorksOpen(true)
  }, [])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 mx-auto box-border flex w-full max-w-[var(--shell-width)] flex-col"
      style={{ zIndex: Z_CLAIMED_OFFER_PAGE, minHeight: "var(--app-h)" }}
      role="region"
      aria-label={`Claimed offer at ${restaurant.name}`}
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
            checkedIn={checkedIn}
            onHowItWorksPress={handleHowItWorksPress}
          />

          <div className={claimedOfferLayout.shelfFloor}>
            <div
              data-mode="light"
              className={`${claimedOfferLayout.lightBody} ${claimedOfferLayout.lightBodyPadWithFooter}`}
            >
              <div className={claimedOfferLayout.offerTitleBlock}>
                <Typography variant="heading-s-accent" color="primary" as="h2">
                  {offerTitle}
                </Typography>
              </div>

              <AnimatedCollapse visible={checkedIn}>
                <ClaimedOfferPinBanner pin={claim.pin} />
              </AnimatedCollapse>

              <ClaimedOfferDetailsSection
                arrivalDate={resolveClaimedOfferDateLabel(claim)}
                arrivalTime={claim.arrivalTime}
                guestCount={claim.guestCount}
                paymentMethod={claim.paymentMethod}
                onPaymentMethodPress={
                  onPaymentMethodChange ?
                    () => setPaymentMethodSheetOpen(true)
                  : undefined
                }
              />

              {showCardCashUpsell ?
                <DineOutCashbackBannerSlot
                  visible
                  className={claimedOfferLayout.cashbackUpsellWrap}
                />
              : null}

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

        {checkedIn ?
          <ClaimedOfferActionFooter
            anchorRef={snackbarAnchorRef}
            paymentMethod={claim.paymentMethod}
            expired={expired}
            onPay={handlePay}
            onConfirmBill={handleConfirmBill}
          />
        : claimIsForToday ?
          <ClaimedOfferCheckInFooter
            anchorRef={snackbarAnchorRef}
            expired={expired}
            onCheckIn={handleCheckIn}
          />
        : null}
      </div>

      <ClaimedOfferHowItWorksSheet
        open={howItWorksOpen}
        onOpenChange={setHowItWorksOpen}
        paymentMethod={claim.paymentMethod}
        container={sheetPortal}
      />

      <ClaimedOfferPaymentMethodSheet
        open={paymentMethodSheetOpen}
        onOpenChange={setPaymentMethodSheetOpen}
        value={claim.paymentMethod}
        onChange={handlePaymentMethodChange}
        onVenuePaymentConfirmRequest={handleVenuePaymentConfirmRequest}
        container={sheetPortal}
      />

      <VenuePaymentConfirmDialog
        isOpen={venuePaymentDialogOpen}
        onRequestClose={() => setVenuePaymentDialogOpen(false)}
        portalContainer={cancelDialogPortal ?? undefined}
        onConfirmVenue={handleConfirmVenuePayment}
        onConfirmBoltFood={handleConfirmBoltFoodPayment}
      />

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
