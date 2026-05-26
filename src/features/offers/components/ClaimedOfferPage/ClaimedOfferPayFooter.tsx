import { Button, Typography } from "@bolteu/kalep-react"
import CashbackColoured from "@bolteu/kalep-react-icons/dist/CashbackColoured"
import type { RefObject } from "react"
import { formatClaimedOfferDiscountSubtitle } from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import { formatClaimedOfferFooterPromoText } from "@/features/offers/constants/claimedOfferCopy"

export interface ClaimedOfferPayFooterProps {
  anchorRef: RefObject<HTMLDivElement | null>
  discountPercent: number
  expired: boolean
  onPay: () => void
}

/** Figma claimed-offer pay stack — CTA + footer promo (`16364:29753`). */
export function ClaimedOfferPayFooter({
  anchorRef,
  discountPercent,
  expired,
  onPay,
}: ClaimedOfferPayFooterProps) {
  const discountSubtitle = formatClaimedOfferDiscountSubtitle(discountPercent)
  const ariaLabel =
    expired ?
      "Offer expired, payment unavailable"
    : `Pay bill with Bolt DineOut, ${discountSubtitle}`

  return (
    <div
      ref={anchorRef}
      data-snackbar-anchor=""
      className="pointer-events-auto absolute bottom-0 left-0 right-0 z-[3] flex flex-col gap-3 bg-layer-floor-1 px-6 pb-[max(2rem,var(--safe-area-bottom))] pt-4"
    >
      <div className={expired ? "opacity-50" : undefined}>
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          disabled={expired}
          aria-label={ariaLabel}
          onClick={onPay}
        >
          {expired ?
            <Typography variant="body-l-accent" color="primary-inverted" as="span">
              Offer expired
            </Typography>
          : <span className="flex flex-col items-center gap-0">
              <Typography variant="body-l-accent" color="primary-inverted" as="span">
                Pay bill
              </Typography>
              <Typography variant="body-xs-regular" color="primary-inverted" as="span">
                {discountSubtitle}
              </Typography>
            </span>
          }
        </Button>
      </div>
      <div className="flex items-center justify-center gap-1">
        <CashbackColoured size="sm" className="shrink-0" aria-hidden />
        <Typography variant="body-s-regular" color="primary" as="p" align="center">
          {formatClaimedOfferFooterPromoText()}
        </Typography>
      </div>
    </div>
  )
}
