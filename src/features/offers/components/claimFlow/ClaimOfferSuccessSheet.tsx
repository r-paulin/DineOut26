import { Button, Typography } from "@bolteu/kalep-react"
import Cash from "@bolteu/kalep-react-icons/dist/Cash"
import MobilePayment from "@bolteu/kalep-react-icons/dist/MobilePayment"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import Stop from "@bolteu/kalep-react-icons/dist/Stop"
import type { ReactElement } from "react"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import {
  CLAIM_OFFER_SUCCESS_CTA,
  CLAIM_OFFER_SUCCESS_SUBTITLE,
  CLAIM_OFFER_SUCCESS_TITLE,
} from "@/features/offers/constants/claimOfferSuccessCopy"
import {
  getClaimOfferSuccessSteps,
  type ClaimOfferSuccessStep,
} from "@/features/offers/constants/claimOfferSuccessSteps"
import type { PaymentMethod } from "@/features/offers/offers.types"
import {
  Z_CLAIM_MODAL_CONTENT,
  Z_CLAIM_MODAL_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"

function getClaimSuccessStepIcons(
  paymentMethod: PaymentMethod,
): ReactElement[] {
  const iconClass = "shrink-0 text-action-primary"
  const shared: ReactElement[] = [
    <Pin key="check-in" size="lg" className={iconClass} aria-hidden />,
    <Stop key="bill" size="lg" className={iconClass} aria-hidden />,
  ]
  return paymentMethod === "dineout" ?
      [
        ...shared,
        <MobilePayment key="pay" size="lg" className={iconClass} aria-hidden />,
      ]
    : [...shared, <Cash key="pay" size="lg" className={iconClass} aria-hidden />]
}

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

const SUCCESS_TITLE_ID = "claim-offer-success-title"
const SUCCESS_SUBTITLE_ID = "claim-offer-success-subtitle"

export interface ClaimOfferSuccessSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  paymentMethod: PaymentMethod
  onDone: () => void
  container?: HTMLElement | null
}

/**
 * Post-claim instructions (Figma `17327:18233` DineOut / `17327:18251` card-cash).
 */
export function ClaimOfferSuccessSheet({
  isOpen,
  onOpenChange,
  paymentMethod,
  onDone,
  container,
}: ClaimOfferSuccessSheetProps) {
  const steps = getClaimOfferSuccessSteps(paymentMethod)
  const stepIcons = getClaimSuccessStepIcons(paymentMethod)

  return (
    <ClaimPromoSheetShell
      open={isOpen}
      onOpenChange={onOpenChange}
      container={container}
      zOverlay={Z_CLAIM_MODAL_OVERLAY}
      zContent={Z_CLAIM_MODAL_CONTENT}
      title={CLAIM_OFFER_SUCCESS_TITLE}
      description={CLAIM_OFFER_SUCCESS_SUBTITLE}
      visibleTitleId={SUCCESS_TITLE_ID}
      visibleDescriptionId={SUCCESS_SUBTITLE_ID}
      hero="success-badge"
      sheetHeight="fit"
      footer={
        <Button type="button" variant="primary" size="lg" fullWidth onClick={onDone}>
          {CLAIM_OFFER_SUCCESS_CTA}
        </Button>
      }
    >
      <div className="flex flex-col gap-3 px-6 pb-3 pt-6">
        <h2 id={SUCCESS_TITLE_ID} className="m-0 p-0">
          <Typography
            variant="heading-m-accent"
            color="primary"
            as="span"
            inlineStyle={SEMIBOLD}
          >
            {CLAIM_OFFER_SUCCESS_TITLE}
          </Typography>
        </h2>
        <p id={SUCCESS_SUBTITLE_ID} className="m-0 p-0">
          <Typography variant="body-m-regular" color="primary" as="span">
            {CLAIM_OFFER_SUCCESS_SUBTITLE}
          </Typography>
        </p>
      </div>

      <ClaimSuccessStepList steps={steps} stepIcons={stepIcons} />
    </ClaimPromoSheetShell>
  )
}

function ClaimSuccessStepList({
  steps,
  stepIcons,
}: {
  steps: ClaimOfferSuccessStep[]
  stepIcons: ReactElement[]
}) {
  return (
    <ul className="m-0 flex list-none flex-col px-6 pb-10">
      {steps.map((step, index) => (
        <li key={step.title}>
          <ClaimSuccessStepRow
            icon={stepIcons[index]!}
            step={step}
          />
          {index < steps.length - 1 ?
            <div className="h-px w-full bg-separator" aria-hidden />
          : null}
        </li>
      ))}
    </ul>
  )
}

function ClaimSuccessStepRow({
  icon,
  step,
}: {
  icon: ReactElement
  step: ClaimOfferSuccessStep
}) {
  return (
    <div className="flex gap-3 pb-[9px] pt-[10px]">
      {icon}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          as="span"
          variant="body-m-accent"
          color="primary"
          inlineStyle={SEMIBOLD}
        >
          {step.title}
        </Typography>
        <Typography as="span" variant="body-s-regular" color="secondary">
          {step.subtitle}
        </Typography>
      </div>
    </div>
  )
}
