import { Typography } from "@bolteu/kalep-react"
import { useSnackbar } from "@/shared/snackbar"

export function ClaimModalDisclaimer() {
  const snackbar = useSnackbar()

  return (
    <div className="flex flex-col px-6 pb-6 pt-0">
      <div className="h-px w-full shrink-0 bg-separator" aria-hidden />
      <div className="flex flex-col gap-3 pt-3">
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
    </div>
  )
}
