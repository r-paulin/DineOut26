import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"

export interface ClaimedOfferNavBarProps {
  onBack: () => void
}

/** Figma nav bar — plain back control + bottom divider. */
export function ClaimedOfferNavBar({ onBack }: ClaimedOfferNavBarProps) {
  return (
    <div className="flex shrink-0 flex-col bg-layer-floor-1 pt-[max(1rem,var(--safe-area-top))]">
      <div className="flex items-center gap-4 px-6 pb-4 pt-4">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-primary outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
        >
          <ArrowLeft size="md" aria-hidden />
        </button>
        <div className="min-h-6 min-w-0 flex-1" aria-hidden />
        <div className="size-6 shrink-0" aria-hidden />
      </div>
      <div className="h-px w-full shrink-0 bg-separator" aria-hidden />
    </div>
  )
}
