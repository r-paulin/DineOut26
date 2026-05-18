import { Button, Dialog, Typography } from "@bolteu/kalep-react"
import { CustomEase } from "gsap/CustomEase"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { ClaimedOfferCancelRow } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferCancelRow"
import { ClaimedOfferDetailsSection } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferDetailsSection"
import { ClaimedOfferDisclaimer } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferDisclaimer"
import { ClaimedOfferGettingThereSection } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferGettingThereSection"
import { ClaimedOfferNavBar } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferNavBar"
import { ClaimedOfferPayFooter } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferPayFooter"
import { ClaimedOfferPinCard } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferPinCard"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { cancelOffer } from "@/features/offers/utils/claimOffer"
import { Z_CLAIMED_OFFER_PAGE } from "@/features/restaurant/constants/screenLayers"
import { CardDivider } from "@/shared/components/CardDivider"
import { useSlideInPanel } from "@/shared/hooks/useSlideInPanel"
import { useSnackbar } from "@/shared/snackbar"
import { googleMapsSearchUrl } from "@/shared/utils/googleMapsSearchUrl"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"
import { toTelHref } from "@/shared/utils/telHref"
import { useOfferCountdown } from "./useOfferCountdown"

const EASE_ENTER = CustomEase.create("claimedEnter", "M0,0,C0.32,0.72,0,1,1,1")
const EASE_EXIT = CustomEase.create("claimedExit", "M0,0,C0.58,0,0.92,0.36,1,1")
const MOTION_S = 0.6
const STAGGER_PANEL_AFTER_SCRIM_S = 0
const STAGGER_SCRIM_AFTER_PANEL_EXIT_S = 0

export interface ClaimedOfferPageProps {
  restaurant: {
    name: string
    address: string
    phone: string
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
    promoText?: string
  }
  onClose: () => void
  onCancelOffer: () => void
  /** When user chose Bolt DineOut at claim time, opens the in-app pay bill flow (parent provides navigation). */
  onPayWithBoltDineOut?: () => void
  /** Reserved for nested overlays; cancel dialog portals into this page root. */
  portalContainer?: HTMLElement | null
}

/**
 * Post-claim full-screen panel (GSAP slide-in, same motion family as restaurant detail).
 */
export function ClaimedOfferPage({
  restaurant,
  claim,
  onClose,
  onCancelOffer,
  onPayWithBoltDineOut,
  portalContainer,
}: ClaimedOfferPageProps) {
  void portalContainer
  const onCloseRef = useRef(onClose)
  const onCancelOfferRef = useRef(onCancelOffer)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelDialogPortal, setCancelDialogPortal] = useState<HTMLElement | null>(
    null,
  )
  const { expired, countdownHms } = useOfferCountdown(claim.offerWindowCloses)
  const showDineOutFooter = claim.paymentMethod === "dineout"

  const { rootRef, scrimRef, panelRef, runExit } = useSlideInPanel(
    {
      motionDurationS: MOTION_S,
      easeEnter: EASE_ENTER,
      easeExit: EASE_EXIT,
      staggerPanelAfterScrimS: STAGGER_PANEL_AFTER_SCRIM_S,
      staggerScrimAfterPanelExitS: STAGGER_SCRIM_AFTER_PANEL_EXIT_S,
    },
    onCloseRef,
  )

  const snackbar = useSnackbar()
  const snackbarAnchorRef = useRef<HTMLDivElement>(null)

  const mapsHref = googleMapsSearchUrl(restaurant.address)
  const telHref = toTelHref(restaurant.phone)

  useLayoutEffect(() => {
    onCloseRef.current = onClose
    onCancelOfferRef.current = onCancelOffer
  }, [onClose, onCancelOffer])

  useLayoutEffect(() => {
    setCancelDialogPortal(rootRef.current)
  }, [cancelDialogOpen])

  const handleAnimatedClose = useCallback(() => {
    runExit()
  }, [runExit])

  const handleConfirmCancel = useCallback(() => {
    cancelOffer(claim.offerId)
    setCancelDialogOpen(false)
    runExit(() => {
      onCancelOfferRef.current()
    })
  }, [claim.offerId, runExit])

  const handlePay = useCallback(() => {
    if (onPayWithBoltDineOut) {
      onPayWithBoltDineOut()
    }
  }, [onPayWithBoltDineOut])

  const scrollBottomPad = showDineOutFooter ? "pb-40" : "pb-8"

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 mx-auto box-border flex w-full max-w-[var(--shell-width)] flex-col"
      style={{ zIndex: Z_CLAIMED_OFFER_PAGE, minHeight: "var(--app-h)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Claimed offer at ${restaurant.name}`}
    >
      <div
        ref={scrimRef}
        className="pointer-events-none absolute inset-0 z-0 bg-black/15"
        style={prefersReducedMotion() ? { opacity: 1 } : undefined}
        aria-hidden
      />
      <div
        ref={panelRef}
        className="relative z-[1] flex min-h-0 w-full flex-1 flex-col overflow-hidden shadow-[-6px_0_20px_rgba(0,0,0,0.06)]"
      >
        <ClaimedOfferNavBar onBack={handleAnimatedClose} />

        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-layer-floor-1 ${scrollBottomPad}`}
        >
          <ClaimedOfferPinCard restaurantName={restaurant.name} pin={claim.pin} />

          <ClaimedOfferDetailsSection
            arrivalDate={claim.arrivalDate}
            arrivalTime={claim.arrivalTime}
            guestCount={claim.guestCount}
            discountPercent={claim.discountPercent}
            offerDetailLabel={claim.offerDetailLabel}
            paymentMethod={claim.paymentMethod}
            expired={expired}
            countdownHms={countdownHms}
          />

          <CardDivider />

          <ClaimedOfferGettingThereSection
            address={restaurant.address}
            phone={restaurant.phone}
            mapsHref={mapsHref}
            telHref={telHref ?? null}
          />

          <ClaimedOfferCancelRow onCancel={() => setCancelDialogOpen(true)} />

          <ClaimedOfferDisclaimer
            onTermsPress={() => {
              snackbar.add({
                description:
                  "Terms and conditions will be available in a future release.",
                timeout: 4000,
              })
            }}
          />

        </div>

        {showDineOutFooter ?
          <ClaimedOfferPayFooter
            anchorRef={snackbarAnchorRef}
            expired={expired}
            onPay={handlePay}
          />
        : null}
      </div>

      <Dialog
        isOpen={cancelDialogOpen}
        onRequestClose={() => setCancelDialogOpen(false)}
        title="Are you sure?"
        variant="alert"
        portalContainer={cancelDialogPortal ?? undefined}
      >
        <Dialog.Content>
          <div className="mx-auto flex w-full min-w-[26vw] max-w-[15.75rem] flex-col gap-4 pb-4">
            <Typography variant="body-m-regular" color="secondary" as="p" align="center">
              {"You\u2019ll lose this offer"}
            </Typography>
            <div className="flex w-full min-w-0 flex-col gap-2">
              <Button fullWidth variant="danger" onClick={handleConfirmCancel}>
                Cancel offer
              </Button>
              <Button
                fullWidth
                variant="secondary"
                size="lg"
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
}
