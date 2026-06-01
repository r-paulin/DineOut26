import { Typography } from "@bolteu/kalep-react"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const SEMIBOLD = {
  fontFeatureSettings: FONT_FEAT,
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface PaymentSuccessTitleProps {
  /** Centered hero on brand canvas (Figma `15823:25258` / `16396:41152`). */
  variant: "large" | "compact"
}

export function PaymentSuccessTitle({ variant }: PaymentSuccessTitleProps) {
  if (variant === "compact") {
    return (
      <Typography
        variant="body-l-accent"
        color="primary-inverted"
        as="p"
        align="center"
        inlineStyle={SEMIBOLD}
      >
        Payment successful
      </Typography>
    )
  }

  return (
    <Typography
      variant="heading-m-accent"
      color="primary-inverted"
      as="p"
      align="center"
      inlineStyle={SEMIBOLD}
    >
      Payment successful
    </Typography>
  )
}
