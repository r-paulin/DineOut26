import { Button, Typography } from "@bolteu/kalep-react"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface RestaurantDetailPayBillCtaProps {
  onPayBill?: () => void
}

/**
 * Figma `16012:13704` — primary “Pay with DineOut”, acceptance row.
 */
export function RestaurantDetailPayBillCta({
  onPayBill,
}: RestaurantDetailPayBillCtaProps) {
  return (
    <div className="flex w-full flex-col items-stretch gap-[10px] px-6 py-3">
      <Button
        type="button"
        variant="primary"
        fullWidth
        onClick={onPayBill}
        overrideClassName="!h-12 !min-h-12 rounded-full"
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
          You can pay with DineOut at this restaurant
        </Typography>
      </div>
    </div>
  )
}
