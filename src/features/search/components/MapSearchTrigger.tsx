import Search from "@bolteu/kalep-react-icons/dist/Search"

export interface MapSearchTriggerProps {
  onOpenSearch: () => void
  placeholder?: string
  /** Match Search fullscreen idle field (grey pill). */
  searchLike?: boolean
}

/**
 * Looks like a Kalep TextField, but it's actually a button — clicking it opens
 * the fullscreen search overlay. Kept as a button (not a real input) because
 * editing happens in the overlay, not here.
 */
export function MapSearchTrigger({
  onOpenSearch,
  placeholder = "Restaurants, cafes, bars...",
  searchLike = false,
}: MapSearchTriggerProps) {
  const surfaceClass = searchLike
    ? "bg-neutral-secondary border-transparent shadow-none"
    : "bg-layer-floor-1 shadow-[0_0.125rem_0.375rem_rgba(0,0,0,0.16)] border-[rgba(0,45,30,0.08)] hover:border-[rgba(0,45,30,0.12)]"
  return (
    <button
      type="button"
      className={`ffeature flex w-full min-h-12 items-center gap-[0.625rem] px-[0.875rem] m-0 cursor-pointer text-left rounded-[var(--radius-search-field)] border focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-border-action-primary)] focus-visible:outline-offset-2 ${surfaceClass}`}
      onClick={onOpenSearch}
      aria-label={placeholder}
    >
      <Search size="lg" className="shrink-0 text-tertiary" />
      <span className="flex-1 min-w-0 truncate text-tertiary text-base leading-6 -tracking-[0.006875rem]">
        {placeholder}
      </span>
    </button>
  )
}
