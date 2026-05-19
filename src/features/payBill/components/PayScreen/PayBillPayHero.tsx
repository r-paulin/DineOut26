import { Typography } from "@bolteu/kalep-react"
import { PayBillSavedBadge } from "@/features/payBill/components/PayScreen/PayBillSavedBadge"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import {
  payBillHeroMainPriceStyle,
  payBillNumericOpentype,
} from "@/features/payBill/utils/payBillNumericDisplay"

export interface PayBillPayHeroProps {
  subtotal: number
  finalAmt: number
  savedEur: number
}

/**
 * Pay screen price hero — content height only (no min-height / flex-1 centering).
 * Figma `15767:51083`; must stay compact so summary + slide CTA fit on short viewports.
 */
export function PayBillPayHero({
  subtotal,
  finalAmt,
  savedEur,
}: PayBillPayHeroProps) {
  const showStrikeSubtotal = subtotal > finalAmt

  return (
    <section className="flex w-full shrink-0 grow-0 flex-col items-center gap-1 px-6 py-4">
      <p className="m-0 flex w-full max-w-[min(100%,22rem)] flex-col items-center gap-1 text-center">
        <Typography
          variant="body-l-regular"
          color="secondary"
          as="span"
          align="center"
        >
          <span>You&apos;ll pay</span>
          {showStrikeSubtotal ?
            <>
              {" "}
              <span
                className="[text-decoration-skip-ink:none] line-through tabular-nums"
                style={payBillNumericOpentype}
              >
                {formatEurMajor(subtotal)}
              </span>
            </>
          : null}
        </Typography>
        <span
          className="text-primary tabular-nums"
          style={payBillHeroMainPriceStyle}
        >
          {formatEurMajor(finalAmt)}
        </span>
      </p>
      {savedEur > 0 ?
        <div className="mt-1">
          <PayBillSavedBadge savedAmountEur={savedEur} />
        </div>
      : null}
    </section>
  )
}
