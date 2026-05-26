import { Button, Typography } from "@bolteu/kalep-react"
import Food from "@bolteu/kalep-react-icons/dist/Food"
import Lock from "@bolteu/kalep-react-icons/dist/Lock"
import MobilePayment from "@bolteu/kalep-react-icons/dist/MobilePayment"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import Stop from "@bolteu/kalep-react-icons/dist/Stop"
import Time from "@bolteu/kalep-react-icons/dist/Time"
import type { ReactElement } from "react"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
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
    <Time key="hours" size="lg" className={iconClass} aria-hidden />,
    <Pin key="venue" size="lg" className={iconClass} aria-hidden />,
    <Lock key="pin" size="lg" className={iconClass} aria-hidden />,
    <Food key="food" size="lg" className={iconClass} aria-hidden />,
  ]
  return paymentMethod === "dineout" ?
      [
        ...shared,
        <MobilePayment key="pay" size="lg" className={iconClass} aria-hidden />,
      ]
    : [...shared, <Stop key="pay" size="lg" className={iconClass} aria-hidden />]
}

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface ClaimOfferSuccessSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  discountPercent: number
  paymentMethod: PaymentMethod
  restaurantName: string
  onDone: () => void
  container?: HTMLElement | null
}

export function formatHowToUseOfferAtRestaurant(restaurantName: string): string {
  const name = restaurantName.trim()
  return name.length > 0 ?
      `How to use the offer at ${name}?`
    : "How to use the offer?"
}

/**
 * Post-claim instructions (Figma `16081:16511` DineOut / `16096:15054` card-cash).
 */
export function ClaimOfferSuccessSheet({
  isOpen,
  onOpenChange,
  discountPercent,
  paymentMethod,
  restaurantName,
  onDone,
  container,
}: ClaimOfferSuccessSheetProps) {
  const steps = getClaimOfferSuccessSteps(paymentMethod, discountPercent)
  const stepIcons = getClaimSuccessStepIcons(paymentMethod)
  const title = `${discountPercent}% discount claimed`
  const subtitle = formatHowToUseOfferAtRestaurant(restaurantName)

  return (
    <ClaimPromoSheetShell
      open={isOpen}
      onOpenChange={onOpenChange}
      container={container}
      zOverlay={Z_CLAIM_MODAL_OVERLAY}
      zContent={Z_CLAIM_MODAL_CONTENT}
      title={title}
      description="How to use your claimed offer"
      hero="success-badge"
      sheetHeight="fit"
      footer={
        <Button type="button" variant="primary" size="lg" fullWidth onClick={onDone}>
          Done
        </Button>
      }
    >
      <div className="flex flex-col gap-3 px-6 pb-3 pt-6">
        <Typography
          variant="heading-m-accent"
          color="primary"
          as="h2"
          inlineStyle={SEMIBOLD}
        >
          {title}
        </Typography>
        <Typography variant="body-m-regular" color="primary" as="p">
          {subtitle}
        </Typography>
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
    <ul className="m-0 flex list-none flex-col px-6 pb-6">
      {steps.map((step, index) => (
        <li key={step.title}>
          <ClaimSuccessStepRow
            icon={stepIcons[index] ?? stepIcons[0]!}
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
