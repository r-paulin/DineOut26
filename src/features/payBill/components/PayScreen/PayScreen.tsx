import { Button, Typography } from "@bolteu/kalep-react"
import { useSnackbar } from "@/shared/snackbar"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import InfoCircleOutlined from "@bolteu/kalep-react-icons/dist/InfoCircleOutlined"
import PaymentCash from "@bolteu/kalep-react-icons/dist/PaymentCash"
import PaymentGooglePay from "@bolteu/kalep-react-icons/dist/PaymentGooglePay"
import PaymentMasterCard from "@bolteu/kalep-react-icons/dist/PaymentMasterCard"
import PaymentWallet from "@bolteu/kalep-react-icons/dist/PaymentWallet"
import { CustomEase } from "gsap/CustomEase"
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
import { PayBillSavedBadge } from "@/features/payBill/components/PayScreen/PayBillSavedBadge"
import { SlidingButton } from "@/features/payBill/components/PayScreen/SlidingButton"
import { ClaimedOfferBillInlineNotice } from "@/features/payBill/components/shared/ClaimedOfferBillInlineNotice"
import { DiscountReceiptRow } from "@/features/payBill/components/shared/DiscountReceiptRow"
import { ReceiptItem } from "@/features/payBill/components/shared/ReceiptItem"
import { usePayBillStore } from "@/features/payBill/store/payBillStore"
import {
  discountSecondEur,
  finalAmountCompound,
  round2,
  subtotalWithTip,
} from "@/features/payBill/utils/discountCalc"
import { effectivePayDiscountPercents } from "@/features/payBill/utils/payBillDiscounts"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import {
  payBillHeroMainPriceStyle,
  payBillNumericOpentype,
} from "@/features/payBill/utils/payBillNumericDisplay"
import { AppInfoBottomSheet } from "@/shared/components/AppInfoBottomSheet"
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

/** Match {@link RestaurantDetailScreen} push + scrim timing. */
const EASE_DETAIL_ENTER = CustomEase.create(
  "payPickerPushEnter",
  "M0,0,C0.32,0.72,0,1,1,1",
)
const EASE_DETAIL_EXIT = CustomEase.create(
  "payPickerPushExit",
  "M0,0,C0.58,0,0.92,0.36,1,1",
)
const DETAIL_MOTION_S = 0.6
const STAGGER_PANEL_AFTER_SCRIM_S = 0
const STAGGER_SCRIM_AFTER_PANEL_EXIT_S = 0

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
    {
      motionDurationS: DETAIL_MOTION_S,
      easeEnter: EASE_DETAIL_ENTER,
      easeExit: EASE_DETAIL_EXIT,
      staggerPanelAfterScrimS: STAGGER_PANEL_AFTER_SCRIM_S,
      staggerScrimAfterPanelExitS: STAGGER_SCRIM_AFTER_PANEL_EXIT_S,
    },
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
  const setPost = usePayBillStore((s) => s.setPostPayment)
  const setStep = usePayBillStore((s) => s.setStep)
  const checkoutPaymentOptionId = usePayBillStore((s) => s.checkoutPaymentOptionId)
  const setCheckoutPaymentOptionId = usePayBillStore((s) => s.setCheckoutPaymentOptionId)

  const [dineOutBenefitSheet, setDineOutBenefitSheet] = useState(false)
  const [boltInfoSheet, setBoltInfoSheet] = useState(false)
  const [cardSheet, setCardSheet] = useState(false)
  const [paymentPickerOpen, setPaymentPickerOpen] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  /** Strict Mode runs effects twice with the same `intent` snapshot; only show once. */
  const intentConsumedRef = useRef(false)
  useEffect(() => {
    if (intent == null) {
      intentConsumedRef.current = false
      return
    }
    if (intentConsumedRef.current) return
    intentConsumedRef.current = true
    const kind = intent
    setIntent(null)
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
  const subtotal = subtotalWithTip(receiptTotal, tip)
  const finalAmt = finalAmountCompound(receiptTotal, tip, d1, d2)
  const secondDiscEur = discountSecondEur(receiptTotal, tip, d1, d2)

  const fromBalance = Math.min(DEMO_BOLT_BALANCE, finalAmt)
  const fromCard = Math.max(0, round2(finalAmt - fromBalance))
  const hideCardRow = fromCard <= 0

  const showStrikeSubtotal = subtotal > finalAmt
  const savedEur = round2(subtotal - finalAmt)

  const onSlideComplete = useCallback(async () => {
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
      setPost({
        transactionId: res.transactionId,
        paymentCode: res.paymentCode,
        paidAt: res.paidAt,
        paidAmount: res.paidAmount,
        discountAmount: res.discountAmount,
        paymentMethodUi: methodUi,
      })
      setStep("confirmation")
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
    setPost,
    setStep,
    snackbar,
    tip,
  ])

  const checkoutOptionNarrow = narrowCheckoutPaymentOptionId(checkoutPaymentOptionId)

  return (
    <div className="relative flex h-[var(--app-h)] max-h-[var(--app-h)] w-full min-h-0 flex-col bg-layer-floor-1">
      <header className="flex shrink-0 items-center gap-4 px-6 pt-[max(1rem,var(--safe-area-top))] pb-3">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
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
              fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
            }}
          >
            {restaurantName}
          </Typography>
        </div>
        <span className="size-6 shrink-0" aria-hidden />
      </header>

      {offer ?
        <ClaimedOfferBillInlineNotice discountPercent={offer.discountPercent} />
      : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-layer-floor-1">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex min-h-0 w-full flex-1 shrink-0 flex-col items-center justify-center gap-1 px-6 py-8">
            <p className="m-0 flex w-full max-w-[min(100%,22rem)] flex-col items-center gap-1 text-center">
              <Typography
                variant="body-l-regular"
                color="secondary"
                as="span"
                align="center"
              >
                <span>You&apos;ll pay</span>
                {showStrikeSubtotal ?
                  <>
                    {" "}
                    <span
                      className="[text-decoration-skip-ink:none] line-through tabular-nums"
                      style={payBillNumericOpentype}
                    >
                      {formatEurMajor(subtotal)}
                    </span>
                  </>
                : null}
              </Typography>
              <span
                className="text-primary tabular-nums"
                style={payBillHeroMainPriceStyle}
              >
                {formatEurMajor(finalAmt)}
              </span>
            </p>
            {savedEur > 0 ?
              <PayBillSavedBadge savedAmountEur={savedEur} />
            : null}
          </div>

          <CardDivider />

          <div className="flex shrink-0 flex-col rounded-t-2xl bg-layer-floor-1 px-6 pb-6 pt-6 shadow-[var(--elevation-1)]">
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
              {d2 > 0 ?
                <DiscountReceiptRow
                  percent={d2}
                  discountEur={secondDiscEur}
                  infoAriaLabel="DineOut benefit info"
                  onInfoClick={() => setDineOutBenefitSheet(true)}
                />
              : null}
            </div>
            <div
              className={
                d2 > 0 ?
                  "mt-2 pt-2"
                : "mt-2 border-t border-solid border-separator pt-2"
              }
            >
              <ReceiptItem
                label="Total"
                amount={formatEurMajor(finalAmt)}
                variant="bold"
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
          </div>
        </div>

        <div
          data-snackbar-anchor=""
          className="shrink-0 border-t border-solid border-separator bg-layer-floor-1 px-6 pt-3 pb-[max(1rem,var(--safe-area-bottom))]"
        >
          <SlidingButton
            label="Pay bill"
            sublabel="Slide to confirm"
            isLoading={payLoading}
            disabled={payLoading}
            onComplete={onSlideComplete}
          />
        </div>
      </div>

      <AppInfoBottomSheet
        open={dineOutBenefitSheet}
        onOpenChange={setDineOutBenefitSheet}
        container={portalContainer}
        title="DineOut benefit"
        body="When you pay with DineOut, an extra discount applies to your bill including tips."
        zOverlay={Z_PAY_SHEET_OVERLAY}
        zContent={Z_PAY_SHEET_CONTENT}
      />
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
