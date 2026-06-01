import { Button, Typography } from "@bolteu/kalep-react"
import CashbackColoured from "@bolteu/kalep-react-icons/dist/CashbackColoured"
import { useRef, type RefObject } from "react"
import { formatClaimedOfferDiscountSubtitle } from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import {
  isCashbackBannerVisible,
  useClaimedOfferCashbackBanner,
} from "@/features/offers/components/ClaimedOfferPage/useClaimedOfferCashbackBanner"
import {
  CLAIMED_OFFER_CARD_CASH_DONE_LABEL,
  CLAIMED_OFFER_CONFIRM_BILL_META,
  formatClaimedOfferFooterPromoText,
} from "@/features/offers/constants/claimedOfferCopy"
import type { PaymentMethod } from "@/features/offers/offers.types"

export interface ClaimedOfferActionFooterProps {
  anchorRef: RefObject<HTMLDivElement | null>
  paymentMethod: PaymentMethod
  discountPercent: number
  expired: boolean
  onPay: () => void
  onConfirmBill: () => void
}

/** Figma `16384:28098` — unified pay / confirm footer with GSAP cashback row. */
export function ClaimedOfferActionFooter({
  anchorRef,
  paymentMethod,
  discountPercent,
  expired,
  onPay,
  onConfirmBill,
}: ClaimedOfferActionFooterProps) {
  const isDineout = paymentMethod === "dineout"
  const discountSubtitle = formatClaimedOfferDiscountSubtitle(discountPercent)
  const bannerVisible = isCashbackBannerVisible(paymentMethod)

  const bannerSlotRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  useClaimedOfferCashbackBanner(bannerSlotRef, bannerRef, bannerVisible)

  const ariaLabel =
    expired ?
      "Offer expired, payment unavailable"
    : isDineout ?
      `Pay bill with Bolt DineOut, ${discountSubtitle}`
    : `${CLAIMED_OFFER_CARD_CASH_DONE_LABEL}, ${discountSubtitle}`

  const primaryButtonLabel =
    expired ?
      <Typography variant="body-l-accent" color="primary-inverted" as="span">
        Offer expired
      </Typography>
    : isDineout ?
      <span className="flex flex-col items-center gap-0">
        <Typography variant="body-l-accent" color="primary-inverted" as="span">
          Pay bill
        </Typography>
        <Typography variant="body-xs-regular" color="primary-inverted" as="span">
          {discountSubtitle}
        </Typography>
      </span>
    : <span className="flex flex-col items-center gap-0">
        <Typography variant="body-l-accent" color="primary-inverted" as="span">
          {CLAIMED_OFFER_CARD_CASH_DONE_LABEL}
        </Typography>
        <Typography variant="body-xs-regular" color="primary-inverted" as="span">
          {discountSubtitle}
        </Typography>
      </span>

  const handlePrimary = isDineout ? onPay : onConfirmBill

  return (
    <div
      ref={anchorRef}
      data-snackbar-anchor=""
      className="pointer-events-auto absolute bottom-0 left-0 right-0 z-[3] flex flex-col gap-3 border-t border-separator bg-layer-floor-2 px-6 pb-[max(2rem,var(--safe-area-bottom))] pt-4"
    >
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
          {primaryButtonLabel}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div ref={bannerSlotRef} className="overflow-hidden">
          <div
            ref={bannerRef}
            className="flex items-center justify-center gap-1"
            role="status"
          >
            <CashbackColoured size="sm" className="shrink-0" aria-hidden />
            <Typography variant="body-s-regular" color="primary" as="p" align="center">
              {formatClaimedOfferFooterPromoText()}
            </Typography>
          </div>
        </div>

        {!isDineout ?
          <Typography variant="body-s-regular" color="secondary" as="p" align="center">
            {CLAIMED_OFFER_CONFIRM_BILL_META}
          </Typography>
        : null}
      </div>
    </div>
  )
}
