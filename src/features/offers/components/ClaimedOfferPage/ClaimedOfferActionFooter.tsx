import { Button, Typography } from "@bolteu/kalep-react"
import CashbackColoured from "@bolteu/kalep-react-icons/dist/CashbackColoured"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  CLAIMED_OFFER_IVE_PAID_LABEL,
  CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_LEAD,
  CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_TAIL,
  CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE_LEAD,
  CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE_TAIL,
} from "@/features/offers/constants/claimedOfferCopy"
import type { PaymentMethod } from "@/features/offers/offers.types"
import type { RefObject } from "react"

export interface ClaimedOfferActionFooterProps {
  anchorRef: RefObject<HTMLDivElement | null>
  paymentMethod: PaymentMethod
  expired: boolean
  onPay: () => void
  onConfirmBill: () => void
}

/** Figma `17459:185244` / `185397` — pay footer after venue check-in. */
export function ClaimedOfferActionFooter({
  anchorRef,
  paymentMethod,
  expired,
  onPay,
  onConfirmBill,
}: ClaimedOfferActionFooterProps) {
  const isDineout = paymentMethod === "dineout"

  const promoLead =
    isDineout ?
      CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_LEAD
    : CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE_LEAD

  const promoTail =
    isDineout ?
      CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_TAIL
    : CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE_TAIL

  const primaryLabel =
    expired ?
      "Offer expired"
    : isDineout ?
      "Pay bill"
    : CLAIMED_OFFER_IVE_PAID_LABEL

  const ariaLabel =
    expired ?
      "Offer expired, payment unavailable"
    : isDineout ?
      "Pay bill via Bolt Food app"
    : CLAIMED_OFFER_IVE_PAID_LABEL

  const handlePrimary = isDineout ? onPay : onConfirmBill

  return (
    <div
      ref={anchorRef}
      data-snackbar-anchor=""
      className={claimedOfferLayout.stickyFooter}
    >
      <div className={claimedOfferLayout.stickyFooterPromoRow}>
        {isDineout ?
          <CashbackColoured size="sm" className="shrink-0" aria-hidden />
        : null}
        <Typography variant="body-s-regular" color="primary" as="p" align="center">
          <b>{promoLead}</b>
          {` ${promoTail}`}
        </Typography>
      </div>

      <div className={expired ? "opacity-50" : undefined}>
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          disabled={expired}
          aria-label={ariaLabel}
          onClick={handlePrimary}
        >
          <Typography variant="body-l-accent" color="primary-inverted" as="span">
            {primaryLabel}
          </Typography>
        </Button>
      </div>
    </div>
  )
}
