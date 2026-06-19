import { Button, Typography } from "@bolteu/kalep-react"
import { PaymentConfirmationCashbackBanner } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationCashbackBanner"
import { PaymentConfirmationPinBanner } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationPinBanner"
import { ReceiptItem } from "@/features/payBill/components/shared/ReceiptItem"
import {
  PAY_CONFIRM_BILL_TOTAL_LABEL,
  PAY_CONFIRM_SUMMARY_TITLE,
  PAY_CONFIRM_TIP_LABEL,
  PAY_CONFIRM_TOTAL_PAID_LABEL,
} from "@/features/payBill/constants/paymentConfirmationCopy"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface PaymentConfirmationSummarySheetProps {
  paymentCode: string
  receiptTotal: number
  tip: number | null
  paidAmount: number
  showCashback?: boolean
  cashbackEur?: number
  onDone: () => void
}

/** Figma `15823:25243` — flexible white sheet: PIN banner, summary, cashback, fixed Done. */
export function PaymentConfirmationSummarySheet({
  paymentCode,
  receiptTotal,
  tip,
  paidAmount,
  showCashback = false,
  cashbackEur = 0,
  onDone,
}: PaymentConfirmationSummarySheetProps) {
  return (
    <div
      data-confirm-sheet-body=""
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-4">
        <div className="shrink-0 px-4">
          <PaymentConfirmationPinBanner paymentCode={paymentCode} />
        </div>

        <div className="flex shrink-0 flex-col gap-2 p-6">
          <Typography
            variant="heading-xs-accent"
            color="primary"
            as="h2"
            inlineStyle={{
              fontFeatureSettings: FONT_FEAT,
              fontVariationSettings: "'wght' var(--font-weight-semibold)",
            }}
          >
            {PAY_CONFIRM_SUMMARY_TITLE}
          </Typography>

          <div className="flex flex-col gap-1">
            <ReceiptItem
              label={PAY_CONFIRM_BILL_TOTAL_LABEL}
              amount={formatEurMajor(receiptTotal)}
              variant="regular"
              labelColor="secondary"
              labelTypographyVariant="body-m-regular"
            />
            {tip != null && tip > 0 ?
              <ReceiptItem
                label={PAY_CONFIRM_TIP_LABEL}
                amount={formatEurMajor(tip)}
                variant="regular"
                labelColor="secondary"
                labelTypographyVariant="body-m-regular"
              />
            : null}
          </div>

          <div className="h-px w-full shrink-0 bg-separator" aria-hidden />

          <ReceiptItem
            label={PAY_CONFIRM_TOTAL_PAID_LABEL}
            amount={formatEurMajor(paidAmount)}
            variant="bold"
            labelColor="primary"
            labelTypographyVariant="body-m-accent"
          />
        </div>

        {showCashback && cashbackEur > 0 ?
          <div className="shrink-0 px-6 pb-3">
            <PaymentConfirmationCashbackBanner cashbackEur={cashbackEur} />
          </div>
        : null}
      </div>

      <div className="shrink-0 px-6 pb-[max(2rem,var(--safe-area-bottom))]">
        <Button variant="primary" size="lg" fullWidth onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  )
}
