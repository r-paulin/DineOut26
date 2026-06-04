import { Button, Typography } from "@bolteu/kalep-react"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import { RESTAURANT_RATING_HERO_SRC } from "@/features/restaurant/constants/restaurantRatingHero"
import {
  RESTAURANT_RATING_SHEET_BODY,
  RESTAURANT_RATING_SHEET_CTA,
  RESTAURANT_RATING_SHEET_TITLE,
} from "@/features/restaurant/constants/restaurantRatingSheetCopy"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface RestaurantRatingSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Portal target (device shell); falls back to default when absent. */
  container?: HTMLElement | null
}

/**
 * Informational rating explainer (Bolt Food + DineOut verified ratings).
 * Figma `16672:57015` — MODAL / Rating.
 */
export function RestaurantRatingSheet({
  isOpen,
  onOpenChange,
  container,
}: RestaurantRatingSheetProps) {
  return (
    <ClaimPromoSheetShell
      open={isOpen}
      onOpenChange={onOpenChange}
      container={container}
      title={RESTAURANT_RATING_SHEET_TITLE}
      description={RESTAURANT_RATING_SHEET_BODY}
      hero="offer-image"
      heroImageSrc={RESTAURANT_RATING_HERO_SRC}
      heroImageClassName="object-contain"
      sheetHeight="fit"
      surfaceClass="bg-layer-floor-1"
      footerBordered={false}
      footer={
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
          {RESTAURANT_RATING_SHEET_CTA}
        </Button>
      }
    >
      <div className="flex flex-col gap-3 px-6 pb-3 pt-6">
        <Typography
          variant="heading-m-accent"
          color="primary"
          as="h2"
          inlineStyle={SEMIBOLD}
        >
          {RESTAURANT_RATING_SHEET_TITLE}
        </Typography>
        <Typography variant="body-m-regular" color="secondary" as="p">
          {RESTAURANT_RATING_SHEET_BODY}
        </Typography>
      </div>
    </ClaimPromoSheetShell>
  )
}
