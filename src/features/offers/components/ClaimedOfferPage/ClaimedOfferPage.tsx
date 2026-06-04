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
import { ClaimedOfferActionFooter } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferActionFooter"
import { ClaimedOfferPaymentMethodSheet } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferPaymentMethodSheet"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import type { PaymentMethod } from "@/features/offers/offers.types"
import gsap from "gsap"
import { cancelOffer } from "@/features/offers/utils/claimOffer"
import { Z_CLAIMED_OFFER_PAGE } from "@/features/restaurant/constants/screenLayers"
import { useSlideInPanel } from "@/shared/hooks/useSlideInPanel"
import { useSnackbar } from "@/shared/snackbar"
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
  claim: {
    offerId: string
    pin: string
    arrivalTime: string
    arrivalDate: string
    offerWindowCloses: string
    guestCount: number
    paymentMethod: PaymentMethod
    discountPercent: number
    offerDetailLabel?: string
    minOrderEur?: number
    promoText?: string
  }
  onClose: () => void
  onCancelOffer: (offerId: string) => void
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
  const onPayWithBoltDineOutRef = useRef(onPayWithBoltDineOut)
  const onPayWithBoltDineOutCompleteRef = useRef(onPayWithBoltDineOutComplete)
  const onConfirmBillRef = useRef(onConfirmBill)
  const onConfirmBillCompleteRef = useRef(onConfirmBillComplete)
  const onPaymentMethodChangeRef = useRef(onPaymentMethodChange)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [paymentMethodSheetOpen, setPaymentMethodSheetOpen] = useState(false)
  const [sheetPortal, setSheetPortal] = useState<HTMLElement | null>(null)
  const [cancelPending, setCancelPending] = useState(false)
  const [cancelDialogPortal, setCancelDialogPortal] = useState<HTMLElement | null>(
    null,
  )
  const expired = useOfferExpired(claim.offerWindowCloses)
  const hasFooter = claim.paymentMethod === "dineout" || claim.paymentMethod === "card_or_cash"

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
    onPayWithBoltDineOutRef.current = onPayWithBoltDineOut
    onPayWithBoltDineOutCompleteRef.current = onPayWithBoltDineOutComplete
    onConfirmBillRef.current = onConfirmBill
    onConfirmBillCompleteRef.current = onConfirmBillComplete
    onPaymentMethodChangeRef.current = onPaymentMethodChange
  }, [
    onClose,
    onCancelOffer,
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

  const handlePay = useCallback(() => {
    if (!onPayWithBoltDineOutRef.current) return
    onPayWithBoltDineOutRef.current()
    runDismiss(() => {
      onPayWithBoltDineOutCompleteRef.current?.()
    })
  }, [runDismiss])

  const handleConfirmBill = useCallback(() => {
    if (!onConfirmBillRef.current && !onConfirmBillCompleteRef.current) return
    onConfirmBillRef.current?.()
    runDismiss(() => {
      onConfirmBillCompleteRef.current?.()
    })
  }, [runDismiss])

  const handlePaymentMethodChange = useCallback((next: PaymentMethod) => {
    onPaymentMethodChangeRef.current?.(next)
  }, [])

  const lightBodyBottomPad =
    hasFooter ?
      claimedOfferLayout.lightBodyPadWithFooter
    : claimedOfferLayout.lightBodyPadNoFooter

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
            pin={claim.pin}
            offerWindowCloses={claim.offerWindowCloses}
          />

          <div
            data-mode="light"
            className={`${claimedOfferLayout.lightBody} ${lightBodyBottomPad}`}
          >
            <ClaimedOfferDetailsSection
              arrivalDate={claim.arrivalDate}
              arrivalTime={claim.arrivalTime}
              guestCount={claim.guestCount}
              discountPercent={claim.discountPercent}
              offerDetailLabel={claim.offerDetailLabel}
              paymentMethod={claim.paymentMethod}
              onPaymentMethodPress={
                onPaymentMethodChange ?
                  () => setPaymentMethodSheetOpen(true)
                : undefined
              }
            />

            <ClaimedOfferCancelRow onCancel={() => setCancelDialogOpen(true)} />

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
        </div>

        {hasFooter ?
          <ClaimedOfferActionFooter
            anchorRef={snackbarAnchorRef}
            paymentMethod={claim.paymentMethod}
            discountPercent={claim.discountPercent}
            expired={expired}
            onPay={handlePay}
            onConfirmBill={handleConfirmBill}
          />
        : null}
      </div>

      <ClaimedOfferPaymentMethodSheet
        open={paymentMethodSheetOpen}
        onOpenChange={setPaymentMethodSheetOpen}
        value={claim.paymentMethod}
        onChange={handlePaymentMethodChange}
        container={sheetPortal}
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
          <div className="mx-auto flex w-full min-w-0 max-w-[15.75rem] flex-col gap-4 pb-4">
            <Typography variant="body-m-regular" color="secondary" as="p" align="center">
              {"You\u2019ll lose this offer"}
            </Typography>
            <div className="flex w-full min-w-0 flex-col gap-2">
              <Button
                fullWidth
                variant="danger"
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
