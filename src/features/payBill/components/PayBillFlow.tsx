import { createPortal } from "react-dom"
import { useCallback, useEffect, useRef } from "react"
import { BillAmountScreen } from "@/features/payBill/components/BillAmountScreen/BillAmountScreen"
import { PayScreen } from "@/features/payBill/components/PayScreen/PayScreen"
import { PaySuccessScreen } from "@/features/payBill/components/PaySuccessScreen/PaySuccessScreen"
import { PaymentConfirmationScreen } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationScreen"
import { TipScreen } from "@/features/payBill/components/TipScreen/TipScreen"
import { type PayBillFlowEntry } from "@/features/payBill/payBill.types"
import { DEFAULT_TIP_PERCENT_PRESETS } from "@/features/payBill/utils/tipPresets"
import { usePayBillStore } from "@/features/payBill/store/payBillStore"

export interface PayBillFlowProps {
  entry: PayBillFlowEntry
  portalContainer?: HTMLElement | null
  onClose: () => void
  /** After the user taps Done on the payment confirmation screen. */
  onPaidDone?: () => void
}

/**
 * Full-screen pay stack over restaurant detail.
 */
export function PayBillFlow({
  entry,
  portalContainer,
  onClose,
  onPaidDone,
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

  const entryIdentity = `${entry.restaurantSlug}|${entry.offer?.offerId ?? ""}`
  const openedEntryRef = useRef<string | null>(null)

  useEffect(() => {
    if (openedEntryRef.current === entryIdentity) return
    openedEntryRef.current = entryIdentity
    open(entry)
  }, [entry, entryIdentity, open])

  const dismissAll = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  const completeAfterConfirmation = useCallback(() => {
    reset()
    onClose()
    onPaidDone?.()
  }, [onClose, onPaidDone, reset])

  const node = (
    <div className="fixed inset-0 z-[120] flex w-full justify-center bg-layer-floor-1">
      <div
        className="relative h-[var(--app-h)] w-full max-w-[var(--shell-width)] overflow-hidden bg-layer-floor-1 shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.2)]"
        style={{
          minHeight: "var(--app-h)",
          height: "var(--app-h)",
        }}
      >
        {/*
          `success` (PaySuccessScreen) is unused: PayScreen jumps straight to `confirmation`
          so PaymentConfirmationScreen can run the 15767→15823 GSAP sequence in one surface.
        */}
        {step === "billAmount" ?
          <BillAmountScreen
            restaurantName={entry.restaurantName}
            claimedOffer={entry.offer}
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
            onDone={completeAfterConfirmation}
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
