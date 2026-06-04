import { Typography } from "@bolteu/kalep-react"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import { OFFER_APPLICABLE_TOTAL_BILL_DISCLAIMER } from "@/features/offers/constants/offerApplicabilityCopy"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"

const DEFAULT_MIN_ORDER_EUR = 10

export interface ClaimedOfferDisclaimerProps {
  minOrderEur?: number
  onTermsPress: () => void
}

export function ClaimedOfferDisclaimer({
  minOrderEur = DEFAULT_MIN_ORDER_EUR,
  onTermsPress,
}: ClaimedOfferDisclaimerProps) {
  return (
    <div className={claimedOfferLayout.disclaimer}>
      <Typography variant="body-s-regular" color="secondary" as="p">
        {`Minimum order value: ${formatEurMajor(minOrderEur)}.`}
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="p">
        {OFFER_APPLICABLE_TOTAL_BILL_DISCLAIMER}
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="p">
        Offers are valid only for the selected number of guests and arrival time.
        Late arrivals or additional guests may invalidate the offer. During busy
        periods, you may need to wait for a table.
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="p">
        Only one restaurant discount may be applied per bill. DineOut cashback or
        payment rewards may be combined with restaurant discount where eligible.
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
