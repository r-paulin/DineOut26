import { Typography } from "@bolteu/kalep-react"
import type { TypographyProps } from "@bolteu/kalep-react"

export interface ReceiptItemProps {
  label: string
  amount: string
  variant?: "bold" | "regular"
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
  const amountTypographyVariant =
    variant === "bold" ? "body-m-accent" : "body-m-regular"
  const labelTypographyVariant =
    labelTypographyVariantProp ??
    (variant === "bold" ? "body-m-accent" : "body-m-regular")
  const amountTone =
    amountColor === "negative" ? "danger-primary" : "primary"
  return (
    <div className="flex w-full min-w-0 items-start justify-between gap-1">
      <div className="flex min-w-0 items-center gap-1">
        <Typography
          variant={labelTypographyVariant}
          color={labelColor}
          as="span"
        >
          {label}
        </Typography>
        {labelSuffix}
      </div>
      <span className={strikethrough ? "line-through" : undefined}>
        <Typography
          variant={amountTypographyVariant}
          color={amountTone}
          as="span"
          align="end"
        >
          {amount}
        </Typography>
      </span>
    </div>
  )
}
