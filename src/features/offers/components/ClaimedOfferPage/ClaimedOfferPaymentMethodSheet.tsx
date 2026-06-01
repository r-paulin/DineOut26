import { Button } from "@bolteu/kalep-react"
import { useEffect, useState } from "react"
import { PaymentSelector } from "@/features/offers/components/ClaimOfferModal/PaymentSelector"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import { CLAIMED_OFFER_PAYMENT_LABELS } from "@/features/offers/components/paymentMethod/DineOutCashbackBannerSlot"
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

/** Figma `16388:31182` — switch payment method after claim. */
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
      title="Payment method"
      description="Choose how you will pay at the venue after dining."
      hero="none"
      sheetHeight="fit"
      footerBordered={false}
      footer={
        <Button type="button" variant="primary" size="lg" fullWidth onClick={handleSave}>
          Save
        </Button>
      }
    >
      <PaymentSelector
        value={draft}
        onChange={setDraft}
        titleVariant="heading-xs-accent"
        optionLabels={CLAIMED_OFFER_PAYMENT_LABELS}
        showOptionDividers
        showSectionSeparator={false}
        bannerSlotClassName="px-6 pb-6 pt-3"
        groupName="claimed-offer-payment"
      />
    </ClaimPromoSheetShell>
  )
}
