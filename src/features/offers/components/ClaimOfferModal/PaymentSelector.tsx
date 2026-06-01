import { Radio, RadioGroup, Typography } from "@bolteu/kalep-react"
import {
  CLAIM_FLOW_PAYMENT_LABELS,
  DineOutCashbackBannerSlot,
  paymentMethodOptionClass,
  PaymentMethodSheetHeader,
  type PaymentMethodOptionLabels,
} from "@/features/offers/components/paymentMethod/DineOutCashbackBannerSlot"
import type { PaymentMethod } from "@/features/offers/offers.types"

export interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (next: PaymentMethod) => void
  /** Figma claim modal uses Body M accent; claimed-offer sheet uses Heading XS accent. */
  titleVariant?: "heading-xs-accent" | "body-m-accent"
  optionLabels?: PaymentMethodOptionLabels
  /** Dividers between options (claimed-offer modal). */
  showOptionDividers?: boolean
  showHeader?: boolean
  showSectionSeparator?: boolean
  groupName?: string
  bannerSlotClassName?: string
}

/**
 * Payment method radios + DineOut-only inline promo (Figma `16144:19972` / `16388:31182`).
 */
export function PaymentSelector({
  value,
  onChange,
  titleVariant = "body-m-accent",
  optionLabels = CLAIM_FLOW_PAYMENT_LABELS,
  showOptionDividers = false,
  showHeader = true,
  showSectionSeparator = true,
  groupName = "claim-offer-payment",
  bannerSlotClassName = "px-6 pb-3 pt-3",
}: PaymentSelectorProps) {
  const isDineout = value === "dineout"
  const headingId = `${groupName}-heading`

  return (
    <div className="flex flex-col">
      {showHeader ?
        <>
          <PaymentMethodSheetHeader
            title="Payment method"
            description="Pay at the venue after dining. Choose your preferred payment method."
            titleVariant={titleVariant}
            headingId={headingId}
          />
          {showSectionSeparator ?
            <div className="mx-6 h-px shrink-0 bg-separator" aria-hidden />
          : null}
        </>
      : null}

      <div className="px-6 pt-0">
        <RadioGroup
          name={groupName}
          value={value}
          onChange={(e) => onChange(e.target.value as PaymentMethod)}
          aria-labelledby={headingId}
        >
          {!showHeader ?
            <span id={headingId} className="sr-only">
              Payment method
            </span>
          : null}
          <div className="flex w-full flex-col">
            <div className="w-full">
              <label
                htmlFor={`${groupName}-dineout`}
                className={paymentMethodOptionClass(showOptionDividers)}
              >
                <span className="min-w-0 flex-1 text-start">
                  <Typography as="span" variant="body-m-regular" color="primary">
                    {optionLabels.dineout}
                  </Typography>
                </span>
                <Radio id={`${groupName}-dineout`} value="dineout" />
              </label>
            </div>
            <div className="w-full">
              <label
                htmlFor={`${groupName}-card`}
                className={paymentMethodOptionClass(false)}
              >
                <span className="min-w-0 flex-1 text-start">
                  <Typography as="span" variant="body-m-regular" color="primary">
                    {optionLabels.cardOrCash}
                  </Typography>
                </span>
                <Radio id={`${groupName}-card`} value="card_or_cash" />
              </label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <DineOutCashbackBannerSlot
        visible={isDineout}
        className={bannerSlotClassName}
      />
    </div>
  )
}
