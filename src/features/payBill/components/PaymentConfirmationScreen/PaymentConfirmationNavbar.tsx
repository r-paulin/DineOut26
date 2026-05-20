import { Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface PaymentConfirmationNavbarProps {
  restaurantName: string
  onDismiss: () => void
}

/** Figma PAY BILL / Success + Paid — nav on brand canvas (symmetric insets + balanced title). */
export function PaymentConfirmationNavbar({
  restaurantName,
  onDismiss,
}: PaymentConfirmationNavbarProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-4 px-6 pb-3 pt-[max(1.5rem,var(--safe-area-top))]">
      <button
        type="button"
        aria-label="Close"
        onClick={onDismiss}
        className="pointer-events-auto flex size-10 shrink-0 items-center justify-center rounded-full border-none bg-layer-floor-1 p-0 text-primary shadow-[0px_2px_3px_rgba(0,0,0,0.16)] outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
      >
        <Cross size="md" className="text-primary" aria-hidden />
      </button>
      <div className="min-h-[24px] min-w-0 flex-1 text-center">
        <Typography
          variant="body-l-accent"
          color="primary-inverted"
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
      <div className="size-10 shrink-0" aria-hidden />
    </header>
  )
}
