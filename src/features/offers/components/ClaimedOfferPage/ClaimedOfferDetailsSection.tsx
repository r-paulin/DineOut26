import Calendar from "@bolteu/kalep-react-icons/dist/Calendar"
import Offer from "@bolteu/kalep-react-icons/dist/Offer"
import Payment from "@bolteu/kalep-react-icons/dist/Payment"
import Pool from "@bolteu/kalep-react-icons/dist/Pool"
import type { ReactElement } from "react"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  ROW_ICON_CLASS,
  formatClaimedOfferFoodLabel,
  formatClaimedOfferPaymentLabel,
  formatGuestCountLabel,
} from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import { ListItem } from "@/shared/components/ListItem"

export interface ClaimedOfferDetailsSectionProps {
  arrivalDate: string
  arrivalTime: string
  guestCount: number
  discountPercent: number
  offerDetailLabel?: string
  paymentMethod: PaymentMethod
  onPaymentMethodPress?: () => void
}

export function ClaimedOfferDetailsSection({
  arrivalDate,
  arrivalTime,
  guestCount,
  discountPercent,
  offerDetailLabel,
  paymentMethod,
  onPaymentMethodPress,
}: ClaimedOfferDetailsSectionProps) {
  const offerLabel = offerDetailLabel ?? formatClaimedOfferFoodLabel(discountPercent)
  const paymentValue = formatClaimedOfferPaymentLabel(paymentMethod)
  const guestValue = formatGuestCountLabel(guestCount)

  return (
    <section
      className={claimedOfferLayout.offerDetailsBlock}
      aria-label="Offer details"
    >
      <ul className={claimedOfferLayout.detailsList}>
        <ClaimedOfferDetailRow
          icon={<Calendar size="md" className={ROW_ICON_CLASS} aria-hidden />}
          label="Date"
          value={`${arrivalDate} · ${arrivalTime}`}
        />
        <ClaimedOfferDetailRow
          icon={<Pool size="md" className={ROW_ICON_CLASS} aria-hidden />}
          label="Number of people"
          value={guestValue}
        />
        <ClaimedOfferDetailRow
          icon={<Offer size="md" className={ROW_ICON_CLASS} aria-hidden />}
          label="Offer"
          value={offerLabel}
        />
        <ClaimedOfferDetailRow
          icon={<Payment size="md" className={ROW_ICON_CLASS} aria-hidden />}
          label="Payment method"
          value={paymentValue}
          showChevron={Boolean(onPaymentMethodPress)}
          interactive={Boolean(onPaymentMethodPress)}
          onPress={onPaymentMethodPress}
          ariaLabel={
            onPaymentMethodPress ?
              `Change payment method, currently ${paymentValue}`
            : undefined
          }
        />
      </ul>
    </section>
  )
}

interface ClaimedOfferDetailRowProps {
  icon: ReactElement
  label: string
  value: string
  showChevron?: boolean
  interactive?: boolean
  onPress?: () => void
  ariaLabel?: string
}

function ClaimedOfferDetailRow({
  icon,
  label,
  value,
  showChevron = false,
  interactive = false,
  onPress,
  ariaLabel,
}: ClaimedOfferDetailRowProps) {
  return (
    <li className="m-0 p-0">
      <ListItem
        icon={icon}
        iconTone="primary"
        label={label}
        value={value}
        showChevron={showChevron}
        interactive={interactive}
        onPress={onPress}
        aria-label={ariaLabel}
        showSeparator={false}
        horizontalPadding="none"
        className={claimedOfferLayout.sectionHeadingPx}
      />
    </li>
  )
}
