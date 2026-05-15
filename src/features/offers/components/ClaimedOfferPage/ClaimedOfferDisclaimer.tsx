import { Typography } from "@bolteu/kalep-react"

export interface ClaimedOfferDisclaimerProps {
  onTermsPress: () => void
}

export function ClaimedOfferDisclaimer({ onTermsPress }: ClaimedOfferDisclaimerProps) {
  return (
    <div className="flex flex-col gap-3 px-6 pb-6 pt-6">
      <Typography variant="body-s-regular" color="secondary" as="p">
        Offers may exclude some items. Bolt Food offers can&apos;t be combined with
        other offers at the venue and don&apos;t apply to delivery or pickup orders.
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="p">
        Venues may add a service charge and other{" "}
        <button
          type="button"
          className="border-none bg-transparent p-0 text-left text-action-primary underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
          onClick={onTermsPress}
        >
          Terms and Conditions
        </button>{" "}
        may apply.
      </Typography>
    </div>
  )
}
