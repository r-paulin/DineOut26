import { Button, Typography } from "@bolteu/kalep-react"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import {
  VENUE_CLOSED_SHEET_BODY,
  VENUE_CLOSED_SHEET_CTA,
  VENUE_CLOSED_SHEET_TITLE,
} from "@/features/restaurant/constants/venueClosedSheetCopy"
import { VENUE_CLOSED_HERO_SRC } from "@/features/restaurant/constants/venueClosedHero"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface VenueClosedSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Portal target (device shell); falls back to default when absent. */
  container?: HTMLElement | null
}

/**
 * Shown when the user taps “I'm at the venue” while the restaurant is closed.
 * Figma `16275:26856`.
 */
export function VenueClosedSheet({
  isOpen,
  onOpenChange,
  container,
}: VenueClosedSheetProps) {
  return (
    <ClaimPromoSheetShell
      open={isOpen}
      onOpenChange={onOpenChange}
      container={container}
      title={VENUE_CLOSED_SHEET_TITLE}
      description={VENUE_CLOSED_SHEET_BODY}
      hero="offer-image"
      heroImageSrc={VENUE_CLOSED_HERO_SRC}
      heroImageClassName="object-contain"
      sheetHeight="fit"
      surfaceClass="bg-layer-floor-1"
      footerBordered={false}
      footer={
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onOpenChange(false)
          }}
        >
          {VENUE_CLOSED_SHEET_CTA}
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
          {VENUE_CLOSED_SHEET_TITLE}
        </Typography>
        <Typography variant="body-m-regular" color="primary" as="p">
          {VENUE_CLOSED_SHEET_BODY}
        </Typography>
      </div>
    </ClaimPromoSheetShell>
  )
}
