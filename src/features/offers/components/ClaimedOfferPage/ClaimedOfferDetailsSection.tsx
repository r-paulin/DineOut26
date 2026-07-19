import { Typography } from "@bolteu/kalep-react"
import Calendar from "@bolteu/kalep-react-icons/dist/Calendar"
import Offer from "@bolteu/kalep-react-icons/dist/Offer"
import Pool from "@bolteu/kalep-react-icons/dist/Pool"
import type { ReactElement } from "react"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  ROW_ICON_CLASS,
  formatGuestCountLabel,
} from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"

export interface ClaimedOfferDetailsSectionProps {
  /** Discount line, e.g. "20% off your bill" (Figma offer row). */
  discountLabel: string
  arrivalDate: string
  arrivalTime: string
  guestCount: number
}

/** Figma `19867:37819` — Offer details (discount + date + guests). */
export function ClaimedOfferDetailsSection({
  discountLabel,
  arrivalDate,
  arrivalTime,
  guestCount,
}: ClaimedOfferDetailsSectionProps) {
  const guestValue = formatGuestCountLabel(guestCount)
  const dateValue = `${arrivalDate} · ${arrivalTime}`

  return (
    <section
      className={claimedOfferLayout.offerDetailsBlock}
      aria-labelledby="claimed-offer-details-heading"
    >
      <div className="px-6 pb-3 pt-6">
        <h2
          id="claimed-offer-details-heading"
          className={claimedOfferLayout.sectionHeading}
        >
          Offer details
        </h2>
      </div>
      <ul className={claimedOfferLayout.detailsList}>
        <ClaimedOfferDetailRow
          icon={<Offer size="md" className={ROW_ICON_CLASS} aria-hidden />}
          value={discountLabel}
        />
        <ClaimedOfferDetailRow
          icon={<Calendar size="md" className={ROW_ICON_CLASS} aria-hidden />}
          value={dateValue}
        />
        <ClaimedOfferDetailRow
          icon={<Pool size="md" className={ROW_ICON_CLASS} aria-hidden />}
          value={guestValue}
        />
      </ul>
    </section>
  )
}

interface ClaimedOfferDetailRowProps {
  icon: ReactElement
  value: string
  showSeparator?: boolean
}

function ClaimedOfferDetailRow({
  icon,
  value,
  showSeparator = true,
}: ClaimedOfferDetailRowProps) {
  return (
    <li className="m-0 p-0">
      <div
        className={`${claimedOfferLayout.pagePx} flex w-full items-center gap-3 pt-4 pb-[15px] text-left`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {icon}
          <Typography variant="body-m-regular" color="primary" as="span">
            {value}
          </Typography>
        </div>
      </div>
      {showSeparator ?
        <div className={claimedOfferLayout.detailRowSeparator}>
          <div
            className={claimedOfferLayout.detailRowSeparatorLine}
            aria-hidden
          />
        </div>
      : null}
    </li>
  )
}
