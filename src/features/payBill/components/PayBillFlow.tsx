import { createPortal } from "react-dom"
import { useCallback, useEffect } from "react"
import { BillAmountScreen } from "@/features/payBill/components/BillAmountScreen/BillAmountScreen"
import { PayScreen } from "@/features/payBill/components/PayScreen/PayScreen"
import { PaySuccessScreen } from "@/features/payBill/components/PaySuccessScreen/PaySuccessScreen"
import { PaymentConfirmationScreen } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationScreen"
import { RatingScreen } from "@/features/payBill/components/RatingScreen/RatingScreen"
import { TipScreen } from "@/features/payBill/components/TipScreen/TipScreen"
import {
  payBillSyntheticOfferId,
  type PayBillFlowEntry,
} from "@/features/payBill/payBill.types"
import { DEFAULT_TIP_PERCENT_PRESETS } from "@/features/payBill/utils/tipPresets"
import { usePayBillStore } from "@/features/payBill/store/payBillStore"

export interface PayBillFlowProps {
  entry: PayBillFlowEntry
  portalContainer?: HTMLElement | null
  onClose: () => void
  onRated?: () => void
  /** Rating “X”: after closing pay flow, e.g. return to map + thank-you snackbar. */
  onRatingDismiss?: () => void
}

/**
 * Full-screen pay stack over restaurant detail.
 */
export function PayBillFlow({
  entry,
  portalContainer,
  onClose,
  onRated,
  onRatingDismiss,
}: PayBillFlowProps) {
  const step = usePayBillStore((s) => s.step)
  const open = usePayBillStore((s) => s.open)
  const reset = usePayBillStore((s) => s.reset)
  const setStep = usePayBillStore((s) => s.setStep)
  const setBillAmount = usePayBillStore((s) => s.setBillAmount)
  const setTip = usePayBillStore((s) => s.setTip)
  const setIntent = usePayBillStore((s) => s.setIntentSnackbar)
  const billAmount = usePayBillStore((s) => s.billAmount)
  const tip = usePayBillStore((s) => s.tip)
  const txn = usePayBillStore((s) => s.transactionId)
  const paidAt = usePayBillStore((s) => s.paidAt)
  const paidAmount = usePayBillStore((s) => s.paidAmount)
  const discountAmount = usePayBillStore((s) => s.discountAmount)
  const paymentMethodUi = usePayBillStore((s) => s.paymentMethodUi)

  useEffect(() => {
    open(entry)
  }, [entry, open])

  const dismissAll = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  const dismissFromRating = useCallback(() => {
    reset()
    onClose()
    onRatingDismiss?.()
  }, [onClose, onRatingDismiss, reset])

  const afterRating = useCallback(() => {
    reset()
    onClose()
    onRated?.()
  }, [onClose, onRated, reset])

  const node = (
    <div className="fixed inset-0 z-[120] flex w-full justify-center bg-layer-floor-1">
      <div
        className="relative h-[var(--app-h)] w-full max-w-[var(--shell-width)] overflow-hidden bg-layer-floor-1 shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.2)]"
        style={{
          minHeight: "var(--app-h)",
          height: "var(--app-h)",
        }}
      >
        {step === "billAmount" ?
          <BillAmountScreen
            restaurantName={entry.restaurantName}
            claimedOffer={entry.offer}
            billAmountBadges={entry.billAmountBadges}
            onDismiss={dismissAll}
            onContinue={(amt) => {
              setBillAmount(amt)
              setStep("tip")
            }}
          />
        : step === "tip" ?
          <TipScreen
            restaurantName={entry.restaurantName}
            receiptTotalEur={billAmount ?? 0}
            tipPercentPresets={
              entry.offer?.tipPresetAmounts ?? [...DEFAULT_TIP_PERCENT_PRESETS]
            }
            portalContainer={portalContainer}
            onBack={() => setStep("billAmount")}
            onContinue={({ tip: t, snackbarIntent }) => {
              setTip(t)
              setIntent(snackbarIntent)
              setStep("pay")
            }}
          />
        : step === "pay" && billAmount != null ?
          <PayScreen
            restaurantName={entry.restaurantName}
            restaurantSlug={entry.restaurantSlug}
            receiptTotal={billAmount}
            tip={tip}
            offer={entry.offer}
            portalContainer={portalContainer}
            onBack={() => setStep("tip")}
          />
        : step === "success" ?
          <PaySuccessScreen onAdvance={() => setStep("confirmation")} />
        : step === "confirmation" &&
          billAmount != null &&
          txn &&
          paidAt &&
          paidAmount != null &&
          discountAmount != null &&
          paymentMethodUi ?
          <PaymentConfirmationScreen
            restaurantName={entry.restaurantName}
            paidAmount={paidAmount}
            receiptTotal={billAmount}
            tip={tip}
            discountAmount={discountAmount}
            cashbackAmount={entry.offer?.cashbackAmount ?? 2.5}
            paymentMethod={paymentMethodUi}
            cardLast4="1692"
            transactionId={txn}
            paidAt={paidAt}
            offer={entry.offer}
            portalContainer={portalContainer}
            onDismiss={dismissAll}
            onDone={() => setStep("rating")}
          />
        : step === "rating" ?
          <RatingScreen
            restaurantName={entry.restaurantName}
            offerId={
              entry.offer?.offerId ?? payBillSyntheticOfferId(entry.restaurantSlug)
            }
            onClose={dismissFromRating}
            onSubmitDone={afterRating}
          />
        : null}
      </div>
    </div>
  )

  if (portalContainer) {
    return createPortal(node, portalContainer)
  }
  return node
}
