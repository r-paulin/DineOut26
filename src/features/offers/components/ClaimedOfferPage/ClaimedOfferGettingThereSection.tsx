import { Typography } from "@bolteu/kalep-react"
import {
  SEMIBOLD,
  boltRideUrl,
} from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import { ListItem } from "@/shared/components/ListItem"

export interface ClaimedOfferGettingThereSectionProps {
  address: string
  phone: string
  mapsHref: string
  telHref: string | null
}

export function ClaimedOfferGettingThereSection({
  address,
  phone,
  mapsHref,
  telHref,
}: ClaimedOfferGettingThereSectionProps) {
  return (
  <>
    <div className="px-6 pb-3 pt-6">
      <Typography
        variant="heading-s-accent"
        color="primary"
        as="h2"
        inlineStyle={SEMIBOLD}
      >
        Getting there
      </Typography>
    </div>
    <ul className="m-0 flex list-none flex-col p-0">
      <li className="m-0 p-0">
        <ListItem
          label="Book a Bolt ride"
          value="Get there without the parking stress"
          showSeparator
          onPress={() => {
            window.open(boltRideUrl(address), "_blank", "noopener,noreferrer")
          }}
          aria-label="Open Bolt to book a ride"
        />
      </li>
      <li className="m-0 p-0">
        <ListItem
          label="Address"
          value={address}
          href={mapsHref}
          external
          showSeparator
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
            aria-label={`Call ${phone}`}
          />
        : <ListItem
            label="Phone"
            value={phone}
            showSeparator
            interactive={false}
          />
        }
      </li>
    </ul>
  </>
  )
}
