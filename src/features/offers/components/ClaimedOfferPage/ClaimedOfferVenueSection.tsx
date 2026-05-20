import { Typography } from "@bolteu/kalep-react"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import { SEMIBOLD } from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import { ListItem } from "@/shared/components/ListItem"

export interface ClaimedOfferVenueSectionProps {
  restaurantName: string
  address: string
  phone: string
  mapsHref: string
  telHref: string | null
}

/** Figma `16123:18340` — venue name, address, phone. */
export function ClaimedOfferVenueSection({
  restaurantName,
  address,
  phone,
  mapsHref,
  telHref,
}: ClaimedOfferVenueSectionProps) {
  return (
    <section className={claimedOfferLayout.venueBlock}>
      <div className={claimedOfferLayout.sectionHeadingPx}>
        <Typography
          variant="heading-s-accent"
          color="primary"
          as="h2"
          inlineStyle={SEMIBOLD}
        >
          {restaurantName}
        </Typography>
      </div>
      <ul className="m-0 mt-2 flex list-none flex-col p-0">
        <li className="m-0 p-0">
          <ListItem
            label="Address"
            value={address}
            href={mapsHref}
            external
            showSeparator
            horizontalPadding="none"
            className={claimedOfferLayout.sectionHeadingPx}
            aria-label={`Open address in Google Maps: ${address}`}
          />
        </li>
        <li className="m-0 p-0">
          {telHref ?
            <ListItem
              label="Phone"
              value={phone}
              href={telHref}
              showSeparator
              horizontalPadding="none"
              className={claimedOfferLayout.sectionHeadingPx}
              aria-label={`Call ${phone}`}
            />
          : <ListItem
              label="Phone"
              value={phone}
              showSeparator
              interactive={false}
              horizontalPadding="none"
              className={claimedOfferLayout.sectionHeadingPx}
            />
          }
        </li>
      </ul>
    </section>
  )
}
