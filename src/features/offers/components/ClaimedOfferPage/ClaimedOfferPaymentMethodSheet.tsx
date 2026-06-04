import { Button } from "@bolteu/kalep-react"
import { useEffect, useState } from "react"
import { PaymentSelector } from "@/features/offers/components/ClaimOfferModal/PaymentSelector"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import { CLAIMED_OFFER_PAYMENT_LABELS } from "@/features/offers/components/paymentMethod/DineOutCashbackBannerSlot"
import {
  PAYMENT_METHOD_SHEET_INTRO,
  PAYMENT_METHOD_SHEET_TITLE,
} from "@/features/offers/constants/paymentMethodSheetCopy"
import type { PaymentMethod } from "@/features/offers/offers.types"
import {
  Z_CLAIMED_OFFER_SHEET_CONTENT,
  Z_CLAIMED_OFFER_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"

export interface ClaimedOfferPaymentMethodSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: PaymentMethod
  onChange: (next: PaymentMethod) => void
  container?: HTMLElement | null
}

/** Figma `16393:40712` — switch payment method after claim. */
export function ClaimedOfferPaymentMethodSheet({
  open,
  onOpenChange,
  value,
  onChange,
  container,
}: ClaimedOfferPaymentMethodSheetProps) {
  const [draft, setDraft] = useState<PaymentMethod>(value)

  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  const handleSave = () => {
    onChange(draft)
    onOpenChange(false)
  }

  return (
    <ClaimPromoSheetShell
      open={open}
      onOpenChange={onOpenChange}
      container={container}
      zOverlay={Z_CLAIMED_OFFER_SHEET_OVERLAY}
      zContent={Z_CLAIMED_OFFER_SHEET_CONTENT}
      title={PAYMENT_METHOD_SHEET_TITLE}
      description={PAYMENT_METHOD_SHEET_INTRO}
      hero="none"
      sheetHeight="fit"
      surfaceClass="bg-layer-floor-2"
      footerBordered={false}
      footerClassName="pt-4 pb-8"
      footer={
        <Button type="button" variant="primary" size="lg" fullWidth onClick={handleSave}>
          Save
        </Button>
      }
    >
      <PaymentSelector
        value={draft}
        onChange={setDraft}
        titleVariant="heading-s-bottom-sheet"
        optionLabels={CLAIMED_OFFER_PAYMENT_LABELS}
        detailPresentation="inline-selected"
        showOptionDividers
        showSectionSeparator={false}
        groupName="claimed-offer-payment"
      />
    </ClaimPromoSheetShell>
  )
}
