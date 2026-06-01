import { Button, Typography } from "@bolteu/kalep-react"
import { PaymentConfirmationCashbackBanner } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationCashbackBanner"
import { ReceiptItem } from "@/features/payBill/components/shared/ReceiptItem"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface PaymentConfirmationSummarySheetProps {
  paymentCode: string
  receiptTotal: number
  tip: number | null
  paidAmount: number
  showCashback?: boolean
  onDone: () => void
}

/** Figma `15823:25243` — white sheet: payment code, summary, total, Done. */
export function PaymentConfirmationSummarySheet({
  paymentCode,
  receiptTotal,
  tip,
  paidAmount,
  showCashback = false,
  onDone,
}: PaymentConfirmationSummarySheetProps) {
  return (
    <div
      data-confirm-sheet-body=""
      className="flex max-h-[min(72vh,calc(var(--app-h)*0.72))] min-h-0 flex-col overflow-y-auto px-6 pb-[max(2rem,var(--safe-area-bottom))] pt-6"
    >
      <div className="flex shrink-0 flex-col gap-1 rounded-2xl bg-layer-floor-0-grouped px-6 py-3 text-center">
        <Typography variant="body-xs-regular" color="secondary" as="p">
          Payment code
        </Typography>
        <Typography
          variant="heading-l-accent"
          color="primary"
          as="p"
          align="center"
          paddingTop={1}
          inlineStyle={{
            fontFeatureSettings: FONT_FEAT,
            fontVariationSettings: "'wght' var(--font-weight-semibold)",
          }}
        >
          {paymentCode}
        </Typography>
        <Typography variant="body-s-regular" color="primary" as="p" paddingTop={1}>
          Show this code to the waiter to confirm your payment
        </Typography>
      </div>

      <div className="mt-3 flex min-h-0 shrink-0 flex-col gap-2">
        <Typography
          variant="heading-xs-accent"
          color="primary"
          as="p"
          inlineStyle={{
            fontFeatureSettings: FONT_FEAT,
            fontVariationSettings: "'wght' var(--font-weight-semibold)",
          }}
        >
          Summary
        </Typography>

        <div className="flex flex-col gap-1">
          <ReceiptItem
            label="Receipt"
            amount={formatEurMajor(receiptTotal)}
            variant="regular"
            labelColor="secondary"
            labelTypographyVariant="body-m-regular"
          />
          {tip != null && tip > 0 ?
            <ReceiptItem
              label="Tip"
              amount={formatEurMajor(tip)}
              variant="regular"
              labelColor="secondary"
              labelTypographyVariant="body-m-regular"
            />
          : null}
        </div>

        <div className="my-1 h-px w-full shrink-0 bg-separator" aria-hidden />

        <ReceiptItem
          label="Total paid"
          amount={formatEurMajor(paidAmount)}
          variant="bold"
          labelColor="primary"
          labelTypographyVariant="body-m-accent"
        />
      </div>

      {showCashback ?
        <div className="mt-3 shrink-0">
          <PaymentConfirmationCashbackBanner />
        </div>
      : null}

      <div className="mt-3 shrink-0">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onDone}
        >
          Done
        </Button>
      </div>
    </div>
  )
}
