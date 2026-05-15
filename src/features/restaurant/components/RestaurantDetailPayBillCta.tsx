import { Button, Typography } from "@bolteu/kalep-react"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface RestaurantDetailPayBillCtaProps {
  onPayBill?: () => void
}

/**
 * Figma `16004:24690` — intro, primary “Pay with DineOut”, acceptance row.
 */
export function RestaurantDetailPayBillCta({
  onPayBill,
}: RestaurantDetailPayBillCtaProps) {
  return (
    <div className="flex w-full flex-col items-center gap-3 px-6 pb-6 pt-3">
      <div className="max-w-[14rem]">
        <Typography
          variant="body-s-accent"
          color="primary"
          as="p"
          align="center"
          inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
        >
          Enjoy your meal. Save when you pay with DineOut.
        </Typography>
      </div>
      <Button
        type="button"
        variant="primary"
        fullWidth
        onClick={onPayBill}
        overrideClassName="!h-14 !min-h-14 rounded-full"
      >
        Pay with DineOut
      </Button>
      <div className="flex w-full items-center justify-center gap-1">
        <CheckCircle size="sm" className="shrink-0 text-action-primary" aria-hidden />
        <Typography
          variant="body-xs-regular"
          color="primary"
          align="center"
          as="p"
          inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
        >
          This restaurant accepts DineOut payments
        </Typography>
      </div>
    </div>
  )
}
