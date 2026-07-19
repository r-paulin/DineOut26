import { Typography } from "@bolteu/kalep-react"
import { formatClaimModalDisclaimerValidityLine } from "@/features/offers/utils/formatClaimModalOfferDetailRows"
import { useSnackbar } from "@/shared/snackbar"

export interface ClaimModalDisclaimerProps {
  date: string
  timeWindow: string
}

/** Figma `16142:22260` — Offer / Disclaimer. */
export function ClaimModalDisclaimer({
  date,
  timeWindow,
}: ClaimModalDisclaimerProps) {
  const snackbar = useSnackbar()
  const validityLine = formatClaimModalDisclaimerValidityLine(date, timeWindow)

  return (
    <div className="flex w-full flex-col gap-3 px-6 pb-3 pt-0">
      <Typography variant="body-s-regular" color="secondary" as="p">
        {validityLine}
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="p">
        Offers are valid only for the selected number of guests and arrival time.
        During busy periods, you may need to wait for a table.
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="p">
        Only one discount can be used per bill. But cashback and other payment
        rewards can be combined where eligible.
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="p">
        Venues may add a service charge and other{" "}
        <button
          type="button"
          className="inline border-none bg-transparent p-0 align-baseline text-action-primary underline underline-offset-2 transition-opacity hover:opacity-90 active:opacity-80"
          onClick={() => {
            snackbar.add({
              description:
                "Terms and conditions will be available in a future release.",
              timeout: 4000,
            })
          }}
        >
          <Typography as="span" variant="body-s-regular" color="action-primary">
            Terms and Conditions
          </Typography>
        </button>{" "}
        may apply.
      </Typography>
    </div>
  )
}
