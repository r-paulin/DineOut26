import { Typography } from "@bolteu/kalep-react"
import PercentFlower from "@bolteu/kalep-react-icons/dist/PercentFlower"
import { shouldShowScarcitySticker } from "@/features/offers/data/selectPrimaryTimedOffer"
import { ClaimOfferPrimaryButton } from "@/features/offers/components/ClaimOfferModal/ClaimOfferPrimaryButton"
import { formatClaimFooterSlotsRemainingLabel } from "@/features/offers/components/ClaimOfferModal/formatClaimFooterSlotsRemainingLabel"

export interface ClaimOfferFooterActionsProps {
  onClick: () => void
  disabled?: boolean
  remainingCount?: number
  buttonLabel?: string
}

/** Figma `_Screen Actions (DineOut)` — primary CTA + optional scarcity row. */
export function ClaimOfferFooterActions({
  onClick,
  disabled = false,
  remainingCount,
  buttonLabel = "Claim offer",
}: ClaimOfferFooterActionsProps) {
  const showLimit = shouldShowScarcitySticker(remainingCount)
  const limitLabel =
    showLimit && remainingCount != null ?
      formatClaimFooterSlotsRemainingLabel(remainingCount)
    : null

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <ClaimOfferPrimaryButton
        onClick={onClick}
        disabled={disabled}
        label={buttonLabel}
      />
      {limitLabel ?
        <div className="flex w-full items-center justify-center gap-1 overflow-hidden">
          <PercentFlower
            size="sm"
            className="shrink-0 text-danger-secondary"
            aria-hidden
          />
          <Typography variant="body-s-regular" color="primary" as="p" noWrap>
            {limitLabel}
          </Typography>
        </div>
      : null}
    </div>
  )
}
