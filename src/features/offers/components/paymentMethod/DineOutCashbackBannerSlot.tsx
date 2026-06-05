import { Typography } from "@bolteu/kalep-react"
import { useLayoutEffect, useRef, useState, type ReactNode, type TransitionEvent } from "react"
import { DineOutCashbackBanner } from "@/features/offers/components/DineOutCashbackBanner"
import {
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL,
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL_ACTIVE,
} from "@/features/offers/constants/paymentMethodSheetCopy"
import {
  MOTION_IN_PAGE_S,
  MOTION_REDUCED_S,
  MOTION_SHEET_DISMISS_S,
} from "@/shared/motion/motionDurations"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

/** Apple HIG emphasized deceleration (enter). */
const EASE_EMPHASIZED_ENTER_CSS = "cubic-bezier(0.32, 0.72, 0, 1)"
/** Apple HIG emphasized acceleration (exit). */
const EASE_EMPHASIZED_EXIT_CSS = "cubic-bezier(0.58, 0, 0.92, 0.36)"

const ENTER_MS = Math.round(MOTION_IN_PAGE_S * 1000)
const EXIT_MS = Math.round(MOTION_SHEET_DISMISS_S * 1000)
const REDUCED_MS = Math.round(MOTION_REDUCED_S * 1000)

export interface DineOutCashbackBannerSlotProps {
  visible: boolean
  cashbackPercent?: number
  secondaryText?: string
  onDismiss?: () => void
  /** Outer padding wrapper (Figma `_Cashback` uses px-6 pb-6). */
  className?: string
}

/**
 * Animated show/hide wrapper for {@link DineOutCashbackBanner} (CSS grid collapse).
 */
export function DineOutCashbackBannerSlot({
  visible,
  cashbackPercent,
  secondaryText,
  onDismiss,
  className = "px-6 pb-6",
}: DineOutCashbackBannerSlotProps) {
  const reducedMotion = prefersReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const animationGenerationRef = useRef(0)

  useLayoutEffect(() => {
    animationGenerationRef.current += 1
    const generation = animationGenerationRef.current

    if (visible) {
      setMounted(true)

      if (reducedMotion) {
        setOpen(true)
        return
      }

      setOpen(false)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (animationGenerationRef.current !== generation) return
          setOpen(true)
        })
      })
      return () => {
        cancelAnimationFrame(frame)
      }
    }

    setOpen(false)
    if (reducedMotion) {
      setMounted(false)
    }
  }, [visible, reducedMotion])

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "grid-template-rows") return
    if (event.target !== event.currentTarget) return
    if (open || visible) return
    setMounted(false)
  }

  const durationMs = reducedMotion ? REDUCED_MS : open ? ENTER_MS : EXIT_MS
  const easing = reducedMotion
    ? "ease-out"
    : open
      ? EASE_EMPHASIZED_ENTER_CSS
      : EASE_EMPHASIZED_EXIT_CSS

  const transitionStyle = {
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: easing,
  }

  const gridClass = [
    "grid overflow-hidden",
    reducedMotion ? "" : "transition-[grid-template-rows]",
    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
  ]
    .filter(Boolean)
    .join(" ")

  const innerClass = [
    reducedMotion ? "" : "transition-[opacity,transform]",
    open ?
      "translate-y-0 scale-100 opacity-100"
    : "-translate-y-1 scale-[0.98] opacity-0",
  ]
    .filter(Boolean)
    .join(" ")

  if (!mounted && !visible) return null

  return (
    <div className={className} aria-hidden={!open && !visible}>
      <div
        className={gridClass}
        style={transitionStyle}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="min-h-0 overflow-hidden">
          {mounted ?
            <div className={innerClass} style={transitionStyle}>
              <DineOutCashbackBanner
                cashbackPercent={cashbackPercent}
                secondaryText={secondaryText}
                onDismiss={onDismiss}
              />
            </div>
          : null}
        </div>
      </div>
    </div>
  )
}

export function paymentMethodOptionClass(
  withDivider: boolean,
  showSubtitle = false,
): string {
  const padding =
    showSubtitle ? "pb-[9px] pt-[10px]" : "pb-[15px] pt-4"
  return [
    "flex w-full cursor-pointer flex-row items-start gap-3",
    padding,
    withDivider ? "border-b border-separator" : "",
  ]
    .filter(Boolean)
    .join(" ")
}

export interface PaymentMethodOptionLabels {
  dineout: string
  cardOrCash: string
}

export const CLAIM_FLOW_PAYMENT_LABELS: PaymentMethodOptionLabels = {
  dineout: PAYMENT_METHOD_DINEOUT_OPTION_LABEL,
  cardOrCash: "Pay by card or cash",
} as const

export const CLAIMED_OFFER_PAYMENT_LABELS: PaymentMethodOptionLabels = {
  dineout: PAYMENT_METHOD_DINEOUT_OPTION_LABEL_ACTIVE,
  cardOrCash: "Paying with card or cash",
} as const

/** Figma Heading XS / XS Accent (`16388:31183`). */
export const PAYMENT_METHOD_HEADING_XS_ACCENT_STYLE = {
  fontSize: "var(--Heading-XS-font-size, 20px)",
  lineHeight: "var(--Heading-XS-line-height, 25px)",
  letterSpacing: "-0.34px",
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

export type PaymentMethodSheetHeaderVariant =
  | "heading-xs-accent"
  | "heading-s-bottom-sheet"
  | "body-m-accent"

export interface PaymentMethodSheetHeaderProps {
  title: ReactNode
  description: string
  titleVariant?: PaymentMethodSheetHeaderVariant
  /** Associates the visible title with a radio group (`aria-labelledby`). */
  headingId?: string
}

export function PaymentMethodSheetHeader({
  title,
  description,
  titleVariant = "body-m-accent",
  headingId,
}: PaymentMethodSheetHeaderProps) {
  if (titleVariant === "heading-s-bottom-sheet") {
    return (
      <div
        id={headingId}
        className="flex min-h-8 flex-col gap-1 px-6 pt-5 pb-3 pr-12"
      >
        <Typography variant="heading-s-accent" color="primary" as="p">
          {title}
        </Typography>
        <Typography variant="body-m-regular" color="secondary" as="p">
          {description}
        </Typography>
      </div>
    )
  }

  if (titleVariant === "heading-xs-accent") {
    return (
      <>
        <div
          id={headingId}
          className="flex min-h-8 items-center gap-2 pt-4 pb-3 pl-6 pr-12"
        >
          <Typography
            as="p"
            variant="heading-xs-accent"
            color="primary"
            inlineStyle={PAYMENT_METHOD_HEADING_XS_ACCENT_STYLE}
          >
            {title}
          </Typography>
        </div>
        <div className="px-6">
          <Typography variant="body-s-regular" color="secondary" as="p">
            {description}
          </Typography>
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col px-6 pt-0">
      <div className="flex gap-3 pt-[15px]">
        <div id={headingId} className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography variant="body-m-accent" color="primary" as="p">
            {title}
          </Typography>
          <Typography variant="body-s-regular" color="secondary" as="p">
            {description}
          </Typography>
        </div>
      </div>
    </div>
  )
}
