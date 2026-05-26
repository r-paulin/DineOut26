import { Typography } from "@bolteu/kalep-react"
import { PAY_BILL_HERO_CAPTION } from "@/features/payBill/constants/payBillCashbackCopy"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import { payBillHeroMainPriceStyle } from "@/features/payBill/utils/payBillNumericDisplay"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface PayBillPayHeroProps {
  finalAmt: number
}

/**
 * Pay screen price hero — grows to fill space above summary (Figma `15767:51083` / `16364:30080`).
 */
export function PayBillPayHero({ finalAmt }: PayBillPayHeroProps) {
  return (
    <section className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-1 px-6 py-8">
      <span
        className="w-full text-center text-primary tabular-nums"
        style={payBillHeroMainPriceStyle}
      >
        {formatEurMajor(finalAmt)}
      </span>
      <Typography
        variant="body-s-regular"
        color="secondary"
        align="center"
        as="p"
        inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
      >
        {PAY_BILL_HERO_CAPTION}
      </Typography>
    </section>
  )
}
