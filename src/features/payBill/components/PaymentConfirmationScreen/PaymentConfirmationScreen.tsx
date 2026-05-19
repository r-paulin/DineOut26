import { useRef, useState } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import paySuccessCheckmarkUrl from "@/features/payBill/assets/pay-success-checkmark-180.png"
import { PaymentConfirmationNavbar } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationNavbar"
import { PaymentConfirmationSummarySheet } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationSummarySheet"
import { PaymentSuccessTitle } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentSuccessTitle"
import { usePaymentConfirmationReveal } from "@/features/payBill/components/PaymentConfirmationScreen/usePaymentConfirmationReveal"
import { discountSecondEur } from "@/features/payBill/utils/discountCalc"
import { effectivePayDiscountPercents } from "@/features/payBill/utils/payBillDiscounts"
import { AppInfoBottomSheet } from "@/shared/components/AppInfoBottomSheet"

export interface PaymentConfirmationScreenProps {
  restaurantName: string
  paidAmount: number
  receiptTotal: number
  tip: number | null
  paymentCode: string
  offer: ClaimedOffer | null
  portalContainer?: HTMLElement | null
  onDismiss: () => void
  onDone: () => void
}

const Z_CONFIRM_SHEET_OVERLAY = 200
const Z_CONFIRM_SHEET_CONTENT = 201

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
  offer,
  portalContainer,
  onDismiss,
  onDone,
}: PaymentConfirmationScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const heroBandRef = useRef<HTMLDivElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const titleCelebrationRef = useRef<HTMLDivElement>(null)
  const titleSlotRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  const [dineOutBenefitSheet, setDineOutBenefitSheet] = useState(false)

  const { phase } = usePaymentConfirmationReveal({
    rootRef,
    heroBandRef,
    imgWrapRef,
    titleCelebrationRef,
    titleSlotRef,
    sheetRef,
  })

  const { discountPercent: d1, discountAddPercent: d2 } =
    effectivePayDiscountPercents(offer)
  const secondDiscEur = discountSecondEur(receiptTotal, tip, d1, d2)
  const revealed = phase === "revealed"

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
          className="absolute inset-x-0 top-0 z-10 flex items-center justify-center overflow-hidden px-6"
        >
          <div className="flex flex-col items-center gap-4">
            <div
              ref={imgWrapRef}
              className="relative size-[180px] shrink-0 will-change-transform [backface-visibility:hidden]"
            >
              <img {...CHECKMARK_IMG_PROPS} width={180} height={180} />
            </div>

            <div
              ref={titleSlotRef}
              className="relative w-full max-w-md shrink-0 overflow-hidden"
            >
              <div
                ref={titleCelebrationRef}
                className="w-full text-center"
                aria-hidden={revealed}
              >
                <PaymentSuccessTitle variant="large" />
              </div>
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
          className="absolute inset-x-0 bottom-0 z-20 max-h-[min(72vh,calc(var(--app-h)*0.72))] overflow-hidden rounded-t-[var(--sheet-radius)] bg-layer-floor-1 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        >
          <PaymentConfirmationSummarySheet
            paymentCode={paymentCode}
            receiptTotal={receiptTotal}
            tip={tip}
            paidAmount={paidAmount}
            discountPercentSecond={d2}
            secondDiscEur={secondDiscEur}
            onDone={onDone}
            onDineOutBenefitInfo={() => setDineOutBenefitSheet(true)}
          />
        </div>
      </div>

      <AppInfoBottomSheet
        open={dineOutBenefitSheet}
        onOpenChange={setDineOutBenefitSheet}
        container={portalContainer}
        title="DineOut benefit"
        body="When you pay with DineOut, an extra discount applies to your bill including tips."
        zOverlay={Z_CONFIRM_SHEET_OVERLAY}
        zContent={Z_CONFIRM_SHEET_CONTENT}
      />
    </div>
  )
}
