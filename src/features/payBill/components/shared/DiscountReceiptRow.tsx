import InfoCircleOutlined from "@bolteu/kalep-react-icons/dist/InfoCircleOutlined"
import { ReceiptItem } from "@/features/payBill/components/shared/ReceiptItem"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"

export interface DiscountReceiptRowProps {
  percent: number
  discountEur: number
  infoAriaLabel: string
  onInfoClick: () => void
}

/**
 * Receipt row for a %-discount line with trailing info control (Figma gap 4px).
 */
export function DiscountReceiptRow({
  percent,
  discountEur,
  infoAriaLabel,
  onInfoClick,
}: DiscountReceiptRowProps) {
  return (
    <ReceiptItem
      label={`Discount ${percent}%`}
      amount={formatEurMajor(-discountEur)}
      variant="regular"
      labelColor="secondary"
      labelTypographyVariant="body-m-regular"
      labelSuffix={
        <button
          type="button"
          className="inline-flex border-none bg-transparent p-0"
          aria-label={infoAriaLabel}
          onClick={onInfoClick}
        >
          <InfoCircleOutlined size="sm" className="text-secondary" aria-hidden />
        </button>
      }
    />
  )
}
