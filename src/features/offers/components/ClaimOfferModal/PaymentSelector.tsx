import { Radio, RadioGroup, Typography } from "@bolteu/kalep-react"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import gsap from "gsap"
import { useLayoutEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
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

const PROMO_ENTER_DURATION = 0.28
const PROMO_EXIT_DURATION = 0.26

const PAYMENT_OPTION_LABEL_CLASS =
  "flex w-full cursor-pointer flex-row items-start gap-3 pb-[15px] pt-4 hover:bg-active-neutral-secondary"

function animatePromoIn(slot: HTMLElement, banner: HTMLElement) {
  gsap.killTweensOf([slot, banner])
  const targetHeight = banner.offsetHeight
  gsap.set(slot, { height: 0, overflow: "hidden" })
  gsap.set(banner, { opacity: 0, y: 8 })
  gsap.to(slot, {
    height: targetHeight,
    duration: PROMO_ENTER_DURATION,
    ease: "power2.out",
  })
  gsap.to(banner, {
    opacity: 1,
    y: 0,
    duration: PROMO_ENTER_DURATION,
    ease: "power2.out",
    onComplete: () => {
      gsap.set(slot, { height: "auto", clearProps: "overflow" })
      gsap.set(banner, { clearProps: "transform,opacity" })
    },
  })
}

function animatePromoOut(
  slot: HTMLElement,
  banner: HTMLElement,
  onDone: () => void,
) {
  gsap.killTweensOf([slot, banner])
  const startHeight = slot.offsetHeight
  gsap.set(slot, { height: startHeight, overflow: "hidden" })
  gsap.to(banner, {
    opacity: 0,
    y: -6,
    duration: PROMO_EXIT_DURATION * 0.75,
    ease: "power2.in",
  })
  gsap.to(slot, {
    height: 0,
    duration: PROMO_EXIT_DURATION,
    ease: "power2.inOut",
    onComplete: () => {
      onDone()
      gsap.set([slot, banner], { clearProps: "all" })
    },
  })
}

/**
 * Payment method radios + DineOut-only inline promo (Figma MODAL / Claiming offer).
 * GSAP expands/collapses the promo slot when switching Bolt DineOut.
 */
export function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
  const groupName = "claim-offer-payment"
  const [renderedPromo, setRenderedPromo] = useState<"dineout" | "empty">(() =>
    value === "dineout" ? "dineout" : "empty",
  )
  const promoSlotRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const lastValueRef = useRef(value)

  useLayoutEffect(() => {
    const prev = lastValueRef.current
    lastValueRef.current = value

    const slot = promoSlotRef.current
    const banner = bannerRef.current
    if (slot || banner) gsap.killTweensOf([slot, banner].filter(Boolean))

    if (value === "dineout") {
      if (prev === "dineout") return
      if (prefersReducedMotion()) {
        setRenderedPromo("dineout")
        return
      }
      flushSync(() => {
        setRenderedPromo("dineout")
      })
      const slotEl = promoSlotRef.current
      const bannerEl = bannerRef.current
      if (!slotEl || !bannerEl) return
      animatePromoIn(slotEl, bannerEl)
      return
    }

    if (prev !== "dineout") return

    if (!slot || !banner || prefersReducedMotion()) {
      setRenderedPromo("empty")
      return
    }
    animatePromoOut(slot, banner, () => {
      setRenderedPromo("empty")
    })
  }, [value])

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
        <div ref={promoSlotRef} className="overflow-hidden">
          {renderedPromo === "dineout" ?
            <div
              ref={bannerRef}
              className="flex min-h-[48px] w-full gap-2 rounded-xl bg-action-secondary px-3 py-3"
            >
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
  )
}
