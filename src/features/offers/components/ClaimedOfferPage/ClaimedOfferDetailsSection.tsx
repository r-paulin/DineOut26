import { Typography } from "@bolteu/kalep-react"
import Calendar from "@bolteu/kalep-react-icons/dist/Calendar"
import Offer from "@bolteu/kalep-react-icons/dist/Offer"
import Payment from "@bolteu/kalep-react-icons/dist/Payment"
import User from "@bolteu/kalep-react-icons/dist/User"
import type { ReactElement } from "react"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  ROW_ICON_CLASS,
  SEMIBOLD,
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
}

export function ClaimedOfferDetailsSection({
  arrivalDate,
  arrivalTime,
  guestCount,
  discountPercent,
  offerDetailLabel,
  paymentMethod,
}: ClaimedOfferDetailsSectionProps) {
  const offerLabel = offerDetailLabel ?? formatClaimedOfferFoodLabel(discountPercent)
  const paymentValue = formatClaimedOfferPaymentLabel(paymentMethod)
  const guestValue = formatGuestCountLabel(guestCount)

  return (
    <section
      className={claimedOfferLayout.offerDetailsBlock}
      aria-label="Offer details"
    >
      <div className={claimedOfferLayout.sectionHeadingPx}>
        <Typography
          variant="heading-s-accent"
          color="primary"
          as="h2"
          inlineStyle={SEMIBOLD}
        >
          Offer details
        </Typography>
      </div>
      <ul className={claimedOfferLayout.detailsList}>
        <ClaimedOfferDetailRow
          icon={<Calendar size="md" className={ROW_ICON_CLASS} aria-hidden />}
          label="Date"
          value={`${arrivalDate} · ${arrivalTime}`}
        />
        <ClaimedOfferDetailRow
          icon={<User size="md" className={ROW_ICON_CLASS} aria-hidden />}
          label="Number of guests"
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
        />
      </ul>
    </section>
  )
}

interface ClaimedOfferDetailRowProps {
  icon: ReactElement
  label: string
  value: string
}

function ClaimedOfferDetailRow({ icon, label, value }: ClaimedOfferDetailRowProps) {
  return (
    <li className="m-0 p-0">
      <ListItem
        icon={icon}
        label={label}
        value={value}
        showChevron={false}
        interactive={false}
        showSeparator={false}
        horizontalPadding="none"
        className={claimedOfferLayout.sectionHeadingPx}
      />
    </li>
  )
}
