import { createPortal } from "react-dom"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BillAmountScreen } from "@/features/payBill/components/BillAmountScreen/BillAmountScreen"
import { PayBillFlowErrorFallback } from "@/features/payBill/components/PayBillFlow/PayBillFlowErrorFallback"
import { PayScreen } from "@/features/payBill/components/PayScreen/PayScreen"
import { PaySuccessScreen } from "@/features/payBill/components/PaySuccessScreen/PaySuccessScreen"
import { PaymentConfirmationScreen } from "@/features/payBill/components/PaymentConfirmationScreen/PaymentConfirmationScreen"
import { TipScreen } from "@/features/payBill/components/TipScreen/TipScreen"
import {
  type PayBillCompletionSnapshot,
  type PayBillFlowEntry,
} from "@/features/payBill/payBill.types"
import { DEFAULT_TIP_PERCENT_PRESETS } from "@/features/payBill/utils/tipPresets"
import { capturePayBillCompletionSnapshot } from "@/features/payBill/utils/capturePayBillCompletionSnapshot"
import { usePayBillStore } from "@/features/payBill/store/payBillStore"

export interface PayBillFlowProps {
  entry: PayBillFlowEntry
  portalContainer?: HTMLElement | null
  onClose: () => void
  /** User left payment confirmation after a successful pay (Close or Done). */
  onExitAfterPayment?: (snapshot: PayBillCompletionSnapshot | null) => void
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
  onExitAfterPayment,
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
  const paymentCode = usePayBillStore((s) => s.paymentCode)
  const paidAt = usePayBillStore((s) => s.paidAt)
  const paidAmount = usePayBillStore((s) => s.paidAmount)
  const discountAmount = usePayBillStore((s) => s.discountAmount)
  const paymentMethodUi = usePayBillStore((s) => s.paymentMethodUi)

  const entryIdentity = `${entry.restaurantSlug}|${entry.offer?.offerId ?? ""}`
  const openedEntryRef = useRef<string | null>(null)
  const [shellEl, setShellEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const state = usePayBillStore.getState()
    const storeEntryId = state.entry
      ? `${state.entry.restaurantSlug}|${state.entry.offer?.offerId ?? ""}`
      : null

    // Remount mid-flow (e.g. Strict Mode) — keep bill/tip/pay/confirmation state.
    if (storeEntryId === entryIdentity) {
      openedEntryRef.current = entryIdentity
      return
    }

    if (openedEntryRef.current === entryIdentity) return
    openedEntryRef.current = entryIdentity
    open(entry)
  }, [entry, entryIdentity, open])

  const dismissAll = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  const exitAfterPayment = useCallback(() => {
    const snapshot = capturePayBillCompletionSnapshot(entry)
    reset()
    onExitAfterPayment?.(snapshot)
  }, [entry, onExitAfterPayment, reset])

  const completeAfterConfirmation = useCallback(() => {
    const snapshot = capturePayBillCompletionSnapshot(entry)
    reset()
    onExitAfterPayment?.(snapshot)
    onPaidDone?.()
  }, [entry, onExitAfterPayment, onPaidDone, reset])

  const retryBillAmount = useCallback(() => {
    setStep("billAmount")
    setTip(null)
  }, [setStep, setTip])

  const stepContent = useMemo(() => {
    if (step === "billAmount") {
      return (
        <BillAmountScreen
          restaurantName={entry.restaurantName}
          claimedOffer={entry.offer}
          onDismiss={dismissAll}
          onContinue={(amt) => {
            setBillAmount(amt)
            setStep("tip")
          }}
        />
      )
    }
    if (step === "tip") {
      return (
        <TipScreen
          restaurantName={entry.restaurantName}
          receiptTotalEur={billAmount ?? 0}
          tipPercentPresets={
            entry.offer?.tipPresetAmounts ?? [...DEFAULT_TIP_PERCENT_PRESETS]
          }
          sheetContainer={shellEl}
          onBack={() => setStep("billAmount")}
          onContinue={({ tip: t, snackbarIntent }) => {
            setTip(t)
            setIntent(snackbarIntent)
            setStep("pay")
          }}
        />
      )
    }
    if (step === "pay" && billAmount != null) {
      return (
        <PayScreen
          restaurantName={entry.restaurantName}
          restaurantSlug={entry.restaurantSlug}
          receiptTotal={billAmount}
          tip={tip}
          offer={entry.offer}
          portalContainer={portalContainer}
          onBack={() => setStep("tip")}
        />
      )
    }
    if (step === "success") {
      return <PaySuccessScreen onAdvance={() => setStep("confirmation")} />
    }
    if (
      step === "confirmation" &&
      billAmount != null &&
      txn &&
      paymentCode &&
      paidAt &&
      paidAmount != null &&
      discountAmount != null &&
      paymentMethodUi
    ) {
      return (
        <PaymentConfirmationScreen
          restaurantName={entry.restaurantName}
          paidAmount={paidAmount}
          receiptTotal={billAmount}
          tip={tip}
          paymentCode={paymentCode}
          offer={entry.offer}
          onDismiss={exitAfterPayment}
          onDone={completeAfterConfirmation}
        />
      )
    }
    return (
      <PayBillFlowErrorFallback
        onDismiss={dismissAll}
        onRetryBillAmount={retryBillAmount}
      />
    )
  }, [
    billAmount,
    completeAfterConfirmation,
    discountAmount,
    dismissAll,
    entry,
    exitAfterPayment,
    paidAmount,
    paidAt,
    paymentCode,
    paymentMethodUi,
    portalContainer,
    retryBillAmount,
    setBillAmount,
    setIntent,
    setStep,
    setTip,
    shellEl,
    step,
    tip,
    txn,
  ])

  const node = (
    <div className="fixed inset-0 z-[120] flex w-full justify-center bg-layer-floor-1">
      <div
        ref={setShellEl}
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
        {stepContent}
      </div>
    </div>
  )

  if (portalContainer) {
    return createPortal(node, portalContainer)
  }
  return node
}
