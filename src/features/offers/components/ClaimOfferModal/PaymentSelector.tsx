import { Radio, RadioGroup, Typography } from "@bolteu/kalep-react"
import {
  CLAIM_FLOW_PAYMENT_LABELS,
  DineOutCashbackBannerSlot,
  paymentMethodOptionClass,
  PaymentMethodSheetHeader,
  type PaymentMethodOptionLabels,
  type PaymentMethodSheetHeaderVariant,
} from "@/features/offers/components/paymentMethod/DineOutCashbackBannerSlot"
import {
  getPaymentMethodOptionDetail,
  PAYMENT_METHOD_SHEET_INTRO,
  PAYMENT_METHOD_SHEET_TITLE,
} from "@/features/offers/constants/paymentMethodSheetCopy"
import type { PaymentMethod } from "@/features/offers/offers.types"

export type PaymentSelectorDetailPresentation = "banner" | "inline-selected"

export interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (next: PaymentMethod) => void
  titleVariant?: PaymentMethodSheetHeaderVariant
  optionLabels?: PaymentMethodOptionLabels
  /** Dividers between options (claimed-offer modal). */
  showOptionDividers?: boolean
  showHeader?: boolean
  showSectionSeparator?: boolean
  groupName?: string
  bannerSlotClassName?: string
  /** Claim modal: animated banner; claimed-offer sheet: subtitle under selected row. */
  detailPresentation?: PaymentSelectorDetailPresentation
}

function PaymentMethodOptionLabel({
  label,
  selected,
  detailPresentation,
  method,
}: {
  label: string
  selected: boolean
  detailPresentation: PaymentSelectorDetailPresentation
  method: PaymentMethod
}) {
  const detail =
    detailPresentation === "inline-selected" && selected ?
      getPaymentMethodOptionDetail(method)
    : undefined

  return (
    <span className="flex min-w-0 flex-1 flex-col items-start gap-1 text-start">
      <Typography as="span" variant="body-m-regular" color="primary">
        {label}
      </Typography>
      {detail ?
        <Typography as="span" variant="body-s-regular" color="secondary">
          {detail}
        </Typography>
      : null}
    </span>
  )
}

/**
 * Payment method radios + DineOut-only inline promo (Figma `16144:19972` / `16393:40712`).
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
  bannerSlotClassName = "px-6 pb-6",
  detailPresentation = "banner",
}: PaymentSelectorProps) {
  const isDineout = value === "dineout"
  const isInlineDetail = detailPresentation === "inline-selected"
  const headingId = `${groupName}-heading`

  return (
    <div className="flex flex-col">
      {showHeader ?
        <>
          <PaymentMethodSheetHeader
            title={PAYMENT_METHOD_SHEET_TITLE}
            description={PAYMENT_METHOD_SHEET_INTRO}
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
              {PAYMENT_METHOD_SHEET_TITLE}
            </span>
          : null}
          <div className="flex w-full flex-col">
            <div className="w-full">
              <label
                htmlFor={`${groupName}-dineout`}
                className={paymentMethodOptionClass(
                  showOptionDividers,
                  isInlineDetail && isDineout,
                )}
              >
                <PaymentMethodOptionLabel
                  label={optionLabels.dineout}
                  selected={isDineout}
                  detailPresentation={detailPresentation}
                  method="dineout"
                />
                <Radio id={`${groupName}-dineout`} value="dineout" />
              </label>
            </div>
            <div className="w-full">
              <label
                htmlFor={`${groupName}-card`}
                className={paymentMethodOptionClass(
                  false,
                  isInlineDetail && !isDineout,
                )}
              >
                <PaymentMethodOptionLabel
                  label={optionLabels.cardOrCash}
                  selected={!isDineout}
                  detailPresentation={detailPresentation}
                  method="card_or_cash"
                />
                <Radio id={`${groupName}-card`} value="card_or_cash" />
              </label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {!isInlineDetail ?
        <DineOutCashbackBannerSlot
          visible={isDineout}
          className={bannerSlotClassName}
        />
      : null}
    </div>
  )
}
