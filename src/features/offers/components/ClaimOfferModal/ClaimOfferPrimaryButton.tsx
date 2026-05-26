import { Button } from "@bolteu/kalep-react"

export interface ClaimOfferPrimaryButtonProps {
  onClick: () => void
  disabled?: boolean
}

/** Figma `[Dine-out] Main-button` — 56px comfortable CTA (`size="lg"`). */
export function ClaimOfferPrimaryButton({
  onClick,
  disabled = false,
}: ClaimOfferPrimaryButtonProps) {
  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      fullWidth
      disabled={disabled}
      onClick={onClick}
    >
      Claim offer
    </Button>
  )
}
