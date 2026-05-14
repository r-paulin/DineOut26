import { useRef, useState } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import paySuccessCheckmarkUrl from "@/features/payBill/assets/pay-success-checkmark-180.png"
import { PaymentConfirmationNavbar } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationNavbar"
import { PaymentConfirmationSummarySheet } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationSummarySheet"
import { PaymentSuccessTitle } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentSuccessTitle"
import { usePaymentConfirmationReveal } from "@/features/payBill/components/PaymentConfirmationScreen/usePaymentConfirmationReveal"
import {
  discountFirstEur,
  discountSecondEur,
} from "@/features/payBill/utils/discountCalc"
import { formatPaymentCodeDisplay } from "@/features/payBill/utils/paymentCodeDisplay"
import { effectivePayDiscountPercents } from "@/features/payBill/utils/payBillDiscounts"
import { AppInfoBottomSheet } from "@/shared/components/AppInfoBottomSheet"

export interface PaymentConfirmationScreenProps {
  restaurantName: string
  paidAmount: number
  receiptTotal: number
  tip: number | null
  discountAmount: number
  cashbackAmount: number
  paymentMethod: "bolt_balance" | "card"
  cardLast4?: string
  transactionId: string
  paidAt: string
  offer: ClaimedOffer | null
  portalContainer?: HTMLElement | null
  onDismiss: () => void
  onDone: () => void
}

const Z_CONFIRM_SHEET_OVERLAY = 200
const Z_CONFIRM_SHEET_CONTENT = 201

/**
 * Figma 15767 → 15823: brand hero + timed GSAP reveal + white summary sheet (payment code, receipt, Done).
 */
export function PaymentConfirmationScreen({
  restaurantName,
  paidAmount,
  receiptTotal,
  tip,
  transactionId,
  offer,
  portalContainer,
  onDismiss,
  onDone,
}: PaymentConfirmationScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const clusterRef = useRef<HTMLDivElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const titleLargeWrapRef = useRef<HTMLDivElement>(null)
  const titleSmallWrapRef = useRef<HTMLDivElement>(null)

  const [dineOutBenefitSheet, setDineOutBenefitSheet] = useState(false)
  const [claimedDiscountInfoSheet, setClaimedDiscountInfoSheet] = useState(false)

  const { phase } = usePaymentConfirmationReveal({
    rootRef,
    sheetRef,
    clusterRef,
    imgWrapRef,
    titleLargeWrapRef,
    titleSmallWrapRef,
  })

  const { discountPercent: d1, discountAddPercent: d2 } =
    effectivePayDiscountPercents(offer)
  const firstDiscEur = discountFirstEur(receiptTotal, tip, d1)
  const secondDiscEur = discountSecondEur(receiptTotal, tip, d1, d2)
  const paymentCode = formatPaymentCodeDisplay(offer, transactionId)

  const heroLayout =
    phase === "celebration" ?
      "flex flex-1 flex-col items-center justify-center px-6"
    : "flex shrink-0 flex-col items-center px-6 pb-3 pt-10"

  const imgBoxClass =
    phase === "revealed" ? "relative size-[72px] shrink-0" : "relative size-[180px] shrink-0"

  return (
    <div
      ref={rootRef}
      className="relative flex h-[var(--app-h)] max-h-[var(--app-h)] w-full min-h-0 flex-col overflow-hidden bg-special-brand-alt"
    >
      <PaymentConfirmationNavbar
        restaurantName={restaurantName}
        onDismiss={onDismiss}
      />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className={`${heroLayout} min-h-0`}>
          <div
            ref={clusterRef}
            className={
              phase === "celebration" ?
                "flex flex-col items-center gap-6"
              : "flex flex-col items-center gap-3"
            }
          >
            <div ref={imgWrapRef} className={imgBoxClass}>
              <img
                src={paySuccessCheckmarkUrl}
                alt=""
                width={180}
                height={180}
                draggable={false}
                className="pointer-events-none size-full object-contain"
              />
            </div>

            {phase === "celebration" ?
              <div className="relative w-full max-w-md text-center">
                <div ref={titleLargeWrapRef}>
                  <PaymentSuccessTitle variant="large" />
                </div>
                <div
                  ref={titleSmallWrapRef}
                  className="pointer-events-none absolute inset-x-0 top-0"
                >
                  <PaymentSuccessTitle variant="small" />
                </div>
              </div>
            : <div className="w-full max-w-md text-center">
                <PaymentSuccessTitle variant="small" />
              </div>
            }
          </div>
        </div>

        <div
          ref={sheetRef}
          className="absolute inset-x-0 bottom-0 z-10 max-h-[85%] min-h-0 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        >
          <PaymentConfirmationSummarySheet
            offer={offer}
            paymentCode={paymentCode}
            receiptTotal={receiptTotal}
            tip={tip}
            paidAmount={paidAmount}
            discountPercentFirst={d1}
            discountPercentSecond={d2}
            firstDiscEur={firstDiscEur}
            secondDiscEur={secondDiscEur}
            onDone={onDone}
            onClaimedDiscountInfo={() => setClaimedDiscountInfoSheet(true)}
            onDineOutBenefitInfo={() => setDineOutBenefitSheet(true)}
          />
        </div>
      </div>

      <AppInfoBottomSheet
        open={claimedDiscountInfoSheet}
        onOpenChange={setClaimedDiscountInfoSheet}
        container={portalContainer}
        title="Claimed offer discount"
        body="This discount comes from the offer you claimed. It applies to your bill subtotal including tip, before any DineOut payment benefit."
        zOverlay={Z_CONFIRM_SHEET_OVERLAY}
        zContent={Z_CONFIRM_SHEET_CONTENT}
      />
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
