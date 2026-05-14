import { Typography } from "@bolteu/kalep-react"
import InfoCircle from "@bolteu/kalep-react-icons/dist/InfoCircle"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface ClaimedOfferBillInlineNoticeProps {
  discountPercent: number
  /**
   * Bill amount step only (Figma). When false, omit the sentence about entering the amount
   * (pay / confirmation screens).
   */
  remindToEnterDiscountedTotal?: boolean
  /** When the parent already applies horizontal padding (e.g. confirmation sheet). */
  flushHorizontal?: boolean
}

/**
 * Figma Ⓖ Inline Notification — claimed offer reminder under nav (bill amount, pay, confirmation).
 */
export function ClaimedOfferBillInlineNotice({
  discountPercent,
  remindToEnterDiscountedTotal = false,
  flushHorizontal = false,
}: ClaimedOfferBillInlineNoticeProps) {
  const pct = formatDiscountPercent(discountPercent)
  const outer =
    flushHorizontal ? "shrink-0 px-0 pb-4 pt-0" : "shrink-0 px-6 pb-3 pt-[12px]"
  return (
    <div className={outer}>
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
