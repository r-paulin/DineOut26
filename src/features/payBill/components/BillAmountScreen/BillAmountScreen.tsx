import { Button } from "@bolteu/kalep-react"
import { PayBillScreenHeader } from "@/features/payBill/components/shared/PayBillScreenHeader"
import gsap from "gsap"
import type { CSSProperties } from "react"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { ReceiptAmountBlock } from "@/features/payBill/components/BillAmountScreen/ReceiptAmountBlock"
import { BillAmountTitleSection } from "@/features/payBill/components/BillAmountScreen/BillAmountTitleSection"
import { useAnimatedBillCents } from "@/features/payBill/hooks/useAnimatedBillCents"
import {
  BILL_AMOUNT_SUBTITLE_CLAIMED,
  BILL_AMOUNT_SUBTITLE_DEFAULT,
} from "@/features/payBill/constants/billAmountScreenCopy"
import {
  billStateFromFormattedInput,
  billStateToCents,
  formatBillDisplayEur,
  initialBillNumpadState,
  isBillAmountValidForContinue,
} from "@/features/payBill/utils/billAmount"
import { useCoarsePointer } from "@/shared/hooks/useCoarsePointer"
import { useVisualViewportLayout } from "@/shared/hooks/useVisualViewportLayout"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

const BILL_AMOUNT_ERROR_ID = "bill-amount-screen-error"

export interface BillAmountScreenProps {
  restaurantName: string
  /** When set, subtitle prompts guest to verify offer on receipt (Figma claimed variant). */
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
  const coarse = useCoarsePointer()
  const vvLayout = useVisualViewportLayout(coarse)

  const cents = billStateToCents(state)
  useAnimatedBillCents(state, amountRef, scaleWrapRef)

  const display = formatBillDisplayEur(state, { dimWhenZero: true })
  const valid = isBillAmountValidForContinue(state)

  const subtitle =
    claimedOffer ? BILL_AMOUNT_SUBTITLE_CLAIMED : BILL_AMOUNT_SUBTITLE_DEFAULT

  /** Native keyboard: one rAF focus + single retry for portal / iOS timing. */
  useLayoutEffect(() => {
    const el = hiddenInputRef.current
    if (!el) return
    const rafId = window.requestAnimationFrame(() => {
      el.focus({ preventScroll: true })
    })
    const retryId = window.setTimeout(() => {
      if (document.activeElement !== el) {
        el.focus({ preventScroll: true })
      }
    }, 80)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(retryId)
    }
  }, [])

  const onHiddenInputChange = useCallback((raw: string) => {
    const next = billStateFromFormattedInput(raw)
    setState(next)
    if (billStateToCents(next) > 0) {
      setShowAmountError(false)
    }
  }, [])

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
      <PayBillScreenHeader title={restaurantName} onBack={onDismiss} />

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
              onHiddenInputChange={onHiddenInputChange}
              inputName="billAmount"
              inputAriaLabel="Bill amount in euros"
            />
          </div>
        </div>
      </div>

      <div
        data-snackbar-anchor=""
        className="relative z-10 flex shrink-0 flex-col items-center gap-[11px] bg-layer-floor-1 pb-[max(1.5rem,var(--safe-area-bottom))] pt-0"
      >
        <div className="flex w-full flex-col items-center gap-3 px-6">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            aria-describedby={showAmountError ? BILL_AMOUNT_ERROR_ID : undefined}
            onClick={onContinueClick}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
