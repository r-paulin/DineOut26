import { Radio, RadioGroup, Typography } from "@bolteu/kalep-react"
import Alert from "@bolteu/kalep-react-icons/dist/Alert"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import gsap from "gsap"
import { useLayoutEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT } from "@/features/offers/constants/dineOutStackablePromo"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (next: PaymentMethod) => void
}

function PromoWithBoldPercent(text: string) {
  const m = text.match(/(\d+%)/)
  if (!m || m.index === undefined) {
    return (
      <Typography as="p" variant="body-s-regular" color="primary">
        {text}
      </Typography>
    )
  }
  const i = m.index
  const pct = m[1]!
  return (
    <Typography as="p" variant="body-s-regular" color="primary">
      {text.slice(0, i)}
      <b>{pct}</b>
      {text.slice(i + pct.length)}
    </Typography>
  )
}

/**
 * Payment method radios + contextual info banner.
 * Uses {@link Alert} instead of `WarningFilled` (not in kalep-react-icons).
 * Banner swap uses GSAP (fade + light scale) in place when the selection changes.
 */
export function PaymentSelector({
  value,
  onChange,
}: PaymentSelectorProps) {
  const groupName = "claim-offer-payment"
  /** Stacks with venue offers; always 40% (see restaurant “More benefits” DineOut row). */
  const dineoutBannerText = DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT

  const [renderedMethod, setRenderedMethod] = useState<PaymentMethod>(value)
  const bannerRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  /** Last payment method reflected in the banner DOM (avoids `[renderedMethod]` deps — cleanup would kill mid-enter). */
  const lastBannerMethodRef = useRef<PaymentMethod>(value)

  useLayoutEffect(() => {
    if (value === lastBannerMethodRef.current) return

    const el = bannerRef.current
    tlRef.current?.kill()
    tlRef.current = null
    if (el) gsap.killTweensOf(el)

    if (!el || prefersReducedMotion()) {
      setRenderedMethod(value)
      lastBannerMethodRef.current = value
      return
    }

    const tl = gsap.timeline()
    tlRef.current = tl

    tl.to(el, {
      autoAlpha: 0,
      scale: 0.98,
      duration: 0.15,
      ease: "power2.in",
      transformOrigin: "50% 50%",
      force3D: true,
    })
      .call(() => {
        flushSync(() => {
          setRenderedMethod(value)
          lastBannerMethodRef.current = value
        })
      })
      .fromTo(
        el,
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
        },
      )

    return () => {
      tl.kill()
    }
  }, [value])

  return (
    <div className="flex flex-col px-6 pt-4">
      <Typography variant="body-m-accent" color="primary" as="p">
        Payment method
      </Typography>
      <div className="mt-1">
        <Typography variant="body-s-regular" color="secondary" as="p">
          Select how you&apos;ll settle the bill at the restaurant
        </Typography>
      </div>

      <div className="mt-4">
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
                className="flex w-full cursor-pointer flex-row items-start gap-3 pb-[15px] pt-4"
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
                className="flex w-full cursor-pointer flex-row items-start gap-3 pb-[15px] pt-4"
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

      <div
        ref={bannerRef}
        className="mt-4 mb-8 w-full [will-change:transform,opacity]"
      >
        {renderedMethod === "dineout" ? (
          <div className="flex w-full gap-3 rounded-lg bg-action-secondary px-3 py-3">
            <CheckCircle
              size="md"
              className="size-6 shrink-0 text-action-primary"
              aria-hidden
            />
            <div className="min-w-0 flex-1">{PromoWithBoldPercent(dineoutBannerText)}</div>
          </div>
        ) : (
          <div className="flex w-full gap-3 rounded-lg bg-danger-secondary px-3 py-3">
            <Alert
              size="md"
              className="size-6 shrink-0 text-danger-primary"
              aria-hidden
            />
            <Typography as="p" variant="body-s-regular" color="primary">
              The restaurant offer applies. No additional DineOut rewards are
              included with this payment option.
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}
