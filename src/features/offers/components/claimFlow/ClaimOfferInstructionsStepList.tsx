import { Typography } from "@bolteu/kalep-react"
import Cash from "@bolteu/kalep-react-icons/dist/Cash"
import MobilePayment from "@bolteu/kalep-react-icons/dist/MobilePayment"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import Stop from "@bolteu/kalep-react-icons/dist/Stop"
import type { ReactElement } from "react"
import type { ClaimOfferSuccessStep } from "@/features/offers/constants/claimOfferSuccessSteps"
import type { PaymentMethod } from "@/features/offers/offers.types"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export function getClaimOfferInstructionsStepIcons(
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

export function ClaimOfferInstructionsStepList({
  steps,
  stepIcons,
}: {
  steps: ClaimOfferSuccessStep[]
  stepIcons: ReactElement[]
}) {
  return (
    <ul className="m-0 flex list-none flex-col px-6 pb-3">
      {steps.map((step, index) => (
        <li key={step.title}>
          <ClaimOfferInstructionsStepRow icon={stepIcons[index]!} step={step} />
          {index < steps.length - 1 ?
            <div className="h-px w-full bg-separator" aria-hidden />
          : null}
        </li>
      ))}
    </ul>
  )
}

function ClaimOfferInstructionsStepRow({
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
