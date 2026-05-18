import { Radio, RadioGroup, Typography } from "@bolteu/kalep-react"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import { useLayoutEffect, useRef, useState, type TransitionEvent } from "react"
import {
  DINEOUT_CLAIM_INLINE_PRIMARY,
  DINEOUT_CLAIM_INLINE_SECONDARY,
} from "@/features/offers/constants/dineOutStackablePromo"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (next: PaymentMethod) => void
}

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

const PROMO_TRANSITION_MS = 300

const PAYMENT_OPTION_LABEL_CLASS =
  "flex w-full cursor-pointer flex-row items-start gap-3 pb-[15px] pt-4"

/**
 * Payment method radios + DineOut-only inline promo (Figma MODAL / Claiming offer).
 * Promo slot uses CSS grid `0fr` → `1fr` (same pattern as venue accordions) so height
 * is not tweened via GSAP — avoids measure/clearProps flashes on enter and exit.
 */
export function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
  const groupName = "claim-offer-payment"
  const isDineout = value === "dineout"
  const reducedMotion = prefersReducedMotion()

  const [promoMounted, setPromoMounted] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  const animationGenerationRef = useRef(0)

  useLayoutEffect(() => {
    animationGenerationRef.current += 1
    const generation = animationGenerationRef.current

    if (isDineout) {
      setPromoMounted(true)

      if (reducedMotion) {
        setPromoOpen(true)
        return
      }

      setPromoOpen(false)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (animationGenerationRef.current !== generation) return
          setPromoOpen(true)
        })
      })
      return () => {
        cancelAnimationFrame(frame)
      }
    }

    setPromoOpen(false)
    if (reducedMotion) {
      setPromoMounted(false)
    }
  }, [isDineout, reducedMotion])

  const handlePromoTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "grid-template-rows") return
    if (event.target !== event.currentTarget) return
    if (promoOpen || isDineout) return
    setPromoMounted(false)
  }

  const promoGridClass = [
    "grid overflow-hidden",
    reducedMotion ? "" : "transition-[grid-template-rows] ease-out",
    promoOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
  ]
    .filter(Boolean)
    .join(" ")

  const promoBannerClass = [
    "flex min-h-[48px] w-full gap-2 rounded-xl bg-action-secondary px-3 py-3",
    reducedMotion ? "" : "transition-[opacity,transform] ease-out",
    promoOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
  ]
    .filter(Boolean)
    .join(" ")

  const transitionStyle = reducedMotion
    ? undefined
    : { transitionDuration: `${PROMO_TRANSITION_MS}ms` }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col px-6 pt-0">
        <div className="flex gap-3 pt-[15px]">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Typography variant="body-m-accent" color="primary" as="p">
              Payment method
            </Typography>
            <Typography variant="body-s-regular" color="secondary" as="p">
              Select how you&apos;ll settle the bill at the restaurant
            </Typography>
          </div>
        </div>
        <div className="mt-0 h-px w-full shrink-0 bg-separator" aria-hidden />
      </div>

      <div className="px-6 pt-0">
        <RadioGroup
          name={groupName}
          value={value}
          onChange={(e) => onChange(e.target.value as PaymentMethod)}
          aria-labelledby={`${groupName}-heading`}
        >
          <span id={`${groupName}-heading`} className="sr-only">
            Payment method
          </span>
          <div className="flex w-full flex-col">
            <div className="w-full border-b border-separator">
              <label
                htmlFor={`${groupName}-dineout`}
                className={PAYMENT_OPTION_LABEL_CLASS}
              >
                <span className="min-w-0 flex-1 text-start">
                  <Typography as="span" variant="body-m-regular" color="primary">
                    Pay with Bolt DineOut
                  </Typography>
                </span>
                <Radio id={`${groupName}-dineout`} value="dineout" />
              </label>
            </div>
            <div className="w-full">
              <label
                htmlFor={`${groupName}-card`}
                className={PAYMENT_OPTION_LABEL_CLASS}
              >
                <span className="min-w-0 flex-1 text-start">
                  <Typography as="span" variant="body-m-regular" color="primary">
                    Pay by card or cash
                  </Typography>
                </span>
                <Radio id={`${groupName}-card`} value="card_or_cash" />
              </label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="min-h-0 px-6 pb-8 pt-0">
        <div
          className={promoGridClass}
          style={transitionStyle}
          onTransitionEnd={handlePromoTransitionEnd}
        >
          <div className="min-h-0 overflow-hidden">
            {promoMounted ?
              <div className={promoBannerClass} style={transitionStyle}>
                <CheckCircle
                  size="md"
                  className="size-6 shrink-0 text-action-primary"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
                  <Typography
                    as="p"
                    variant="body-s-accent"
                    color="primary"
                    inlineStyle={SEMIBOLD}
                  >
                    {DINEOUT_CLAIM_INLINE_PRIMARY}
                  </Typography>
                  <Typography as="p" variant="body-s-regular" color="primary">
                    {DINEOUT_CLAIM_INLINE_SECONDARY}
                  </Typography>
                </div>
              </div>
            : null}
          </div>
        </div>
      </div>
    </div>
  )
}