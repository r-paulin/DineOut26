import { Button, Typography } from "@bolteu/kalep-react"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import { ACTIVE_OFFER_CONFLICT_HERO_SRC } from "@/features/offers/constants/activeOfferConflictHero"
import {
  ACTIVE_OFFER_CONFLICT_CANCEL_CTA,
  ACTIVE_OFFER_CONFLICT_KEEP_CTA,
  ACTIVE_OFFER_CONFLICT_SHEET_TITLE,
  activeOfferConflictSheetBody,
} from "@/features/offers/constants/activeOfferConflictSheetCopy"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface ActiveOfferConflictSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  blockingRestaurantName: string
  onCancelBlockingOffer: () => void
  container?: HTMLElement | null
}

/**
 * Shown when a new claim overlaps an active claim at another restaurant.
 * Figma `16942:16608`.
 */
export function ActiveOfferConflictSheet({
  isOpen,
  onOpenChange,
  blockingRestaurantName,
  onCancelBlockingOffer,
  container,
}: ActiveOfferConflictSheetProps) {
  const body = activeOfferConflictSheetBody(blockingRestaurantName)

  return (
    <ClaimPromoSheetShell
      open={isOpen}
      onOpenChange={onOpenChange}
      container={container}
      title={ACTIVE_OFFER_CONFLICT_SHEET_TITLE}
      description={body}
      hero="offer-image"
      heroImageSrc={ACTIVE_OFFER_CONFLICT_HERO_SRC}
      heroImageClassName="object-contain"
      sheetHeight="fit"
      surfaceClass="bg-layer-floor-1"
      footerBordered={false}
      footer={
        <div className="flex w-full flex-col gap-2">
          <Button
            type="button"
            variant="danger"
            size="lg"
            fullWidth
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCancelBlockingOffer()
            }}
          >
            {ACTIVE_OFFER_CONFLICT_CANCEL_CTA}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenChange(false)
            }}
          >
            {ACTIVE_OFFER_CONFLICT_KEEP_CTA}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 px-6 pb-3 pt-6">
        <Typography
          variant="heading-m-accent"
          color="primary"
          as="h2"
          inlineStyle={SEMIBOLD}
        >
          {ACTIVE_OFFER_CONFLICT_SHEET_TITLE}
        </Typography>
        <Typography variant="body-m-regular" color="primary" as="p">
          {body}
        </Typography>
      </div>
    </ClaimPromoSheetShell>
  )
}
