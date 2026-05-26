import { Typography } from "@bolteu/kalep-react"
import payCashbackUpsellUrl from "@/features/payBill/assets/pay-cashback-upsell.png"
import {
  formatPayCashbackUpsellHeadline,
  formatPayCashbackUpsellSecondary,
} from "@/features/payBill/constants/payBillCashbackCopy"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface PayBillCashbackUpsellProps {
  cashbackEur: number
  cashbackPercent: number
}

/**
 * Figma `16364:30051` — earn-back upsell flush above slide-to-pay (not a receipt discount row).
 */
export function PayBillCashbackUpsell({
  cashbackEur,
  cashbackPercent,
}: PayBillCashbackUpsellProps) {
  return (
    <section
      className="relative w-full shrink-0 overflow-hidden rounded-t-2xl bg-action-secondary pl-[60px] pr-6 pt-4 pb-4"
      aria-label={formatPayCashbackUpsellHeadline(cashbackEur)}
    >
      <img
        src={payCashbackUpsellUrl}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[97px] w-14 object-contain object-left-bottom"
        decoding="async"
      />
      <Typography
        variant="body-l-accent"
        color="primary"
        as="p"
        inlineStyle={{
          fontVariationSettings: "'wght' var(--font-weight-semibold)",
          fontFeatureSettings: FONT_FEAT,
        }}
      >
        {formatPayCashbackUpsellHeadline(cashbackEur)}
      </Typography>
      <Typography
        variant="body-s-regular"
        color="secondary"
        as="p"
        inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
      >
        {formatPayCashbackUpsellSecondary(cashbackPercent)}
      </Typography>
    </section>
  )
}
