import { Button, Typography } from "@bolteu/kalep-react"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  CLAIMED_OFFER_CHECK_IN_CTA,
  CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_LEAD,
  CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_TAIL,
} from "@/features/offers/constants/claimedOfferCopy"
import type { RefObject } from "react"

export interface ClaimedOfferCheckInFooterProps {
  anchorRef: RefObject<HTMLDivElement | null>
  expired: boolean
  onCheckIn: () => void
}

/** Figma `17459:183419` / `184596` — check-in gate footer before PIN is revealed. */
export function ClaimedOfferCheckInFooter({
  anchorRef,
  expired,
  onCheckIn,
}: ClaimedOfferCheckInFooterProps) {
  return (
    <div
      ref={anchorRef}
      data-snackbar-anchor=""
      className={claimedOfferLayout.stickyFooter}
    >
      <Typography variant="body-s-regular" color="secondary" as="p" align="center">
        <b>{CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_LEAD}</b>
        {` ${CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_TAIL}`}
      </Typography>
      <div className={expired ? "opacity-50" : undefined}>
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          disabled={expired}
          aria-label={expired ? "Offer expired, check-in unavailable" : CLAIMED_OFFER_CHECK_IN_CTA}
          onClick={onCheckIn}
        >
          <Typography variant="body-l-accent" color="primary-inverted" as="span">
            {expired ? "Offer expired" : CLAIMED_OFFER_CHECK_IN_CTA}
          </Typography>
        </Button>
      </div>
    </div>
  )
}
