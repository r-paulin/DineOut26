import { Typography } from "@bolteu/kalep-react"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import {
  CLAIMED_OFFER_DISCLAIMER_DISCOUNT_COMBINATION,
  CLAIMED_OFFER_DISCLAIMER_VALIDITY,
} from "@/features/offers/constants/claimedOfferCopy"

export interface ClaimedOfferDisclaimerProps {
  onTermsPress: () => void
}

/** Figma `20886:109714` — offer disclaimer block. */
export function ClaimedOfferDisclaimer({
  onTermsPress,
}: ClaimedOfferDisclaimerProps) {
  return (
    <div className={claimedOfferLayout.disclaimer}>
      <Typography variant="body-s-regular" color="secondary" as="p">
        {CLAIMED_OFFER_DISCLAIMER_VALIDITY}
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="p">
        {CLAIMED_OFFER_DISCLAIMER_DISCOUNT_COMBINATION}
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
