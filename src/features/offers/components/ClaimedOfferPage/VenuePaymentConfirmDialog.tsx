import { Button, Dialog, Typography } from "@bolteu/kalep-react"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  VENUE_PAYMENT_CONFIRM_BODY,
  VENUE_PAYMENT_CONFIRM_PRIMARY_CTA,
  VENUE_PAYMENT_CONFIRM_SECONDARY_CTA,
  VENUE_PAYMENT_CONFIRM_TITLE,
} from "@/features/offers/constants/claimedOfferCopy"

export interface VenuePaymentConfirmDialogProps {
  isOpen: boolean
  onRequestClose: () => void
  portalContainer?: HTMLElement
  onConfirmVenue: () => void
  onConfirmBoltFood: () => void
}

/** Figma `17475:185868` — confirm switching from Bolt Food to venue payment. */
export function VenuePaymentConfirmDialog({
  isOpen,
  onRequestClose,
  portalContainer,
  onConfirmVenue,
  onConfirmBoltFood,
}: VenuePaymentConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={VENUE_PAYMENT_CONFIRM_TITLE}
      variant="alert"
      portalContainer={portalContainer}
    >
      <Dialog.Content>
        <div className={claimedOfferLayout.alertDialogContent}>
          <Typography variant="body-m-regular" color="primary" as="p" align="center">
            {VENUE_PAYMENT_CONFIRM_BODY}
          </Typography>
          <div className={claimedOfferLayout.alertDialogButtonStack}>
            <Button fullWidth variant="danger" onClick={onConfirmVenue}>
              {VENUE_PAYMENT_CONFIRM_PRIMARY_CTA}
            </Button>
            <Button fullWidth variant="secondary" size="lg" onClick={onConfirmBoltFood}>
              {VENUE_PAYMENT_CONFIRM_SECONDARY_CTA}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  )
}
