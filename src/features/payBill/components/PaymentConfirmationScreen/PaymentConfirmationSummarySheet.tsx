import { Button, Typography } from "@bolteu/kalep-react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { ClaimedOfferBillInlineNotice } from "@/features/payBill/components/shared/ClaimedOfferBillInlineNotice"
import { DiscountReceiptRow } from "@/features/payBill/components/shared/DiscountReceiptRow"
import { ReceiptItem } from "@/features/payBill/components/shared/ReceiptItem"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface PaymentConfirmationSummarySheetProps {
  offer: ClaimedOffer | null
  paymentCode: string
  receiptTotal: number
  tip: number | null
  paidAmount: number
  discountPercentSecond: number
  secondDiscEur: number
  onDone: () => void
  onDineOutBenefitInfo: () => void
}

/** Figma `15823:25243` — white sheet: notice, payment code, summary, total, Done. */
export function PaymentConfirmationSummarySheet({
  offer,
  paymentCode,
  receiptTotal,
  tip,
  paidAmount,
  discountPercentSecond,
  secondDiscEur,
  onDone,
  onDineOutBenefitInfo,
}: PaymentConfirmationSummarySheetProps) {
  return (
    <div className="flex max-h-[min(72vh,calc(var(--app-h)*0.72))] min-h-0 flex-col overflow-y-auto rounded-t-[16px] bg-layer-floor-1 px-6 pb-[max(2rem,var(--safe-area-bottom))] pt-6">
      {offer ?
        <div className="shrink-0 pb-4">
          <ClaimedOfferBillInlineNotice
            discountPercent={offer.discountPercent}
            flushHorizontal
          />
        </div>
      : null}

      <div className="flex shrink-0 flex-col gap-2 rounded-lg bg-layer-floor-0-grouped px-6 py-3 text-center">
        <Typography variant="body-s-regular" color="secondary" as="p">
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

      <div className="mt-6 flex min-h-0 shrink-0 flex-col gap-2">
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

        <div className="flex flex-col gap-2">
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
          {discountPercentSecond > 0 ?
            <DiscountReceiptRow
              percent={discountPercentSecond}
              discountEur={secondDiscEur}
              infoAriaLabel="DineOut benefit info"
              onInfoClick={onDineOutBenefitInfo}
            />
          : null}
        </div>

        <div
          className="my-1 h-px w-full shrink-0 bg-separator"
          aria-hidden
        />

        <ReceiptItem
          label="Total paid"
          amount={formatEurMajor(paidAmount)}
          variant="bold"
          labelColor="primary"
          labelTypographyVariant="body-m-accent"
        />
      </div>

      <div className="mt-6 shrink-0">
        <Button
          variant="primary"
          fullWidth
          onClick={onDone}
          overrideClassName="!h-14 !min-h-14 rounded-full"
        >
          Done
        </Button>
      </div>
    </div>
  )
}
