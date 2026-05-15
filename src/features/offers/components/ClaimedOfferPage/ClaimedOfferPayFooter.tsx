import { Button, Typography } from "@bolteu/kalep-react"
import PercentFlower from "@bolteu/kalep-react-icons/dist/PercentFlower"
import type { RefObject } from "react"
import { DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT } from "@/features/offers/constants/dineOutStackablePromo"

export interface ClaimedOfferPayFooterProps {
  anchorRef: RefObject<HTMLDivElement | null>
  expired: boolean
  onPay: () => void
}

/** Figma PayBill sticky footer — primary CTA + promo helper (dineout only). */
export function ClaimedOfferPayFooter({
  anchorRef,
  expired,
  onPay,
}: ClaimedOfferPayFooterProps) {
  return (
    <div
      ref={anchorRef}
      data-snackbar-anchor=""
      className="pointer-events-auto absolute bottom-0 left-0 right-0 z-[2] flex flex-col gap-3 border-t border-separator bg-layer-floor-1 px-6 pb-[max(2rem,var(--safe-area-bottom))] pt-4"
    >
      <div className={expired ? "opacity-50" : undefined}>
        <Button
          type="button"
          variant="primary"
          fullWidth
          disabled={expired}
          aria-label="Pay bill with DineOut"
          onClick={onPay}
          overrideClassName="!h-14 !min-h-14 rounded-full"
        >
          Pay bill with DineOut
        </Button>
      </div>
      <div className="flex items-center justify-center gap-1">
        <PercentFlower size="sm" className="shrink-0 text-action-primary" aria-hidden />
        <Typography variant="body-xs-regular" color="primary" as="p" align="center">
          {DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT}
        </Typography>
      </div>
    </div>
  )
}
