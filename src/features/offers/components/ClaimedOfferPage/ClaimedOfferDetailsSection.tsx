import Calendar from "@bolteu/kalep-react-icons/dist/Calendar"
import Payment from "@bolteu/kalep-react-icons/dist/Payment"
import Pool from "@bolteu/kalep-react-icons/dist/Pool"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { ClaimedOfferDiscountRow } from "@/features/offers/components/ClaimedOfferPage/ClaimedOfferDiscountRow"
import { formatOfferWindowClosesLabel } from "@/features/offers/components/ClaimedOfferPage/useOfferCountdown"
import {
  ROW_ICON_CLASS,
  formatClaimedOfferMenuLabel,
} from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import { ListItem } from "@/shared/components/ListItem"

export interface ClaimedOfferDetailsSectionProps {
  arrivalDate: string
  arrivalTime: string
  guestCount: number
  discountPercent: number
  offerDetailLabel?: string
  paymentMethod: PaymentMethod
  expired: boolean
  countdownHms: string
}

export function ClaimedOfferDetailsSection({
  arrivalDate,
  arrivalTime,
  guestCount,
  discountPercent,
  offerDetailLabel,
  paymentMethod,
  expired,
  countdownHms,
}: ClaimedOfferDetailsSectionProps) {
  const countdownLabel = formatOfferWindowClosesLabel(expired, countdownHms)
  const offerLabel =
    offerDetailLabel ?? formatClaimedOfferMenuLabel(discountPercent)
  const paymentValue =
    paymentMethod === "dineout" ? "Pay with Bolt DineOut" : "Pay by card or cash"

  return (
    <ul className="m-0 flex list-none flex-col p-0 pb-6">
      <li className="m-0 p-0">
        <ListItem
          icon={<Calendar size="md" className={ROW_ICON_CLASS} aria-hidden />}
          lineOrder="valueFirst"
          label={countdownLabel}
          value={`${arrivalDate} · ${arrivalTime}`}
          labelColor={expired ? "danger-primary" : "secondary"}
          showChevron={false}
          interactive={false}
          showSeparator={false}
        />
      </li>
      <li className="m-0 p-0">
        <ListItem
          icon={<Pool size="md" className={ROW_ICON_CLASS} aria-hidden />}
          lineOrder="valueFirst"
          label="Table availability depends on the venue"
          value={`${guestCount} guests`}
          showChevron={false}
          interactive={false}
          showSeparator={false}
        />
      </li>
      <li className="m-0 p-0">
        <ClaimedOfferDiscountRow label={offerLabel} />
      </li>
      <li className="m-0 p-0">
        <ListItem
          icon={<Payment size="md" className={ROW_ICON_CLASS} aria-hidden />}
          lineOrder="valueFirst"
          label=""
          value={paymentValue}
          showChevron={false}
          interactive={false}
          showSeparator={false}
        />
      </li>
    </ul>
  )
}
