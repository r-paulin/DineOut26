import { Typography } from "@bolteu/kalep-react"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface PaymentSuccessTitleProps {
  variant: "large" | "small"
}

export function PaymentSuccessTitle({ variant }: PaymentSuccessTitleProps) {
  return (
    <Typography
      variant={variant === "large" ? "heading-l-accent" : "heading-xs-accent"}
      color="primary-inverted"
      as="p"
      align="center"
      inlineStyle={{
        fontFeatureSettings: FONT_FEAT,
        fontVariationSettings: "'wght' var(--font-weight-semibold)",
      }}
    >
      Payment successful
    </Typography>
  )
}
