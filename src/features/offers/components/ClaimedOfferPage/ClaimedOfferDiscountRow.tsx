import { Typography } from "@bolteu/kalep-react"
import Offer from "@bolteu/kalep-react-icons/dist/Offer"
import { ROW_ICON_CLASS } from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"

export interface ClaimedOfferDiscountRowProps {
  label: string
}

/** Figma `15753:13182` — single-line offer row (Offer icon, pt-16 pb-15). */
export function ClaimedOfferDiscountRow({ label }: ClaimedOfferDiscountRowProps) {
  return (
    <div className="flex w-full flex-col px-6">
      <div className="flex items-start gap-3 overflow-hidden pt-4 pb-[15px]">
        <div className="flex shrink-0 items-center text-action-primary">
          <Offer size="md" className={ROW_ICON_CLASS} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <Typography variant="body-m-regular" color="primary" as="span">
            {label}
          </Typography>
        </div>
      </div>
    </div>
  )
}
