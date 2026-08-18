import { Typography } from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface PayBillScreenHeaderProps {
  title: string
  onBack: () => void
  /** Figma bill/tip screens include a separator under the title row. */
  showDivider?: boolean
  backDisabled?: boolean
}

/**
 * Shared pay-flow top bar — matches Figma bill amount header spacing
 * (`pt-[max(2.5rem,var(--safe-area-top))]`, 15px gap, separator).
 */
export function PayBillScreenHeader({
  title,
  onBack,
  showDivider = true,
  backDisabled = false,
}: PayBillScreenHeaderProps) {
  return (
    <header
      className={[
        "flex shrink-0 flex-col gap-[15px] bg-layer-floor-1 pt-[max(2.5rem,var(--safe-area-top))]",
        // Figma reserves 15px + a 1px separator below the title row on every
        // pay screen; without the separator the gap collapses, so pad instead.
        showDivider ? undefined : "pb-4",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-h-6 items-center gap-4 px-6">
        <button
          type="button"
          aria-label="Back"
          disabled={backDisabled}
          onClick={onBack}
          className="flex size-6 shrink-0 items-center justify-center rounded-full border-none bg-transparent p-0 text-primary outline-none focus-visible:ring-2 focus-visible:ring-action-primary disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowLeft size="md" className="text-primary" aria-hidden />
        </button>
        <div className="flex min-h-[24px] min-w-0 flex-1 items-center justify-center">
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
            {title}
          </Typography>
        </div>
        <span className="size-6 shrink-0" aria-hidden />
      </div>

      {showDivider ?
        <div
          className="h-px w-full shrink-0 bg-[var(--color-border-separator)]"
          aria-hidden
        />
      : null}
    </header>
  )
}
