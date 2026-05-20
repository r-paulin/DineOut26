import { Button, Typography } from "@bolteu/kalep-react"
import { CLAIMED_OFFER_CARD_CASH_DONE_LABEL } from "@/features/offers/constants/claimedOfferCopy"
import { VAUL_SHEET_FOOTER_CLASS } from "@/shared/utils/vaulAppSheetShell"

export interface ClaimedOfferCardCashFooterProps {
  expired: boolean
  onDone: () => void
}

/** Figma `16167:23901` — fixed Done when paying by card or cash at the venue. */
export function ClaimedOfferCardCashFooter({
  expired,
  onDone,
}: ClaimedOfferCardCashFooterProps) {
  return (
    <div className={`pointer-events-auto absolute inset-x-0 bottom-0 z-[3] ${VAUL_SHEET_FOOTER_CLASS}`}>
      <div className={expired ? "opacity-50" : undefined}>
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          disabled={expired}
          aria-label={
            expired ?
              "Offer expired"
            : `${CLAIMED_OFFER_CARD_CASH_DONE_LABEL}, return to home`
          }
          onClick={onDone}
        >
          <Typography variant="body-l-accent" color="primary-inverted" as="span">
            {expired ? "Offer expired" : CLAIMED_OFFER_CARD_CASH_DONE_LABEL}
          </Typography>
        </Button>
      </div>
    </div>
  )
}
