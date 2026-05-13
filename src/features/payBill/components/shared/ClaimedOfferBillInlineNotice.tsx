import { Typography } from "@bolteu/kalep-react"
import InfoCircle from "@bolteu/kalep-react-icons/dist/InfoCircle"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

/** Same rounding as bill-offer badges; copy uses `N%` without “off”. */
function formatPercentForClaimNotice(percent: number): string {
  if (!Number.isFinite(percent) || percent < 0) return "0"
  const rounded = Math.round(percent * 100) / 100
  return Number.isInteger(rounded) ?
      String(rounded)
    : String(parseFloat(rounded.toFixed(2)))
}

export interface ClaimedOfferBillInlineNoticeProps {
  discountPercent: number
  /**
   * Bill amount step only (Figma). When false, omit the sentence about entering the amount
   * (pay / confirmation screens).
   */
  remindToEnterDiscountedTotal?: boolean
}

/**
 * Figma Ⓖ Inline Notification — claimed offer reminder under nav (bill amount, pay, confirmation).
 */
export function ClaimedOfferBillInlineNotice({
  discountPercent,
  remindToEnterDiscountedTotal = false,
}: ClaimedOfferBillInlineNoticeProps) {
  const pct = formatPercentForClaimNotice(discountPercent)
  return (
    <div className="shrink-0 px-6 pb-3 pt-[12px]">
      <div
        className="flex min-h-12 gap-4 rounded-xl bg-neutral-secondary px-4 py-3"
        role="status"
      >
        <InfoCircle size="md" className="shrink-0 text-secondary" aria-hidden />
        <Typography
          variant="body-s-regular"
          color="primary"
          as="p"
          inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
        >
          Check that the {pct}% claimed discount has been applied to your bill.
          {remindToEnterDiscountedTotal ?
            <> Enter the final amount after the discount.</>
          : null}
        </Typography>
      </div>
    </div>
  )
}
