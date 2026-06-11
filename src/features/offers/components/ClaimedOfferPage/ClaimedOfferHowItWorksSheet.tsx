import { Button, Typography } from "@bolteu/kalep-react"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import {
  ClaimOfferInstructionsStepList,
  getClaimOfferInstructionsStepIcons,
} from "@/features/offers/components/claimFlow/ClaimOfferInstructionsStepList"
import {
  CLAIMED_OFFER_HOW_IT_WORKS_SHEET_SUBTITLE,
  CLAIMED_OFFER_HOW_IT_WORKS_SHEET_TITLE,
} from "@/features/offers/constants/claimedOfferCopy"
import { CLAIM_OFFER_SUCCESS_CTA } from "@/features/offers/constants/claimOfferSuccessCopy"
import { getClaimOfferSuccessSteps } from "@/features/offers/constants/claimOfferSuccessSteps"
import type { PaymentMethod } from "@/features/offers/offers.types"
import {
  Z_CLAIMED_OFFER_SHEET_CONTENT,
  Z_CLAIMED_OFFER_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

const HOW_IT_WORKS_TITLE_ID = "claimed-offer-how-it-works-title"
const HOW_IT_WORKS_SUBTITLE_ID = "claimed-offer-how-it-works-subtitle"

export interface ClaimedOfferHowItWorksSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentMethod: PaymentMethod
  container?: HTMLElement | null
}

/** Figma `17327:*` steps — opened from claimed-offer hero “How your offer works”. */
export function ClaimedOfferHowItWorksSheet({
  open,
  onOpenChange,
  paymentMethod,
  container,
}: ClaimedOfferHowItWorksSheetProps) {
  const steps = getClaimOfferSuccessSteps(paymentMethod)
  const stepIcons = getClaimOfferInstructionsStepIcons(paymentMethod)

  return (
    <ClaimPromoSheetShell
      open={open}
      onOpenChange={onOpenChange}
      container={container}
      zOverlay={Z_CLAIMED_OFFER_SHEET_OVERLAY}
      zContent={Z_CLAIMED_OFFER_SHEET_CONTENT}
      title={CLAIMED_OFFER_HOW_IT_WORKS_SHEET_TITLE}
      description={CLAIMED_OFFER_HOW_IT_WORKS_SHEET_SUBTITLE}
      visibleTitleId={HOW_IT_WORKS_TITLE_ID}
      visibleDescriptionId={HOW_IT_WORKS_SUBTITLE_ID}
      hero="success-badge"
      sheetHeight="fit"
      footerBordered={false}
      footer={
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => onOpenChange(false)}
        >
          {CLAIM_OFFER_SUCCESS_CTA}
        </Button>
      }
    >
      <div className="flex flex-col gap-3 px-6 pb-3 pt-6">
        <h2 id={HOW_IT_WORKS_TITLE_ID} className="m-0 p-0">
          <Typography
            variant="heading-m-accent"
            color="primary"
            as="span"
            inlineStyle={SEMIBOLD}
          >
            {CLAIMED_OFFER_HOW_IT_WORKS_SHEET_TITLE}
          </Typography>
        </h2>
        <p id={HOW_IT_WORKS_SUBTITLE_ID} className="m-0 p-0">
          <Typography variant="body-m-regular" color="primary" as="span">
            {CLAIMED_OFFER_HOW_IT_WORKS_SHEET_SUBTITLE}
          </Typography>
        </p>
      </div>

      <ClaimOfferInstructionsStepList steps={steps} stepIcons={stepIcons} />
    </ClaimPromoSheetShell>
  )
}
