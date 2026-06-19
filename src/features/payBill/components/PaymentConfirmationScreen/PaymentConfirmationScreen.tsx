import { useRef } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import paySuccessCheckmarkUrl from "@/features/payBill/assets/pay-success-checkmark-180.png"
import { PaymentConfirmationNavbar } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationNavbar"
import { PaymentConfirmationSummarySheet } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationSummarySheet"
import { PaymentSuccessTitle } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentSuccessTitle"
import {
  PAY_SUCCESS_CHECKMARK_START_PX,
  usePaymentConfirmationReveal,
} from "@/features/payBill/components/PaymentConfirmationScreen/usePaymentConfirmationReveal"

export interface PaymentConfirmationScreenProps {
  restaurantName: string
  paidAmount: number
  receiptTotal: number
  tip: number | null
  paymentCode: string
  offer?: ClaimedOffer | null
  /** Post-payment cashback credited to Bolt Balance. */
  cashbackEarnedEur?: number
  onDismiss: () => void
  onDone: () => void
  /** Open on summary sheet (paid offer banner revisit). */
  startRevealed?: boolean
}

const CHECKMARK_IMG_PROPS = {
  src: paySuccessCheckmarkUrl,
  alt: "",
  draggable: false,
  className: "pointer-events-none size-full object-contain",
} as const

/**
 * Figma 15767 → 15823: brand hero + timed GSAP reveal + white summary sheet (payment code, receipt, Done).
 */
export function PaymentConfirmationScreen({
  restaurantName,
  paidAmount,
  receiptTotal,
  tip,
  paymentCode,
  cashbackEarnedEur = 0,
  onDismiss,
  onDone,
  startRevealed = false,
}: PaymentConfirmationScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const heroBandRef = useRef<HTMLDivElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  const { phase } = usePaymentConfirmationReveal({
    rootRef,
    heroBandRef,
    imgWrapRef,
    titleRef,
    sheetRef,
    startRevealed,
  })

  const revealed = phase === "revealed"
  const showCashback = cashbackEarnedEur > 0

  return (
    <div
      ref={rootRef}
      className="relative flex h-[var(--app-h)] max-h-[var(--app-h)] w-full min-h-0 flex-col overflow-hidden bg-special-brand-alt"
    >
      <PaymentConfirmationNavbar
        restaurantName={restaurantName}
        onDismiss={onDismiss}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          ref={heroBandRef}
          className="absolute inset-x-0 z-10 flex flex-col items-center justify-center overflow-hidden px-6"
        >
          <div className="flex flex-col items-center gap-[14px]">
            <div
              ref={imgWrapRef}
              className="relative shrink-0 will-change-transform [backface-visibility:hidden]"
              style={{
                width: PAY_SUCCESS_CHECKMARK_START_PX,
                height: PAY_SUCCESS_CHECKMARK_START_PX,
              }}
            >
              <img
                {...CHECKMARK_IMG_PROPS}
                width={PAY_SUCCESS_CHECKMARK_START_PX}
                height={PAY_SUCCESS_CHECKMARK_START_PX}
              />
            </div>

            <div ref={titleRef} className="w-full max-w-md shrink-0 text-center">
              <PaymentSuccessTitle variant="large" />
            </div>

            {revealed ?
              <p className="sr-only" aria-live="polite">
                Payment successful
              </p>
            : null}
          </div>
        </div>

        <div
          ref={sheetRef}
          data-snackbar-anchor=""
          className="absolute inset-x-0 bottom-0 z-20 flex max-h-[min(72vh,calc(var(--app-h)*0.72))] min-h-0 flex-col overflow-hidden rounded-t-[var(--sheet-radius)] bg-layer-floor-1 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        >
          <PaymentConfirmationSummarySheet
            paymentCode={paymentCode}
            receiptTotal={receiptTotal}
            tip={tip}
            paidAmount={paidAmount}
            showCashback={showCashback}
            cashbackEur={cashbackEarnedEur}
            onDone={onDone}
          />
        </div>
      </div>
    </div>
  )
}
