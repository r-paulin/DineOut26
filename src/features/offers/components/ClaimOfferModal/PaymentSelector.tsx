import { Radio, RadioGroup, Typography } from "@bolteu/kalep-react"
import CashbackColoured from "@bolteu/kalep-react-icons/dist/CashbackColoured"
import {
  CLAIM_FLOW_PAYMENT_LABELS,
  DineOutCashbackBannerSlot,
  paymentMethodOptionClass,
  PaymentMethodSheetHeader,
  type PaymentMethodOptionLabels,
  type PaymentMethodSheetHeaderVariant,
  type PaymentOptionRowDensity,
} from "@/features/offers/components/paymentMethod/DineOutCashbackBannerSlot"
import {
  getPaymentMethodOptionDetail,
  PAYMENT_METHOD_SHEET_INTRO,
  PAYMENT_METHOD_SHEET_TITLE,
} from "@/features/offers/constants/paymentMethodSheetCopy"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { AnimatedCollapse } from "@/shared/components/AnimatedCollapse"

/** Pin radio to the primary label row (not vertically centered in multi-line rows). */
const PAYMENT_RADIO_SLOT_CLASS = "shrink-0 self-start pt-px"

export type PaymentSelectorDetailPresentation = "banner" | "inline-selected"

export interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (next: PaymentMethod) => void
  titleVariant?: PaymentMethodSheetHeaderVariant
  sectionTitle?: string
  sectionIntro?: string
  optionLabels?: PaymentMethodOptionLabels
  /** Dividers between options (claimed-offer modal). */
  showOptionDividers?: boolean
  showHeader?: boolean
  showSectionSeparator?: boolean
  groupName?: string
  bannerSlotClassName?: string
  /** Claim modal: animated banner; claimed-offer sheet: animated subtitle under selected row. */
  detailPresentation?: PaymentSelectorDetailPresentation
  getOptionDetail?: (method: PaymentMethod) => string | undefined
  /** Show cashback icon on DineOut inline detail (claim modal). */
  showDineoutDetailIcon?: boolean
  /** Figma `17459:185026` payment-sheet list rows vs claim-modal rows. */
  optionRowDensity?: PaymentOptionRowDensity
}

function PaymentMethodOptionDetail({
  detail,
  showDetailIcon,
}: {
  detail: string
  showDetailIcon: boolean
}) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      {showDetailIcon ?
        <CashbackColoured size="sm" className="shrink-0" aria-hidden />
      : null}
      <Typography as="span" variant="body-s-regular" color="secondary">
        {detail}
      </Typography>
    </span>
  )
}

function PaymentMethodOptionRow({
  htmlFor,
  className,
  label,
  selected,
  detail,
  showDineoutDetailIcon,
  method,
  animateDetail,
  rowDensity,
  radioId,
  radioValue,
}: {
  htmlFor: string
  className: string
  label: string
  selected: boolean
  detail?: string
  showDineoutDetailIcon: boolean
  method: PaymentMethod
  animateDetail: boolean
  rowDensity: PaymentOptionRowDensity
  radioId: string
  radioValue: PaymentMethod
}) {
  const showDetailIcon =
    showDineoutDetailIcon && selected && method === "dineout" && detail != null

  const detailTypography =
    detail ?
      showDetailIcon ?
        <PaymentMethodOptionDetail detail={detail} showDetailIcon />
      : <Typography as="span" variant="body-s-regular" color="secondary">
          {detail}
        </Typography>
    : null

  const detailNode =
    detailTypography && animateDetail ?
      <AnimatedCollapse visible={detail != null} className="w-full">
        {detailTypography}
      </AnimatedCollapse>
    : detailTypography

  const radioSlot = (
    <span className={PAYMENT_RADIO_SLOT_CLASS}>
      <Radio id={radioId} value={radioValue} />
    </span>
  )

  if (rowDensity === "payment-sheet") {
    return (
      <label htmlFor={htmlFor} className={className}>
        <div className="flex w-full items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <Typography as="span" variant="body-m-regular" color="primary">
              {label}
            </Typography>
            {detailNode}
          </div>
          {radioSlot}
        </div>
      </label>
    )
  }

  return (
    <label htmlFor={htmlFor} className={className}>
      <span className="flex w-full items-start gap-3">
        <span className="min-w-0 flex-1 text-start">
          <Typography as="span" variant="body-m-regular" color="primary">
            {label}
          </Typography>
        </span>
        {radioSlot}
      </span>
      {detailNode}
    </label>
  )
}

/**
 * Payment method radios + DineOut-only inline promo (Figma `16144:19972` / `16393:40712`).
 */
export function PaymentSelector({
  value,
  onChange,
  titleVariant = "body-m-accent",
  sectionTitle = PAYMENT_METHOD_SHEET_TITLE,
  sectionIntro = PAYMENT_METHOD_SHEET_INTRO,
  optionLabels = CLAIM_FLOW_PAYMENT_LABELS,
  showOptionDividers = false,
  showHeader = true,
  showSectionSeparator = true,
  groupName = "claim-offer-payment",
  bannerSlotClassName = "pb-3",
  detailPresentation = "banner",
  getOptionDetail = getPaymentMethodOptionDetail,
  showDineoutDetailIcon = false,
  optionRowDensity = "default",
}: PaymentSelectorProps) {
  const isDineout = value === "dineout"
  const isInlineDetail = detailPresentation === "inline-selected"
  const headingId = `${groupName}-heading`

  const resolveDetail = (method: PaymentMethod, selected: boolean) => {
    if (!isInlineDetail) return undefined
    const detail = getOptionDetail(method)
    if (optionRowDensity === "payment-sheet") return detail
    return selected ? detail : undefined
  }

  return (
    <div className="flex flex-col">
      {showHeader ?
        <>
          <PaymentMethodSheetHeader
            title={sectionTitle}
            description={sectionIntro}
            titleVariant={titleVariant}
            headingId={headingId}
          />
          {showSectionSeparator ?
            <div className="mx-6 h-px shrink-0 bg-separator" aria-hidden />
          : null}
        </>
      : null}

      <div
        className={
          optionRowDensity === "payment-sheet" ? "px-6" : "px-6 pb-3 pt-0"
        }
      >
        <RadioGroup
          name={groupName}
          value={value}
          onChange={(e) => onChange(e.target.value as PaymentMethod)}
          aria-labelledby={headingId}
        >
          {!showHeader ?
            <span id={headingId} className="sr-only">
              {sectionTitle}
            </span>
          : null}
          <div className="flex w-full flex-col">
            <div className="w-full">
              <PaymentMethodOptionRow
                htmlFor={`${groupName}-dineout`}
                className={paymentMethodOptionClass(
                  showOptionDividers,
                  resolveDetail("dineout", isDineout) != null,
                  optionRowDensity,
                )}
                label={optionLabels.dineout}
                selected={isDineout}
                detail={resolveDetail("dineout", isDineout)}
                showDineoutDetailIcon={showDineoutDetailIcon}
                method="dineout"
                animateDetail={
                  isInlineDetail && optionRowDensity !== "payment-sheet"
                }
                rowDensity={optionRowDensity}
                radioId={`${groupName}-dineout`}
                radioValue="dineout"
              />
            </div>
            {!isInlineDetail ?
              <DineOutCashbackBannerSlot
                visible={isDineout}
                className={bannerSlotClassName}
              />
            : null}
            <div className="w-full">
              <PaymentMethodOptionRow
                htmlFor={`${groupName}-card`}
                className={paymentMethodOptionClass(
                  false,
                  resolveDetail("card_or_cash", !isDineout) != null,
                  optionRowDensity,
                )}
                label={optionLabels.cardOrCash}
                selected={!isDineout}
                detail={resolveDetail("card_or_cash", !isDineout)}
                showDineoutDetailIcon={showDineoutDetailIcon}
                method="card_or_cash"
                animateDetail={
                  isInlineDetail && optionRowDensity !== "payment-sheet"
                }
                rowDensity={optionRowDensity}
                radioId={`${groupName}-card`}
                radioValue="card_or_cash"
              />
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
