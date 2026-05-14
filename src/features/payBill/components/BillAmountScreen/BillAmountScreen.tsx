import { Button, Typography } from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import gsap from "gsap"
import type { CSSProperties } from "react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { ReceiptAmountBlock } from "@/features/payBill/components/BillAmountScreen/ReceiptAmountBlock"
import { BillAmountTitleSection } from "@/features/payBill/components/BillAmountScreen/BillAmountTitleSection"
import { useAnimatedBillCents } from "@/features/payBill/hooks/useAnimatedBillCents"
import {
  billStateFromFormattedInput,
  billStateToCents,
  formatBillDisplayEur,
  initialBillNumpadState,
  isBillAmountValidForContinue,
} from "@/features/payBill/utils/billAmount"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"
import { useCoarsePointer } from "@/shared/hooks/useCoarsePointer"
import { useVisualViewportLayout } from "@/shared/hooks/useVisualViewportLayout"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const BILL_AMOUNT_ERROR_ID = "bill-amount-screen-error"

export interface BillAmountScreenProps {
  restaurantName: string
  /** When set, subtitle explains claimed discount % (Figma claimed variant). */
  claimedOffer: ClaimedOffer | null
  onDismiss: () => void
  onContinue: (amount: number) => void
}

/**
 * Bill amount entry — Figma receipt total, NBSP grouping; native keyboard (mobile + desktop).
 */
export function BillAmountScreen({
  restaurantName,
  claimedOffer,
  onDismiss,
  onContinue,
}: BillAmountScreenProps) {
  const [state, setState] = useState(initialBillNumpadState)
  const [showAmountError, setShowAmountError] = useState(false)

  const amountRef = useRef<HTMLSpanElement>(null)
  const scaleWrapRef = useRef<HTMLSpanElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const errorMotionRef = useRef<HTMLDivElement>(null)
  const errorColorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const coarse = useCoarsePointer()
  const vvLayout = useVisualViewportLayout(coarse)

  const cents = billStateToCents(state)
  useAnimatedBillCents(state, amountRef, scaleWrapRef)

  const display = formatBillDisplayEur(state, { dimWhenZero: true })
  const valid = isBillAmountValidForContinue(state)

  const subtitle =
    claimedOffer ?
      `Confirm the ${formatDiscountPercent(claimedOffer.discountPercent)}% discount is on the receipt and enter the final amount.`
    : "Enter the final amount from your receipt."

  /** Native keyboard: focus after paint; retries cover portal / iOS timing. */
  useLayoutEffect(() => {
    const el = hiddenInputRef.current
    if (!el) return
    const id = window.requestAnimationFrame(() => {
      el.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const el = hiddenInputRef.current
    if (!el) return
    const tryFocus = () => {
      if (document.activeElement !== el) {
        el.focus({ preventScroll: true })
      }
    }
    const t0 = window.setTimeout(tryFocus, 0)
    const t1 = window.setTimeout(tryFocus, 80)
    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
    }
  }, [])

  const clearAmountError = useCallback(() => {
    setShowAmountError(false)
    if (errorColorTimerRef.current) {
      clearTimeout(errorColorTimerRef.current)
      errorColorTimerRef.current = null
    }
  }, [])

  const onHiddenInputChange = useCallback(
    (raw: string) => {
      const next = billStateFromFormattedInput(raw)
      setState(next)
      if (billStateToCents(next) > 0) {
        clearAmountError()
      }
    },
    [clearAmountError],
  )

  useEffect(
    () => () => {
      if (errorColorTimerRef.current) clearTimeout(errorColorTimerRef.current)
    },
    [],
  )

  const runInvalidSubmitFeedback = useCallback(() => {
    setShowAmountError(true)
    const el = errorMotionRef.current
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
      setShowAmountError(false)
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

  const rootStyle: CSSProperties | undefined =
    coarse && vvLayout ?
      {
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "var(--shell-width)",
        top: vvLayout.offsetTop,
        height: vvLayout.height,
        maxHeight: vvLayout.height,
      }
    : undefined

  return (
    <div
      className={[
        "flex w-full min-h-0 flex-col bg-layer-floor-1",
        !(coarse && vvLayout) ? "h-[var(--app-h)] max-h-[var(--app-h)]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
    >
      <header className="flex shrink-0 flex-col gap-[15px] bg-layer-floor-1 pt-[max(2.5rem,var(--safe-area-top))]">
        <div className="flex min-h-6 items-center gap-4 px-6">
          <button
            type="button"
            aria-label="Back"
            onClick={onDismiss}
            className="flex size-6 shrink-0 items-center justify-center rounded-full border-none bg-transparent p-0 text-primary outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
          >
            <ArrowLeft size="md" className="text-primary" aria-hidden />
          </button>
          <div className="flex min-h-[24px] min-w-0 flex-1 items-center justify-center">
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
          <span className="size-6 shrink-0" aria-hidden />
        </div>

        <div
          className="h-px w-full shrink-0 bg-[var(--color-border-separator)]"
          aria-hidden
        />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-0 py-6">
            <BillAmountTitleSection subtitle={subtitle} />
            <ReceiptAmountBlock
              errorMessage={showAmountError ? "Enter amount" : null}
              errorMotionRef={errorMotionRef}
              errorId={BILL_AMOUNT_ERROR_ID}
              autoFocusInput
              display={display}
              amountRef={amountRef}
              scaleWrapRef={scaleWrapRef}
              hiddenInputRef={hiddenInputRef}
              onTapAmount={() => {
                hiddenInputRef.current?.focus()
              }}
              onHiddenInputChange={onHiddenInputChange}
              inputName="billAmount"
              inputAriaLabel="Bill amount"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 flex-col items-center gap-[11px] bg-layer-floor-1 pb-3 pt-0">
        <div className="flex w-full flex-col items-center gap-3 px-6">
          <Button
            type="button"
            variant="primary"
            fullWidth
            aria-disabled={!valid}
            onClick={onContinueClick}
            overrideClassName="!min-h-14 h-14 rounded-full"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
