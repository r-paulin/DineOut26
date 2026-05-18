import { Typography } from "@bolteu/kalep-react"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const SEMIBOLD = {
  fontFeatureSettings: FONT_FEAT,
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface PaymentSuccessTitleProps {
  /** Centered hero entrance on brand canvas (Figma 15767). */
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
    <div className="w-full">
      <Typography
        variant="heading-s-accent"
        color="primary-inverted"
        as="p"
        align="center"
        inlineStyle={SEMIBOLD}
      >
        Payment successful
      </Typography>
    </div>
  )
}
