import { Typography } from "@bolteu/kalep-react"

export interface ReceiptItemProps {
  label: string
  amount: string
  variant?: "bold" | "regular"
  labelSuffix?: React.ReactNode
  strikethrough?: boolean
  amountColor?: "primary" | "negative"
}

/**
 * Receipt row: label left, formatted amount right.
 */
export function ReceiptItem({
  label,
  amount,
  variant = "regular",
  labelSuffix,
  strikethrough,
  amountColor = "primary",
}: ReceiptItemProps) {
  const bodyVariant =
    variant === "bold" ? "body-m-accent" : "body-m-regular"
  const amountTone =
    amountColor === "negative" ? "danger-primary" : "primary"
  return (
    <div className="flex w-full min-w-0 items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1">
        <Typography variant={bodyVariant} color="primary" as="span">
          {label}
        </Typography>
        {labelSuffix}
      </div>
      <span className={strikethrough ? "line-through" : undefined}>
        <Typography variant={bodyVariant} color={amountTone} as="span" align="end">
          {amount}
        </Typography>
      </span>
    </div>
  )
}
