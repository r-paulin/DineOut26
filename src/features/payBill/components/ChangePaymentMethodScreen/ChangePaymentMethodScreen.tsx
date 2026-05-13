import { Radio, RadioGroup, Typography } from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import ChevronRight from "@bolteu/kalep-react-icons/dist/ChevronRight"
import PaymentCash from "@bolteu/kalep-react-icons/dist/PaymentCash"
import PaymentGooglePay from "@bolteu/kalep-react-icons/dist/PaymentGooglePay"
import PaymentMasterCard from "@bolteu/kalep-react-icons/dist/PaymentMasterCard"
import { useCallback, useEffect, useRef } from "react"
import {
  CHECKOUT_PAYMENT_RADIO_OPTIONS,
  type CheckoutPaymentOptionId,
} from "@/features/payBill/constants/checkoutPaymentOptions"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import { payBillNumericOpentype } from "@/features/payBill/utils/payBillNumericDisplay"

const RADIO_GROUP_NAME = "checkout-payment-method"

export interface ChangePaymentMethodScreenProps {
  boltAmountEur: number
  selectedId: CheckoutPaymentOptionId
  onSelect: (next: CheckoutPaymentOptionId) => void
  /** Fires only when the user picks a different option (not on mount). */
  onUserChangedSelection: () => void
  onBack: () => void
  onAddCard: () => void
}

function paymentRowIcon(id: CheckoutPaymentOptionId) {
  if (id === "google_pay") return <PaymentGooglePay size="md" className="shrink-0" />
  if (id === "cash") return <PaymentCash size="md" className="shrink-0 text-action-primary" />
  return <PaymentMasterCard size="md" className="shrink-0" />
}

/**
 * Figma Payment — full-screen picker: nav, Bolt Balance card, radio list, add card row.
 */
export function ChangePaymentMethodScreen({
  boltAmountEur,
  selectedId,
  onSelect,
  onUserChangedSelection,
  onBack,
  onAddCard,
}: ChangePaymentMethodScreenProps) {
  const lastEmittedRef = useRef(selectedId)

  useEffect(() => {
    lastEmittedRef.current = selectedId
  }, [selectedId])

  const onRadioChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value as CheckoutPaymentOptionId
      if (next === lastEmittedRef.current) return
      lastEmittedRef.current = next
      onSelect(next)
      onUserChangedSelection()
    },
    [onSelect, onUserChangedSelection],
  )

  return (
    <div className="flex h-[var(--app-h)] max-h-[var(--app-h)] w-full min-h-0 flex-col overflow-hidden bg-layer-floor-1">
      <div className="flex shrink-0 flex-col px-6 pb-2 pt-[max(1rem,var(--safe-area-top))]">
        <div className="flex w-full items-start justify-between gap-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={onBack}
            className="flex min-h-[24px] min-w-[64px] shrink-0 items-center justify-start rounded-full border-none bg-transparent p-0 text-primary outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
          >
            <ArrowLeft size="md" className="text-primary" aria-hidden />
          </button>
          <button
            type="button"
            className="min-h-[24px] min-w-[64px] shrink-0 border-none bg-transparent p-0 text-end outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
            aria-label="Edit payment methods"
          >
            <Typography variant="body-m-accent" color="action-primary" as="span">
              Edit
            </Typography>
          </button>
        </div>
        <div className="mt-1 w-full">
          <Typography variant="heading-m-accent" color="primary" as="h1">
            Payment
          </Typography>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-[max(1rem,var(--safe-area-bottom))]">
        <div className="relative w-full overflow-hidden rounded-xl bg-layer-floor-1">
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-neutral-secondary"
            aria-hidden
          />
          <div className="relative z-[1] flex flex-col px-4 pt-3">
            <div className="flex w-full flex-col gap-[11px]">
              <Typography variant="body-s-regular" color="secondary" as="p">
                Bolt Balance
              </Typography>
              <p
                className="m-0 text-primary"
                style={{
                  ...payBillNumericOpentype,
                  fontSize: "var(--Heading-S-font-size, 24px)",
                  fontStyle: "normal",
                  fontWeight: "var(--font-weight-semibold, 650)",
                  lineHeight: "var(--Heading-S-line-height, 30px)",
                  letterSpacing: "-0.48px",
                  fontVariationSettings: "'wght' var(--font-weight-semibold, 650)",
                }}
              >
                {formatEurMajor(boltAmountEur)}
              </p>
              <div className="h-px w-full shrink-0 bg-separator" aria-hidden />
            </div>
            <div className="flex flex-col">
              <button
                type="button"
                className="w-full border-none bg-transparent py-[11px] text-start outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
              >
                <Typography variant="body-s-regular" color="action-primary" as="span">
                  View activity
                </Typography>
              </button>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col overflow-hidden rounded-t-2xl bg-layer-floor-1">
          <RadioGroup
            name={RADIO_GROUP_NAME}
            value={selectedId}
            onChange={onRadioChange}
            aria-labelledby="checkout-payment-heading"
          >
            <div className="flex w-full flex-col">
              <span id="checkout-payment-heading" className="sr-only">
                Payment method
              </span>
              {CHECKOUT_PAYMENT_RADIO_OPTIONS.map((opt) => (
                <div key={opt.id} className="w-full border-b border-separator">
                  <label
                    htmlFor={`${RADIO_GROUP_NAME}-${opt.id}`}
                    className="flex w-full cursor-pointer items-start gap-3 pb-[15px] pt-4"
                  >
                    {paymentRowIcon(opt.id)}
                    <span className="min-w-0 flex-1 text-start">
                      <Typography variant="body-m-regular" color="primary" as="span">
                        {opt.label}
                      </Typography>
                    </span>
                    <Radio
                      id={`${RADIO_GROUP_NAME}-${opt.id}`}
                      value={opt.id}
                      aria-label={opt.label}
                    />
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="w-full border-b border-separator">
            <button
              type="button"
              data-no-press
              onClick={onAddCard}
              className="flex w-full cursor-pointer items-start gap-3 border-none bg-transparent pb-[15px] pt-4 text-start outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
            >
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full border border-separator text-primary"
                aria-hidden
              >
                <span className="text-lg leading-none">+</span>
              </span>
              <span className="min-w-0 flex-1">
                <Typography variant="body-m-regular" color="primary" as="span">
                  Add debit/credit card
                </Typography>
              </span>
              <ChevronRight size="md" className="shrink-0 text-secondary" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
