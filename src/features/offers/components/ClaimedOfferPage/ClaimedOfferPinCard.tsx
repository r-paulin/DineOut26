import { Typography } from "@bolteu/kalep-react"
import { BoltDineOutLogo } from "@/features/offers/components/ClaimedOfferPage/BoltDineOutLogo"
import {
  PIN_DISPLAY_STYLE,
  SEMIBOLD,
} from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"

export interface ClaimedOfferPinCardProps {
  restaurantName: string
  pin: string
}

/** Figma PageContent / Top — logo, PIN group with venue name inside card. */
export function ClaimedOfferPinCard({
  restaurantName,
  pin,
}: ClaimedOfferPinCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-3">
      <BoltDineOutLogo />
      <div className="flex w-full flex-col items-center gap-2 rounded-[12px] bg-neutral-secondary px-6 py-5 text-center">
        <Typography
          variant="heading-xs-accent"
          color="primary"
          as="p"
          align="center"
          inlineStyle={SEMIBOLD}
        >
          {restaurantName}
        </Typography>
        <Typography variant="body-s-regular" color="secondary" as="p" align="center">
          Show this PIN to the waiter when you arrive
        </Typography>
        <Typography
          variant="body-m-regular"
          color="primary"
          as="p"
          align="center"
          inlineStyle={PIN_DISPLAY_STYLE}
        >
          {pin}
        </Typography>
      </div>
    </div>
  )
}
