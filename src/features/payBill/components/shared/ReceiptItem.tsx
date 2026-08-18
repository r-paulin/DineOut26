import { Typography } from "@bolteu/kalep-react"
import type { TypographyProps } from "@bolteu/kalep-react"
import { payBillNumericOpentype } from "@/features/payBill/utils/payBillNumericDisplay"

const totalRowSemiboldTypographyStyle = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

export interface ReceiptItemProps {
  label: string
  amount: string
  variant?: "bold" | "regular" | "total"
  /** Overrides label weight when set; otherwise follows `variant` (bold → accent). */
  labelTypographyVariant?: Extract<TypographyProps["variant"], "body-m-accent" | "body-m-regular">
  labelColor?: Extract<TypographyProps["color"], "primary" | "secondary">
  labelSuffix?: React.ReactNode
  strikethrough?: boolean
  amountColor?: "primary" | "negative"
}

/**
 * Receipt row: label left, formatted amount right (Figma `15767:51083` gap 4px).
 */
export function ReceiptItem({
  label,
  amount,
  variant = "regular",
  labelTypographyVariant: labelTypographyVariantProp,
  labelColor = "primary",
  labelSuffix,
  strikethrough,
  amountColor = "primary",
}: ReceiptItemProps) {
  const isTotal = variant === "total"
  const amountTypographyVariant =
    isTotal || variant === "bold" ? "body-m-accent" : "body-m-regular"
  const labelTypographyVariant =
    labelTypographyVariantProp ??
    (isTotal || variant === "bold" ? "body-m-accent" : "body-m-regular")
  const semiboldStyle = isTotal ? totalRowSemiboldTypographyStyle : undefined
  const amountTone =
    amountColor === "negative" ? "danger-primary" : "primary"
  return (
    <div className="flex w-full min-w-0 items-start justify-between gap-1">
      <div className="flex min-w-0 items-center gap-1">
        <Typography
          variant={labelTypographyVariant}
          color={labelColor}
          as="span"
          inlineStyle={semiboldStyle}
        >
          {label}
        </Typography>
        {labelSuffix}
      </div>
      <span
        className={[
          strikethrough ? "line-through" : undefined,
          isTotal ? "tabular-nums" : undefined,
        ]
          .filter(Boolean)
          .join(" ") || undefined}
        style={isTotal ? payBillNumericOpentype : undefined}
      >
        <Typography
          variant={amountTypographyVariant}
          color={amountTone}
          as="span"
          align="end"
          inlineStyle={semiboldStyle}
        >
          {amount}
        </Typography>
      </span>
    </div>
  )
}
