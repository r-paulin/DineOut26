import {
  Button,
  Dialog,
  IconButton,
  Typography,
} from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import BinOutlined from "@bolteu/kalep-react-icons/dist/BinOutlined"
import Calendar from "@bolteu/kalep-react-icons/dist/Calendar"
import Payment from "@bolteu/kalep-react-icons/dist/Payment"
import Pool from "@bolteu/kalep-react-icons/dist/Pool"
import { CustomEase } from "gsap/CustomEase"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { cancelOffer } from "@/features/offers/utils/claimOffer"
import { Z_CLAIMED_OFFER_PAGE } from "@/features/restaurant/constants/screenLayers"
import { CardDivider } from "@/shared/components/CardDivider"
import { ListItem } from "@/shared/components/ListItem"
import { useSlideInPanel } from "@/shared/hooks/useSlideInPanel"
import { useSnackbar } from "@/shared/snackbar"
import { googleMapsSearchUrl } from "@/shared/utils/googleMapsSearchUrl"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"
import { toTelHref } from "@/shared/utils/telHref"
import { BoltDineOutWordmark } from "./BoltDineOutWordmark"
import { useOfferCountdown } from "./useOfferCountdown"

const EASE_ENTER = CustomEase.create("claimedEnter", "M0,0,C0.32,0.72,0,1,1,1")
const EASE_EXIT = CustomEase.create("claimedExit", "M0,0,C0.58,0,0.92,0.36,1,1")
const MOTION_S = 0.6
const STAGGER_PANEL_AFTER_SCRIM_S = 0
const STAGGER_SCRIM_AFTER_PANEL_EXIT_S = 0

const ROW_ICON_CLASS = "size-6 shrink-0 text-action-primary"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

function boltRideUrl(destination: string): string {
  return `https://bolt.eu/?dropoff=${encodeURIComponent(destination)}`
}

function cancelDialogPortalRoot(): HTMLElement | undefined {
  return typeof document !== "undefined" ? document.body : undefined
}

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
    promoText?: string
  }
  onClose: () => void
  onCancelOffer: () => void
  /** Portal target for other overlays; cancel {@link Dialog} uses `document.body` so it stacks above this full-screen layer. */
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
  portalContainer,
}: ClaimedOfferPageProps) {
  void portalContainer
  const onCloseRef = useRef(onClose)
  const onCancelOfferRef = useRef(onCancelOffer)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const { expired, countdownLive } = useOfferCountdown(claim.offerWindowCloses)

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
  const paymentPrimary =
    claim.paymentMethod === "dineout" ? "Pay with Bolt DineOut" : "Pay by card or cash"
  const paymentSubtitle =
    claim.paymentMethod === "dineout" ? (claim.promoText ?? "").trim() : ""

  const mapsHref = googleMapsSearchUrl(restaurant.address)
  const telHref = toTelHref(restaurant.phone)

  useLayoutEffect(() => {
    onCloseRef.current = onClose
    onCancelOfferRef.current = onCancelOffer
  }, [onClose, onCancelOffer])

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

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 flex w-full max-w-[var(--shell-width)] mx-auto flex-col box-border"
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
        <div className="flex shrink-0 items-center bg-layer-floor-1 px-6 pb-2 pt-[max(0.75rem,var(--safe-area-top))]">
          <IconButton
            variant="secondary"
            icon={<ArrowLeft size="md" aria-hidden />}
            aria-label="Go back"
            overrideClassName="size-10 shrink-0 rounded-full border-0 bg-static-key-light p-0 shadow-[0_0.125rem_0.1875rem_rgba(0,0,0,0.16)] hover:bg-active-neutral-secondary"
            size="sm"
            onClick={handleAnimatedClose}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-layer-floor-1 pb-36">
          <div className="flex flex-col items-center gap-3 px-6 pb-3 pt-2 text-center">
            <BoltDineOutWordmark />
            <Typography
              variant="heading-m-accent"
              color="primary"
              as="h1"
              align="center"
              inlineStyle={SEMIBOLD}
            >
              {restaurant.name}
            </Typography>
            <div className="w-full rounded-[12px] bg-neutral-secondary px-6 py-5">
              <Typography
                variant="body-s-regular"
                color="secondary"
                as="p"
                align="center"
              >
                Show this PIN to the waiter when you arrive
              </Typography>
              <div className="mt-2 text-center tracking-tight">
                <Typography
                  variant="heading-l-accent"
                  color="primary"
                  as="p"
                  align="center"
                  inlineStyle={SEMIBOLD}
                >
                  {claim.pin}
                </Typography>
              </div>
            </div>
          </div>

          <ul className="m-0 mt-2 flex list-none flex-col p-0">
            <li className="m-0 p-0">
              <div className="flex w-full flex-col border-none bg-transparent px-0 py-0 text-left">
                <div className="flex w-full items-start gap-3 px-6 pt-[10px] pb-[9px]">
                  <div className="flex shrink-0 items-center text-action-primary">
                    <Calendar size="lg" className={ROW_ICON_CLASS} aria-hidden />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0">
                    <Typography variant="body-m-regular" color="primary" as="span">
                      {`${claim.arrivalDate} · ${claim.arrivalTime}`}
                    </Typography>
                    <Typography
                      variant="body-s-regular"
                      color={expired ? "danger-primary" : "secondary"}
                      as="span"
                    >
                      {expired ? "Offer ended" : `Offer window closes in ${countdownLive}`}
                    </Typography>
                  </div>
                </div>
                <div className="box-border w-full shrink-0 px-6" aria-hidden>
                  <div className="h-px w-full bg-[var(--color-border-separator)]" />
                </div>
              </div>
            </li>
            <li className="m-0 p-0">
              <ListItem
                icon={<Pool size="lg" className={ROW_ICON_CLASS} aria-hidden />}
                lineOrder="valueFirst"
                label="Table availability depends on the venue"
                value={`${claim.guestCount} guests`}
                showChevron={false}
                interactive={false}
              />
            </li>
            <li className="m-0 px-0 pt-0 pb-6">
              <ListItem
                icon={<Payment size="lg" className={ROW_ICON_CLASS} aria-hidden />}
                lineOrder="valueFirst"
                label={paymentSubtitle}
                value={paymentPrimary}
                showChevron={false}
                interactive={false}
                showSeparator={false}
              />
            </li>
          </ul>

          <CardDivider />

          <div className="px-6 pt-6">
            <Typography
              variant="heading-xs-accent"
              color="primary"
              as="h2"
              inlineStyle={SEMIBOLD}
            >
              Getting there
            </Typography>
          </div>
          <ul className="m-0 flex list-none flex-col p-0">
            <li className="m-0 p-0">
              <ListItem
                label="Book a Bolt ride"
                value="Get there without the parking stress"
                onPress={() => {
                  window.open(boltRideUrl(restaurant.address), "_blank", "noopener,noreferrer")
                }}
                aria-label="Open Bolt to book a ride"
              />
            </li>
            <li className="m-0 p-0">
              <ListItem
                label="Address"
                value={restaurant.address}
                href={mapsHref}
                external
                aria-label={`Open address in Google Maps: ${restaurant.address}`}
              />
            </li>
            <li className="m-0 p-0">
              {telHref ? (
                <ListItem
                  label="Phone"
                  value={restaurant.phone}
                  href={telHref}
                  showSeparator={false}
                  aria-label={`Call ${restaurant.phone}`}
                />
              ) : (
                <ListItem
                  label="Phone"
                  value={restaurant.phone}
                  showSeparator={false}
                  interactive={false}
                />
              )}
            </li>
          </ul>

          <button
            type="button"
            className="mx-6 flex w-[calc(100%-3rem)] cursor-pointer flex-row items-center gap-3 border-none border-t border-separator bg-transparent px-0 py-3 text-left"
            onClick={() => setCancelDialogOpen(true)}
          >
            <BinOutlined size="lg" className="size-6 shrink-0 text-danger-primary" aria-hidden />
            <Typography variant="body-m-regular" color="danger-primary" as="span">
              Cancel offer
            </Typography>
          </button>

          <div className="flex flex-col gap-2 px-6 pb-6 pt-2">
            <Typography variant="body-xs-regular" color="secondary" as="p">
              Offers may exclude some items. Bolt Food offers can&apos;t be combined with other
              offers at the venue and don&apos;t apply to delivery or pickup orders. Venues may add
              a service charge and other{" "}
              <button
                type="button"
                className="border-none bg-transparent p-0 text-left text-action-primary underline underline-offset-2"
                onClick={() => {
                  snackbar.add({
                    description: "Terms and conditions will be available in a future release",
                    timeout: 4000,
                  })
                }}
              >
                Terms and conditions
              </button>{" "}
              may apply.
            </Typography>
          </div>
        </div>

        <div className="pointer-events-auto absolute bottom-0 left-0 right-0 z-[2] bg-layer-floor-1 px-6 pb-[max(1.5rem,var(--safe-area-bottom))] pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <div className={expired ? "opacity-50" : undefined}>
            <Button
              type="button"
              variant="primary"
              fullWidth
              disabled={expired}
              aria-label={paymentPrimary}
              onClick={() => {
                snackbar.add({
                  description:
                    claim.paymentMethod === "dineout" ?
                      "Bolt DineOut payment will be available in a future release"
                    : "In-venue card or cash payment instructions will be available in a future release",
                  timeout: 4000,
                })
              }}
            >
              {paymentPrimary}
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        isOpen={cancelDialogOpen}
        onRequestClose={() => setCancelDialogOpen(false)}
        title="Are you sure?"
        variant="alert"
        portalContainer={cancelDialogPortalRoot()}
      >
        {/*
          Actions live in Content (not Dialog.Footer): Kalep ModalFooter uses a
          horizontal flex row that prevents true full-width stacked buttons.
        */}
        <Dialog.Content>
          <div className="mx-auto flex w-full min-w-[26vw] max-w-[15.75rem] flex-col gap-4 pb-4">
            <Typography variant="body-m-regular" color="secondary" as="p" align="center">
              {"You\u2019ll lose this offer"}
            </Typography>
            <div className="flex w-full min-w-0 flex-col gap-2">
              <Button fullWidth variant="danger" onClick={handleConfirmCancel}>
                Cancel offer
              </Button>
              <Button fullWidth variant="secondary" onClick={() => setCancelDialogOpen(false)}>
                Go back
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  )
}
