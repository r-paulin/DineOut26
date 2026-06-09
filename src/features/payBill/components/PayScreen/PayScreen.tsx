import { Button, Typography } from "@bolteu/kalep-react"
import { useSnackbar } from "@/shared/snackbar"
import InfoCircleOutlined from "@bolteu/kalep-react-icons/dist/InfoCircleOutlined"
import PaymentCash from "@bolteu/kalep-react-icons/dist/PaymentCash"
import PaymentGooglePay from "@bolteu/kalep-react-icons/dist/PaymentGooglePay"
import PaymentMasterCard from "@bolteu/kalep-react-icons/dist/PaymentMasterCard"
import PaymentWallet from "@bolteu/kalep-react-icons/dist/PaymentWallet"
import { useCallback, useEffect, useRef, useState } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { payBillMock } from "@/features/payBill/api/payBill.api"
import { payBillSyntheticOfferId } from "@/features/payBill/payBill.types"
import { ChangePaymentMethodScreen } from "@/features/payBill/components/ChangePaymentMethodScreen"
import {
  checkoutPaymentOptionLabel,
  narrowCheckoutPaymentOptionId,
  type CheckoutPaymentOptionId,
} from "@/features/payBill/constants/checkoutPaymentOptions"
import { PayBillCashbackUpsell } from "@/features/payBill/components/PayScreen/PayBillCashbackUpsell"
import { PayBillPayHero } from "@/features/payBill/components/PayScreen/PayBillPayHero"
import { SlidingButton } from "@/features/payBill/components/PayScreen/SlidingButton"
import { PayBillScreenHeader } from "@/features/payBill/components/shared/PayBillScreenHeader"
import { ReceiptItem } from "@/features/payBill/components/shared/ReceiptItem"
import { usePayBillStore } from "@/features/payBill/store/payBillStore"
import {
  cashbackAmountEur,
  payAmountDue,
  round2,
} from "@/features/payBill/utils/discountCalc"
import { effectivePayDiscountPercents } from "@/features/payBill/utils/payBillDiscounts"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import { AppInfoBottomSheet } from "@/shared/components/AppInfoBottomSheet"
import { MOTION_DETAIL_SCRIM } from "@/shared/motion"
import { useSlideInPanel } from "@/shared/hooks/useSlideInPanel"
import { CardDivider } from "@/shared/components/CardDivider"
import {
  VAUL_SHEET_OVERLAY_CLASS,
  vaulSheetContentClassName,
} from "@/shared/utils/vaulAppSheetShell"
import {
  SHEET_CLOSE_ICON_ON_SURFACE_CLASS,
  SHEET_CLOSE_ON_SURFACE_NESTED_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { Drawer } from "vaul"

const DEMO_BOLT_BALANCE = 2.5
const Z_PAY_SHEET_OVERLAY = 200
const Z_PAY_SHEET_CONTENT = 201
/** Full-screen payment picker above pay sheets. */
const Z_PAYMENT_PICKER = 210

interface PayPaymentMethodPickerShellProps {
  onPickerClosed: () => void
  onAddCardAfterExit: () => void
  boltAmountEur: number
  selectedId: CheckoutPaymentOptionId
  onSelect: (next: CheckoutPaymentOptionId) => void
  onUserChangedSelection: () => void
}

/**
 * Mount only while open so {@link useSlideInPanel} enter runs on mount (refs exist).
 */
function PayPaymentMethodPickerShell({
  onPickerClosed,
  onAddCardAfterExit,
  boltAmountEur,
  selectedId,
  onSelect,
  onUserChangedSelection,
}: PayPaymentMethodPickerShellProps) {
  const onPickerClosedRef = useRef(onPickerClosed)
  onPickerClosedRef.current = onPickerClosed

  const { rootRef, scrimRef, panelRef, runExit } = useSlideInPanel(
    { scrimOpacity: MOTION_DETAIL_SCRIM },
    onPickerClosedRef,
  )

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 flex min-h-0 w-full flex-col box-border"
      style={{ zIndex: Z_PAYMENT_PICKER }}
      role="dialog"
      aria-modal="true"
      aria-label="Payment"
    >
      <div
        ref={scrimRef}
        className="pointer-events-none absolute inset-0 z-0 bg-black/15"
        style={prefersReducedMotion() ? { opacity: 1 } : undefined}
        aria-hidden
      />
      <div
        ref={panelRef}
        className="relative z-[1] flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-layer-floor-1 shadow-[-6px_0_20px_rgba(0,0,0,0.06)]"
      >
        <ChangePaymentMethodScreen
          boltAmountEur={boltAmountEur}
          selectedId={selectedId}
          onSelect={onSelect}
          onUserChangedSelection={onUserChangedSelection}
          onBack={() => {
            runExit()
          }}
          onAddCard={() => {
            runExit(onAddCardAfterExit)
          }}
        />
      </div>
    </div>
  )
}

function checkoutFooterPaymentIcon(optionId: string) {
  const id = narrowCheckoutPaymentOptionId(optionId)
  if (id === "google_pay") {
    return <PaymentGooglePay size="md" className="shrink-0" />
  }
  if (id === "cash") {
    return <PaymentCash size="md" className="shrink-0 text-action-primary" />
  }
  return <PaymentMasterCard size="md" className="shrink-0" />
}

export interface PayScreenProps {
  restaurantName: string
  restaurantSlug: string
  receiptTotal: number
  tip: number | null
  offer: ClaimedOffer | null
  portalContainer?: HTMLElement | null
  onBack: () => void
}

/**
 * PAY BILL / Pay — Figma `15767:51083`: hero + Saved, card divider, receipt + DineOut benefit + Total, payments, slide-to-pay.
 */
export function PayScreen({
  restaurantName,
  restaurantSlug,
  receiptTotal,
  tip,
  offer,
  portalContainer,
  onBack,
}: PayScreenProps) {
  const snackbar = useSnackbar()
  const intent = usePayBillStore((s) => s.intentSnackbar)
  const setIntent = usePayBillStore((s) => s.setIntentSnackbar)
  const completePayment = usePayBillStore((s) => s.completePayment)
  const checkoutPaymentOptionId = usePayBillStore((s) => s.checkoutPaymentOptionId)
  const setCheckoutPaymentOptionId = usePayBillStore((s) => s.setCheckoutPaymentOptionId)

  const [boltInfoSheet, setBoltInfoSheet] = useState(false)
  const [cardSheet, setCardSheet] = useState(false)
  const [paymentPickerOpen, setPaymentPickerOpen] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const paymentAttemptRef = useRef(0)
  /** Strict Mode runs effects twice with the same `intent` snapshot; only show once. */
  const intentConsumedRef = useRef(false)

  useEffect(() => {
    return () => {
      paymentAttemptRef.current += 1
    }
  }, [])

  useEffect(() => {
    if (intent == null) {
      intentConsumedRef.current = false
      return
    }
    if (intentConsumedRef.current) return
    intentConsumedRef.current = true
    const kind = intent
    setIntent(null)
    // Wait for Pay footer anchor + snackbar inset to settle before GSAP entry.
    let cancelled = false
    let raf2 = 0
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        if (cancelled) return
        if (kind === "tip-added") {
          snackbar.add({
            swipeToDismiss: false,
            title: "Tip added",
            description: "Your tip will go to the restaurant staff.",
            timeout: 3500,
          })
        } else if (kind === "no-tip") {
          snackbar.add({
            swipeToDismiss: false,
            description: "No tip was added",
            timeout: 3500,
          })
        }
      })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(raf1)
      if (raf2) window.cancelAnimationFrame(raf2)
    }
  }, [intent, setIntent, snackbar])

  const onUserChangedCheckoutPayment = useCallback(() => {
    snackbar.add({
      dismissible: true,
      title: "Payment method updated",
      description: "You can go back and continue with payment.",
      timeout: 4000,
    })
  }, [snackbar])

  const onSelectCheckoutPaymentOption = useCallback(
    (next: CheckoutPaymentOptionId) => {
      setCheckoutPaymentOptionId(next)
    },
    [setCheckoutPaymentOptionId],
  )

  const { discountPercent: d1, discountAddPercent: d2 } =
    effectivePayDiscountPercents(offer)
  const offerId = offer?.offerId ?? payBillSyntheticOfferId(restaurantSlug)
  const finalAmt = payAmountDue(receiptTotal, tip, d1)
  const cashbackEur = d2 > 0 ? cashbackAmountEur(receiptTotal, tip, d2) : 0

  const fromBalance = Math.min(DEMO_BOLT_BALANCE, finalAmt)
  const fromCard = Math.max(0, round2(finalAmt - fromBalance))
  const hideCardRow = fromCard <= 0

  const onSlideComplete = useCallback(async () => {
    const attemptId = ++paymentAttemptRef.current
    setPayLoading(true)
    const methodUi: "bolt_balance" | "card" =
      fromCard <= 0 ? "bolt_balance" : "card"
    try {
      const res = await payBillMock({
        offerId,
        restaurantSlug,
        receiptTotal,
        tip,
        discountPercent: d1,
        discountAddPercent: d2,
      })
      if (attemptId !== paymentAttemptRef.current) return
      if (usePayBillStore.getState().step !== "pay") return
      completePayment({
        transactionId: res.transactionId,
        paymentCode: res.paymentCode,
        paidAt: res.paidAt,
        paidAmount: res.paidAmount,
        cashbackEarnedEur: res.cashbackEarnedEur,
        paymentMethodUi: methodUi,
      })
    } catch {
      snackbar.add({
        description: "Payment failed. Try again.",
        timeout: 4000,
      })
    } finally {
      setPayLoading(false)
    }
  }, [
    d1,
    d2,
    fromCard,
    offerId,
    restaurantSlug,
    receiptTotal,
    completePayment,
    snackbar,
    tip,
  ])

  const checkoutOptionNarrow = narrowCheckoutPaymentOptionId(checkoutPaymentOptionId)

  return (
    <div className="relative flex h-[var(--app-h)] max-h-[var(--app-h)] w-full min-h-0 flex-col bg-layer-floor-1">
      <PayBillScreenHeader
        title={restaurantName}
        onBack={onBack}
        showDivider={false}
        backDisabled={payLoading}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-layer-floor-1">
          <PayBillPayHero finalAmt={finalAmt} />

          <CardDivider />

          <section className="flex shrink-0 flex-col rounded-t-2xl bg-layer-floor-1 px-6 pt-6 pb-8 shadow-[var(--elevation-1)]">
            <div className="mb-2">
              <Typography variant="heading-s-accent" color="primary" as="h2">
                Summary
              </Typography>
            </div>
            <div className="flex flex-col gap-2">
              <ReceiptItem
                label="Receipt"
                amount={formatEurMajor(receiptTotal)}
                variant="regular"
                labelColor="secondary"
                labelTypographyVariant="body-m-regular"
              />
              {tip != null && tip > 0 ?
                <ReceiptItem
                  label="Tip"
                  amount={formatEurMajor(tip)}
                  variant="regular"
                  labelColor="secondary"
                  labelTypographyVariant="body-m-regular"
                />
              : null}
            </div>
            <div className="mt-2 border-t border-solid border-separator pt-2">
              <ReceiptItem
                label="Total"
                amount={formatEurMajor(finalAmt)}
                variant="total"
              />
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <PaymentWallet size="md" className="shrink-0 text-action-primary" />
                  <div className="flex min-w-0 items-center gap-1">
                    <Typography variant="body-m-regular" color="primary" as="span">
                      Bolt Balance
                    </Typography>
                    <button
                      type="button"
                      className="inline-flex border-none bg-transparent p-0"
                      aria-label="Bolt Balance info"
                      onClick={() => setBoltInfoSheet(true)}
                    >
                      <InfoCircleOutlined size="sm" className="text-secondary" aria-hidden />
                    </button>
                  </div>
                </div>
                <span className="shrink-0">
                  <Typography variant="body-m-regular" color="primary" as="span">
                    {formatEurMajor(fromBalance)}
                  </Typography>
                </span>
              </div>
              {!hideCardRow ?
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex shrink-0">
                      {checkoutFooterPaymentIcon(checkoutPaymentOptionId)}
                    </span>
                    <div className="flex min-w-0 flex-col gap-0 leading-none">
                      <Typography variant="body-m-regular" color="primary" as="span">
                        {checkoutPaymentOptionLabel(checkoutPaymentOptionId)}
                      </Typography>
                      <button
                        type="button"
                        className="mt-0.5 border-none bg-transparent p-0 text-left"
                        aria-label="Change payment method"
                        onClick={() => setPaymentPickerOpen(true)}
                      >
                        <Typography variant="body-s-regular" color="action-primary" as="span">
                          Change
                        </Typography>
                      </button>
                    </div>
                  </div>
                  <span className="shrink-0 self-center">
                    <Typography variant="body-m-regular" color="primary" as="span">
                      {formatEurMajor(fromCard)}
                    </Typography>
                  </span>
                </div>
              : null}
            </div>
          </section>
        </main>

        <div className="flex shrink-0 flex-col bg-layer-floor-1">
          {cashbackEur > 0 ?
            <PayBillCashbackUpsell
              cashbackEur={cashbackEur}
              cashbackPercent={d2}
            />
          : null}
          <footer
            data-snackbar-anchor=""
            className={
              cashbackEur > 0 ?
                "shrink-0 px-6 pt-3 pb-[max(1rem,var(--safe-area-bottom))]"
              : "shrink-0 border-t border-solid border-separator px-6 pt-3 pb-[max(1rem,var(--safe-area-bottom))]"
            }
          >
            <SlidingButton
              label="Pay bill"
              sublabel="Slide to confirm"
              isLoading={payLoading}
              disabled={payLoading}
              onComplete={onSlideComplete}
            />
          </footer>
        </div>
      </div>

      <AppInfoBottomSheet
        open={boltInfoSheet}
        onOpenChange={setBoltInfoSheet}
        container={portalContainer}
        title="Bolt Balance"
        body="Bolt Balance is your in-app wallet. Cashback and refunds are added here."
        zOverlay={Z_PAY_SHEET_OVERLAY}
        zContent={Z_PAY_SHEET_CONTENT}
      />
      <Drawer.Root
        open={cardSheet}
        onOpenChange={setCardSheet}
        dismissible
        repositionInputs={false}
        snapPoints={[]}
        container={portalContainer ?? undefined}
      >
        <Drawer.Portal>
          <Drawer.Overlay
            className={VAUL_SHEET_OVERLAY_CLASS}
            style={{ zIndex: Z_PAY_SHEET_OVERLAY }}
          />
          <Drawer.Content
            className={vaulSheetContentClassName()}
            style={{ zIndex: Z_PAY_SHEET_CONTENT }}
          >
            <Drawer.Title className="sr-only">Cards</Drawer.Title>
            <Drawer.Description className="sr-only">
              Choose a saved card or add a new card for payment.
            </Drawer.Description>
            <Drawer.Close asChild>
              <button
                type="button"
                className={SHEET_CLOSE_ON_SURFACE_NESTED_CLASS}
                aria-label="Close"
              >
                <Cross size="xs" className={SHEET_CLOSE_ICON_ON_SURFACE_CLASS} aria-hidden />
              </button>
            </Drawer.Close>
            <div className="flex flex-col pb-[max(2rem,var(--safe-area-bottom))]">
              <div className="flex w-full flex-col gap-2 px-6 pb-3 pt-6 pe-14">
                <h2 className="m-0 p-0">
                  <Typography variant="heading-m-accent" color="primary" as="span">
                    Saved cards
                  </Typography>
                </h2>
              </div>
              <div className="flex flex-col gap-4 px-6 pb-2">
                <button
                  type="button"
                  className="flex w-full rounded-xl border border-separator p-4 text-left"
                  onClick={() => setCardSheet(false)}
                >
                  <Typography variant="body-m-accent" as="span">
                    •••• 1692
                  </Typography>
                </button>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => setCardSheet(false)}
                >
                  Add new card
                </Button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {paymentPickerOpen ?
        <PayPaymentMethodPickerShell
          onPickerClosed={() => {
            setPaymentPickerOpen(false)
          }}
          onAddCardAfterExit={() => {
            setPaymentPickerOpen(false)
            setCardSheet(true)
          }}
          boltAmountEur={fromBalance}
          selectedId={checkoutOptionNarrow}
          onSelect={onSelectCheckoutPaymentOption}
          onUserChangedSelection={onUserChangedCheckoutPayment}
        />
      : null}
    </div>
  )
}
