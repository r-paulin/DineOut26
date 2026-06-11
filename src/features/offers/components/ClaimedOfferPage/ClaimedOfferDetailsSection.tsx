import { Typography } from "@bolteu/kalep-react"
import Calendar from "@bolteu/kalep-react-icons/dist/Calendar"
import Payment from "@bolteu/kalep-react-icons/dist/Payment"
import Pool from "@bolteu/kalep-react-icons/dist/Pool"
import type { ReactElement } from "react"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  ROW_ICON_CLASS,
  formatClaimedOfferPaymentLabel,
  formatGuestCountLabel,
} from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import { CLAIMED_OFFER_PAYMENT_CHANGE_LABEL } from "@/features/offers/constants/claimedOfferCopy"

export interface ClaimedOfferDetailsSectionProps {
  arrivalDate: string
  arrivalTime: string
  guestCount: number
  paymentMethod: PaymentMethod
  onPaymentMethodPress?: () => void
}

/** Figma `17459:*` — icon + value rows (no label stack). */
export function ClaimedOfferDetailsSection({
  arrivalDate,
  arrivalTime,
  guestCount,
  paymentMethod,
  onPaymentMethodPress,
}: ClaimedOfferDetailsSectionProps) {
  const paymentValue = formatClaimedOfferPaymentLabel(paymentMethod)
  const guestValue = formatGuestCountLabel(guestCount)
  const dateValue = `${arrivalDate} · ${arrivalTime}`

  return (
    <section
      className={claimedOfferLayout.offerDetailsBlock}
      aria-label="Offer details"
    >
      <ul className={claimedOfferLayout.detailsList}>
        <ClaimedOfferDetailRow
          icon={<Calendar size="md" className={ROW_ICON_CLASS} aria-hidden />}
          value={dateValue}
          ariaLabel={`Date, ${dateValue}`}
        />
        <ClaimedOfferDetailRow
          icon={<Pool size="md" className={ROW_ICON_CLASS} aria-hidden />}
          value={guestValue}
          ariaLabel={`Number of people, ${guestValue}`}
        />
        <ClaimedOfferDetailRow
          icon={<Payment size="md" className={ROW_ICON_CLASS} aria-hidden />}
          value={paymentValue}
          trailingActionLabel={
            onPaymentMethodPress ?
              CLAIMED_OFFER_PAYMENT_CHANGE_LABEL
            : undefined
          }
          interactive={Boolean(onPaymentMethodPress)}
          onPress={onPaymentMethodPress}
          ariaLabel={
            onPaymentMethodPress ?
              `Change payment method, currently ${paymentValue}`
            : `Payment method, ${paymentValue}`
          }
        />
      </ul>
    </section>
  )
}

interface ClaimedOfferDetailRowProps {
  icon: ReactElement
  value: string
  trailingActionLabel?: string
  interactive?: boolean
  onPress?: () => void
  showSeparator?: boolean
  ariaLabel: string
}

function ClaimedOfferDetailRow({
  icon,
  value,
  trailingActionLabel,
  interactive = false,
  onPress,
  showSeparator = true,
  ariaLabel,
}: ClaimedOfferDetailRowProps) {
  const rowClass = `${claimedOfferLayout.pagePx} flex w-full items-center gap-3 pt-4 pb-[15px] text-left`
  const body = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {icon}
        <Typography variant="body-m-regular" color="primary" as="span">
          {value}
        </Typography>
      </div>
      {trailingActionLabel ?
        <span className="shrink-0">
          <Typography
            variant="body-m-accent"
            color="action-primary"
            as="span"
            noWrap
          >
            {trailingActionLabel}
          </Typography>
        </span>
      : null}
    </>
  )

  return (
    <li className="m-0 p-0">
      {interactive && onPress ?
        <button
          type="button"
          className={`${rowClass} cursor-pointer border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-action-primary`}
          aria-label={ariaLabel}
          onClick={onPress}
        >
          {body}
        </button>
      : <div className={rowClass} aria-label={ariaLabel}>
          {body}
        </div>
      }
      {showSeparator ?
        <div className={claimedOfferLayout.detailRowSeparator}>
          <div className={claimedOfferLayout.detailRowSeparatorLine} aria-hidden />
        </div>
      : null}
    </li>
  )
}
