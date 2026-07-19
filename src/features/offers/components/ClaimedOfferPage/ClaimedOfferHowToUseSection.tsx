import { Button, Typography } from "@bolteu/kalep-react"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import { useCallback, useRef, useState } from "react"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import { parseClaimPinForDisplay } from "@/features/offers/components/ClaimedOfferPage/parseClaimPinForDisplay"
import { SEMIBOLD } from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"
import { useClaimedOfferCheckInTransition } from "@/features/offers/components/ClaimedOfferPage/useClaimedOfferCheckInTransition"
import {
  CLAIMED_OFFER_ARRIVED_PIN_HINT,
  CLAIMED_OFFER_ARRIVED_TITLE,
  CLAIMED_OFFER_CHECK_IN_CTA,
  CLAIMED_OFFER_CHECKED_IN_STEP_SUBTITLE,
  CLAIMED_OFFER_CHECKED_IN_STEP_TITLE,
  CLAIMED_OFFER_HOW_TO_USE_TITLE,
  CLAIMED_OFFER_IVE_PAID_LABEL,
  CLAIMED_OFFER_PAY_BILL_CTA,
  CLAIMED_OFFER_PAY_CARD_HINT,
  CLAIMED_OFFER_PAY_CARD_TITLE,
  CLAIMED_OFFER_PAY_THE_BILL_CTA,
  formatClaimedOfferCheckInStepTitle,
  formatClaimedOfferPayStepTitle,
} from "@/features/offers/constants/claimedOfferCopy"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"

const PIN_CODE_STYLE = {
  ...SEMIBOLD,
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

export interface ClaimedOfferHowToUseSectionProps {
  discountPercent: number
  pin: string
  checkedIn: boolean
  expired: boolean
  claimIsForToday: boolean
  paymentMethod: PaymentMethod
  cashbackPercent?: number
  onCheckIn: () => void
  onPay: () => void
  onConfirmBill: () => void
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className={claimedOfferLayout.howToUseStepBadge} aria-hidden>
      <Typography
        variant="body-s-accent"
        as="span"
        inlineStyle={{
          ...SEMIBOLD,
          color: "var(--color-static-content-key-light)",
        }}
      >
        {n}
      </Typography>
    </span>
  )
}

function CheckedInBadge() {
  return (
    <span className={claimedOfferLayout.howToUseCheckedInBadge} aria-hidden>
      {/* Kalep: md=20, lg=24 — Figma start icon is 24×24. */}
      <CheckCircle size="lg" className="text-action-primary" />
    </span>
  )
}

/**
 * Figma `19867:37819` (pre) → `19867:38029` (checked in).
 * Check-in collapses the PIN card with an iOS-style height/fade transition.
 */
export function ClaimedOfferHowToUseSection({
  discountPercent,
  pin,
  checkedIn,
  expired,
  claimIsForToday,
  paymentMethod,
  cashbackPercent = DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT,
  onCheckIn,
  onPay,
  onConfirmBill,
}: ClaimedOfferHowToUseSectionProps) {
  const pinResult = parseClaimPinForDisplay(pin)
  const isDineout = paymentMethod === "dineout"

  const checkInCardSlotRef = useRef<HTMLDivElement>(null)
  const checkInCardRef = useRef<HTMLDivElement>(null)
  const step1StackRef = useRef<HTMLDivElement>(null)
  const step1PendingRef = useRef<HTMLDivElement>(null)
  const step1DoneRef = useRef<HTMLDivElement>(null)
  const payCardRef = useRef<HTMLDivElement>(null)
  /** Pay UI enables after phase-2 color beat — not when `checkedIn` flips. */
  const [paySurfaceEnabled, setPaySurfaceEnabled] = useState(checkedIn)
  const payEnabled = paySurfaceEnabled && !expired

  const onSettled = useCallback((isCheckedIn: boolean) => {
    setPaySurfaceEnabled(isCheckedIn)
  }, [])

  useClaimedOfferCheckInTransition(
    checkedIn,
    checkInCardSlotRef,
    checkInCardRef,
    step1StackRef,
    step1PendingRef,
    step1DoneRef,
    payCardRef,
    onSettled,
  )

  const handleCheckInPress = useCallback(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) active.blur()
    onCheckIn()
  }, [onCheckIn])

  const payCtaLabel =
    expired ?
      "Offer expired"
    : isDineout ?
      payEnabled ?
        CLAIMED_OFFER_PAY_BILL_CTA
      : CLAIMED_OFFER_PAY_THE_BILL_CTA
    : CLAIMED_OFFER_IVE_PAID_LABEL

  const payAriaLabel =
    expired ?
      "Offer expired, payment unavailable"
    : !paySurfaceEnabled ?
      "Check in to unlock payment"
    : isDineout ?
      "Pay bill via Bolt Food app"
    : CLAIMED_OFFER_IVE_PAID_LABEL

  const handlePay = isDineout ? onPay : onConfirmBill

  return (
    <section
      className={claimedOfferLayout.howToUseSection}
      aria-label={CLAIMED_OFFER_HOW_TO_USE_TITLE}
    >
      <div className={claimedOfferLayout.howToUseHeading}>
        <h2 className={claimedOfferLayout.sectionHeading}>
          {CLAIMED_OFFER_HOW_TO_USE_TITLE}
        </h2>
      </div>

      <div
        ref={step1StackRef}
        className={claimedOfferLayout.howToUseStep1Stack}
      >
        <div
          ref={step1PendingRef}
          className={claimedOfferLayout.howToUseStepRow}
          aria-hidden={checkedIn}
        >
          <StepBadge n={1} />
          <Typography variant="body-m-regular" color="primary" as="p">
            {formatClaimedOfferCheckInStepTitle(discountPercent)}
          </Typography>
        </div>

        <div
          ref={step1DoneRef}
          className={claimedOfferLayout.howToUseStepRowCheckedIn}
          aria-hidden={!checkedIn}
          {...(checkedIn ? { "aria-live": "polite" as const } : {})}
        >
          <CheckedInBadge />
          <div className="min-w-0 flex-1">
            <Typography variant="body-m-regular" color="primary" as="p">
              {CLAIMED_OFFER_CHECKED_IN_STEP_TITLE}
            </Typography>
            <Typography variant="body-s-regular" color="secondary" as="p">
              {CLAIMED_OFFER_CHECKED_IN_STEP_SUBTITLE}
            </Typography>
          </div>
        </div>
      </div>

      <div
        ref={checkInCardSlotRef}
        className={claimedOfferLayout.howToUseCheckInCardSlot}
        aria-hidden={checkedIn}
        {...(checkedIn ? { inert: true as const } : {})}
      >
        <div
          ref={checkInCardRef}
          className={claimedOfferLayout.howToUseCheckInCard}
        >
          <div className={claimedOfferLayout.howToUsePinRow}>
            <div className="min-w-0 flex-1">
              <Typography variant="body-m-accent" color="primary" as="p">
                {CLAIMED_OFFER_ARRIVED_TITLE}
              </Typography>
              <Typography variant="body-xs-regular" color="secondary" as="p">
                {CLAIMED_OFFER_ARRIVED_PIN_HINT}
              </Typography>
            </div>
            {pinResult.ok ?
              <div
                className={claimedOfferLayout.howToUsePinCode}
                role="group"
                aria-label={`PIN ${pinResult.digits.join("")}`}
              >
                <Typography
                  variant="heading-m-accent"
                  as="span"
                  inlineStyle={PIN_CODE_STYLE}
                >
                  {pinResult.digits.join("")}
                </Typography>
              </div>
            : <Typography variant="body-s-regular" color="secondary" as="span">
                {pinResult.message}
              </Typography>
            }
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            disabled={expired || !claimIsForToday || checkedIn}
            aria-label={
              expired ?
                "Offer expired, check-in unavailable"
              : !claimIsForToday ?
                "Check-in available on the day of your offer"
              : CLAIMED_OFFER_CHECK_IN_CTA
            }
            onClick={handleCheckInPress}
          >
            {CLAIMED_OFFER_CHECK_IN_CTA}
          </Button>
        </div>
      </div>

      <div className={claimedOfferLayout.howToUseStepRow}>
        <StepBadge n={2} />
        <Typography variant="body-m-regular" color="primary" as="p">
          {formatClaimedOfferPayStepTitle(cashbackPercent)}
        </Typography>
      </div>

      <div className={claimedOfferLayout.howToUsePayCardWrap}>
        <div
          ref={payCardRef}
          className={
            payEnabled ?
              claimedOfferLayout.howToUsePayCardEnabled
            : claimedOfferLayout.howToUsePayCardDisabled
          }
        >
          <div className="flex w-full flex-col items-start gap-1 py-4">
            <Typography
              variant="body-m-accent"
              color={payEnabled ? "primary" : "tertiary"}
              as="p"
              // Kalep Typography always includes `text-primary`; inline color wins the conflict.
              inlineStyle={
                payEnabled ?
                  undefined
                : { color: "var(--color-content-tertiary)" }
              }
            >
              {CLAIMED_OFFER_PAY_CARD_TITLE}
            </Typography>
            <Typography
              variant="body-s-regular"
              color={payEnabled ? "secondary" : "tertiary"}
              as="p"
              inlineStyle={
                payEnabled ?
                  undefined
                : { color: "var(--color-content-tertiary)" }
              }
            >
              {CLAIMED_OFFER_PAY_CARD_HINT}
            </Typography>
          </div>
          <Button
            type="button"
            variant={payEnabled ? "primary" : "secondary"}
            size="lg"
            fullWidth
            disabled={!payEnabled}
            aria-label={payAriaLabel}
            onClick={handlePay}
          >
            <Typography
              variant="body-l-accent"
              color={payEnabled ? "primary-inverted" : "tertiary"}
              as="span"
            >
              {payCtaLabel}
            </Typography>
          </Button>
        </div>
      </div>
    </section>
  )
}
