import { Button, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import InfoCircleOutlined from "@bolteu/kalep-react-icons/dist/InfoCircleOutlined"
import gsap from "gsap"
import { useLayoutEffect, useRef, useState } from "react"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import paidCheckmarkUrl from "@/features/payBill/assets/pay-paid-checkmark-72.png"
import { ClaimedOfferBillInlineNotice } from "@/features/payBill/components/shared/ClaimedOfferBillInlineNotice"
import { ReceiptItem } from "@/features/payBill/components/shared/ReceiptItem"
import {
  discountFirstEur,
  discountSecondEur,
  subtotalWithTip,
} from "@/features/payBill/utils/discountCalc"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import { formatPaymentCodeDisplay } from "@/features/payBill/utils/paymentCodeDisplay"
import { effectivePayDiscountPercents } from "@/features/payBill/utils/payBillDiscounts"
import { AppInfoBottomSheet } from "@/shared/components/AppInfoBottomSheet"
import { CardDivider } from "@/shared/components/CardDivider"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

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

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const Z_CONFIRM_SHEET_OVERLAY = 200
const Z_CONFIRM_SHEET_CONTENT = 201

/**
 * Figma PAY BILL / Paid: nav + checkmark, “Successfully paid” + strike + hero amount,
 * payment code card, receipt, Done closes the flow.
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
  const heroImgRef = useRef<HTMLImageElement>(null)
  const [dineOutBenefitSheet, setDineOutBenefitSheet] = useState(false)

  const subtotal = subtotalWithTip(receiptTotal, tip)
  const { discountPercent: d1, discountAddPercent: d2 } =
    effectivePayDiscountPercents(offer)
  const firstDiscEur = discountFirstEur(receiptTotal, tip, d1)
  const secondDiscEur = discountSecondEur(receiptTotal, tip, d1, d2)
  const showStrikeSubtotal = subtotal > paidAmount + 0.001
  const paymentCode = formatPaymentCodeDisplay(offer, transactionId)

  useLayoutEffect(() => {
    const img = heroImgRef.current
    if (!img) return
    if (prefersReducedMotion()) {
      gsap.set(img, { scale: 1, opacity: 1 })
      return
    }
    gsap.set(img, { scale: 0.88, opacity: 0, transformOrigin: "50% 50%" })
    gsap.to(img, {
      scale: 1,
      opacity: 1,
      duration: 0.45,
      ease: "back.out(1.2)",
      delay: 0.04,
    })
  }, [])

  return (
    <div className="flex h-[var(--app-h)] max-h-[var(--app-h)] w-full min-h-0 flex-col overflow-hidden bg-layer-floor-1">
      <header className="flex shrink-0 items-center gap-2.5 px-3.5 pb-3 pt-[max(1.5rem,var(--safe-area-top))] pr-16">
        <button
          type="button"
          aria-label="Close"
          onClick={onDismiss}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border-none bg-layer-floor-1 p-0 text-primary shadow-[0px_2px_3px_rgba(0,0,0,0.16)] outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
        >
          <Cross size="md" className="text-primary" aria-hidden />
        </button>
        <div className="min-h-[24px] min-w-0 flex-1 text-center">
          <Typography
            variant="body-l-accent"
            color="primary"
            as="p"
            align="center"
            noWrap
            inlineStyle={{
              fontVariationSettings: "'wght' var(--font-weight-semibold)",
              fontFeatureSettings: FONT_FEAT,
            }}
          >
            {restaurantName}
          </Typography>
        </div>
      </header>

      {offer ?
        <ClaimedOfferBillInlineNotice discountPercent={offer.discountPercent} />
      : null}

      <div className="flex min-h-0 flex-1 flex-col">
        {/*
          Figma `15823:25243`: PageContent / Bill is flex-1 + scroll; payment code is `w-full`
          inside horizontal padding. Receipt + actions are shrink-0 siblings pinned under the
          divider (not floating in the scroll region).
        */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col items-center px-6 pb-3 pt-10">
            <div className="relative size-[72px] shrink-0">
              <img
                ref={heroImgRef}
                src={paidCheckmarkUrl}
                alt=""
                width={72}
                height={72}
                draggable={false}
                className="pointer-events-none size-full object-contain"
              />
            </div>

            <div className="w-full pb-6 pt-3 text-center">
              <Typography
                variant="body-l-regular"
                color="secondary"
                as="p"
                align="center"
                inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
              >
                Successfully paid
                {showStrikeSubtotal ?
                  <>
                    {" "}
                    <span className="[text-decoration-skip-ink:none] line-through tabular-nums">
                      {formatEurMajor(subtotal)}
                    </span>
                  </>
                : null}
              </Typography>
              <p
                className="mt-1 w-full text-center text-[64px] font-semibold leading-[72px] text-primary tabular-nums"
                style={{
                  fontFamily: "var(--font-family)",
                  fontFeatureSettings: FONT_FEAT,
                  fontVariationSettings: "'wght' var(--font-weight-semibold)",
                }}
              >
                {formatEurMajor(paidAmount)}
              </p>
            </div>

            <div className="w-full rounded-xl bg-neutral-secondary px-6 py-3 text-center">
              <Typography variant="body-s-regular" color="secondary" as="p">
                Payment code
              </Typography>
              <Typography
                variant="heading-l-accent"
                color="primary"
                as="p"
                align="center"
                paddingTop={1}
                inlineStyle={{
                  fontFeatureSettings: FONT_FEAT,
                  fontVariationSettings: "'wght' var(--font-weight-semibold)",
                }}
              >
                {paymentCode}
              </Typography>
              <Typography variant="body-s-regular" color="primary" as="p" paddingTop={1}>
                Show this code to the waiter to confirm your payment
              </Typography>
            </div>
          </div>
        </div>

        <CardDivider />

        <div className="flex shrink-0 flex-col gap-2 bg-layer-floor-1 px-6 py-6">
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
          {d1 > 0 ?
            <ReceiptItem
              label={`Discount ${d1}%`}
              amount={formatEurMajor(-firstDiscEur)}
              variant="regular"
              labelColor="secondary"
              labelTypographyVariant="body-m-regular"
              labelSuffix={
                <button
                  type="button"
                  className="inline-flex border-none bg-transparent p-0"
                  aria-label="Discount info"
                  onClick={() => setDineOutBenefitSheet(true)}
                >
                  <InfoCircleOutlined size="sm" className="text-secondary" aria-hidden />
                </button>
              }
            />
          : null}
          {d2 > 0 ?
            <ReceiptItem
              label={`Discount ${d2}%`}
              amount={formatEurMajor(-secondDiscEur)}
              variant="regular"
              labelColor="secondary"
              labelTypographyVariant="body-m-regular"
              labelSuffix={
                <button
                  type="button"
                  className="inline-flex border-none bg-transparent p-0"
                  aria-label="DineOut benefit info"
                  onClick={() => setDineOutBenefitSheet(true)}
                >
                  <InfoCircleOutlined size="sm" className="text-secondary" aria-hidden />
                </button>
              }
            />
          : null}
        </div>

        <div className="flex w-full shrink-0 flex-col px-6 pb-[max(1.5rem,var(--safe-area-bottom))] pt-3">
          <Button
            variant="primary"
            fullWidth
            onClick={onDone}
            overrideClassName="!h-14 !min-h-14 rounded-full"
          >
            Done
          </Button>
        </div>
      </div>

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
