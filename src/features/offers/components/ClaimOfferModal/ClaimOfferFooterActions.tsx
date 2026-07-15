import { ClaimOfferPrimaryButton } from "@/features/offers/components/ClaimOfferModal/ClaimOfferPrimaryButton"

export interface ClaimOfferFooterActionsProps {
  onClick: () => void
  disabled?: boolean
  buttonLabel?: string
}

/** Figma `_Screen Actions (DineOut)` — primary claim CTA. */
export function ClaimOfferFooterActions({
  onClick,
  disabled = false,
  buttonLabel = "Claim offer",
}: ClaimOfferFooterActionsProps) {
  return (
    <ClaimOfferPrimaryButton
      onClick={onClick}
      disabled={disabled}
      label={buttonLabel}
    />
  )
}
