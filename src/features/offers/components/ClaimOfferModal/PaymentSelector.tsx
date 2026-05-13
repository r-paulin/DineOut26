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

/**
 * Payment method radios + DineOut-only inline promo (Figma MODAL / Claiming offer).
 * GSAP fades the promo when switching away from Bolt DineOut.
 */
export function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
  const groupName = "claim-offer-payment"
  const [renderedPromo, setRenderedPromo] = useState<"dineout" | "empty">(() =>
    value === "dineout" ? "dineout" : "empty",
  )
  const bannerRef = useRef<HTMLDivElement>(null)
  const lastValueRef = useRef(value)

  useLayoutEffect(() => {
    const prev = lastValueRef.current
    lastValueRef.current = value

    const el = bannerRef.current
    if (el) gsap.killTweensOf(el)

    if (value === "dineout") {
      if (prev === "dineout") return
      if (prefersReducedMotion()) {
        setRenderedPromo("dineout")
        return
      }
      flushSync(() => {
        setRenderedPromo("dineout")
      })
      const node = bannerRef.current
      if (!node) return
      gsap.fromTo(
        node,
        {
          autoAlpha: 0,
          scale: 0.98,
          transformOrigin: "50% 50%",
          force3D: true,
        },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.22,
          ease: "power2.out",
          force3D: true,
        },
      )
      return
    }

    if (prev !== "dineout") return

    if (!el || prefersReducedMotion()) {
      setRenderedPromo("empty")
      return
    }
    gsap.to(el, {
      autoAlpha: 0,
      scale: 0.98,
      duration: 0.15,
      ease: "power2.in",
      transformOrigin: "50% 50%",
      force3D: true,
      onComplete: () => {
        setRenderedPromo("empty")
      },
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
                className="flex w-full cursor-pointer flex-row items-start gap-3 pb-[15px] pt-4 transition-colors hover:bg-active-neutral-secondary focus-within:bg-active-neutral-secondary"
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
                className="flex w-full cursor-pointer flex-row items-start gap-3 pb-[15px] pt-4 transition-colors hover:bg-active-neutral-secondary focus-within:bg-active-neutral-secondary"
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
        {renderedPromo === "dineout" ?
          <div
            ref={bannerRef}
            className="flex min-h-[48px] w-full gap-2 rounded-xl bg-action-secondary px-3 py-3 [will-change:transform,opacity]"
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
  )
}
