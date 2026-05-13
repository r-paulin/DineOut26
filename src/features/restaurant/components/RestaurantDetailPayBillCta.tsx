import { Typography } from "@bolteu/kalep-react"
import PercentFlower from "@bolteu/kalep-react-icons/dist/PercentFlower"
import { DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT } from "@/features/offers/constants/dineOutStackablePromo"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface RestaurantDetailPayBillCtaProps {
  onPayBill?: () => void
}

/**
 * Primary CTA + stackable promo line (Figma Consumer Dine-out `15945:13246`).
 */
export function RestaurantDetailPayBillCta({
  onPayBill,
}: RestaurantDetailPayBillCtaProps) {
  return (
    <div className="flex w-full flex-col gap-3 px-6 py-6">
      <button
        type="button"
        className="flex h-14 w-full cursor-pointer items-center justify-center rounded-full border-none bg-[var(--map-pin-selected)] px-4 text-static-key-light shadow-sm"
        onClick={onPayBill}
      >
        <span
          className="[font-variation-settings:'wght'_var(--font-weight-semibold)] text-lg leading-6"
          style={{ fontFamily: "var(--font-family)" }}
        >
          Pay bill with DineOut
        </span>
      </button>
      <div className="flex items-center justify-center gap-1">
        <PercentFlower size="sm" className="shrink-0 text-danger-primary" aria-hidden />
        <Typography
          variant="body-xs-regular"
          color="primary"
          align="center"
          as="p"
          noWrap
          inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
        >
          {DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT}
        </Typography>
      </div>
    </div>
  )
}
