import { Button, Typography } from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import gsap from "gsap"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { BillAmountOfferBadges } from "@/features/payBill/components/BillAmountScreen/BillAmountOfferBadges"
import { ReceiptAmountBlock } from "@/features/payBill/components/BillAmountScreen/ReceiptAmountBlock"
import { useAnimatedBillCents } from "@/features/payBill/hooks/useAnimatedBillCents"
import type { PayBillAmountBadges } from "@/features/payBill/payBill.types"
import {
  billStateFromFormattedInput,
  billStateToCents,
  formatBillDisplayEur,
  initialBillNumpadState,
  isBillAmountValidForContinue,
} from "@/features/payBill/utils/billAmount"
import { useVisualViewportKeyboardBottomInset } from "@/shared/hooks/useVisualViewportKeyboardBottomInset"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface BillAmountScreenProps {
  restaurantName: string
  billAmountBadges?: PayBillAmountBadges
  onDismiss: () => void
  onContinue: (amount: number) => void
}

/**
 * Bill amount entry — Figma receipt total, NBSP grouping; native keyboard (mobile + desktop).
 */
export function BillAmountScreen({
  restaurantName,
  billAmountBadges,
  onDismiss,
  onContinue,
}: BillAmountScreenProps) {
  const [state, setState] = useState(initialBillNumpadState)
  const [labelText, setLabelText] = useState<"Receipt total" | "Enter amount">(
    "Receipt total",
  )
  const [labelColor, setLabelColor] = useState<"secondary" | "danger-primary">(
    "secondary",
  )

  const amountRef = useRef<HTMLSpanElement>(null)
  const scaleWrapRef = useRef<HTMLSpanElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const labelMotionRef = useRef<HTMLDivElement>(null)
  const errorColorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyboardBottomPx = useVisualViewportKeyboardBottomInset()
  const keyboardLikelyOpen = keyboardBottomPx > 48

  const cents = billStateToCents(state)
  useAnimatedBillCents(state, amountRef, scaleWrapRef)

  const display = formatBillDisplayEur(state, { dimWhenZero: true })
  const valid = isBillAmountValidForContinue(state)

  /** Desktop + touch: focus the transparent field on mount (native `autoFocus` is flaky after route/portal paint). */
  useLayoutEffect(() => {
    const el = hiddenInputRef.current
    if (!el) return
    const id = window.requestAnimationFrame(() => {
      el.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (cents > 0) {
      setLabelText("Receipt total")
      setLabelColor("secondary")
      if (errorColorTimerRef.current) {
        clearTimeout(errorColorTimerRef.current)
        errorColorTimerRef.current = null
      }
    }
  }, [cents])

  useEffect(
    () => () => {
      if (errorColorTimerRef.current) clearTimeout(errorColorTimerRef.current)
    },
    [],
  )

  const runInvalidSubmitFeedback = useCallback(() => {
    setLabelText("Enter amount")
    setLabelColor("danger-primary")
    const el = labelMotionRef.current
    if (el && !prefersReducedMotion()) {
      gsap.killTweensOf(el)
      gsap.set(el, { x: 0 })
      gsap.to(el, {
        keyframes: [
          { x: -6, duration: 0.07 },
          { x: 6, duration: 0.07 },
          { x: -4, duration: 0.06 },
          { x: 4, duration: 0.06 },
          { x: 0, duration: 0.05 },
        ],
        ease: "none",
      })
    }
    if (errorColorTimerRef.current) clearTimeout(errorColorTimerRef.current)
    errorColorTimerRef.current = setTimeout(() => {
      setLabelColor("secondary")
      errorColorTimerRef.current = null
    }, 2000)
  }, [])

  const onContinueClick = useCallback(() => {
    if (valid) {
      onContinue(cents / 100)
      return
    }
    runInvalidSubmitFeedback()
  }, [cents, onContinue, runInvalidSubmitFeedback, valid])

  return (
    <div className="flex h-[var(--app-h)] max-h-[var(--app-h)] w-full min-h-0 flex-col bg-layer-floor-1">
      <header className="flex shrink-0 items-center gap-4 px-6 pt-[max(1rem,var(--safe-area-top))] pb-3">
        <button
          type="button"
          aria-label="Go back"
          onClick={onDismiss}
          className="flex size-6 shrink-0 items-center justify-center rounded-full border-none bg-transparent p-0 text-primary outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
        >
          <ArrowLeft size="md" className="text-primary" aria-hidden />
        </button>
        <div className="min-h-[24px] min-w-0 flex-1 text-center">
          <Typography
            variant="body-l-accent"
            color="primary"
            as="p"
            align="center"
            noWrap
            inlineStyle={{
              fontVariationSettings: "'wght' var(--font-weight-semibold)",
              fontFeatureSettings: FONT_FEAT,
            }}
          >
            {restaurantName}
          </Typography>
        </div>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        style={{
          paddingBottom:
            "calc(6.25rem + max(0.75rem, var(--safe-area-bottom, 0px)))",
        }}
      >
        <div
          className={`flex flex-col items-center transition-[padding-top] duration-200 ease-out ${
            keyboardLikelyOpen ? "pt-16 sm:pt-20" : "pt-[220px]"
          }`}
        >
          <ReceiptAmountBlock
            label={labelText}
            labelColor={labelColor}
            labelMotionRef={labelMotionRef}
            autoFocusInput
            display={display}
            amountRef={amountRef}
            scaleWrapRef={scaleWrapRef}
            hiddenInputRef={hiddenInputRef}
            onTapAmount={() => {
              hiddenInputRef.current?.focus()
            }}
            onHiddenInputChange={(raw) => {
              setState(billStateFromFormattedInput(raw))
            }}
            inputName="billAmount"
            inputAriaLabel="Bill amount"
          />
          <BillAmountOfferBadges badges={billAmountBadges} />
        </div>
      </div>

      <div
        className="fixed left-1/2 z-30 flex w-full max-w-[var(--shell-width)] -translate-x-1/2 flex-col bg-layer-floor-1 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        style={{
          bottom: keyboardBottomPx,
          paddingBottom: "max(0.75rem, var(--safe-area-bottom, 0px))",
        }}
      >
        <div className="px-6 pb-3 pt-2">
          <Button
            type="button"
            variant={valid ? "primary" : "secondary"}
            fullWidth
            aria-disabled={!valid}
            onClick={onContinueClick}
            overrideClassName="!min-h-[68px] h-[68px] rounded-full"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
