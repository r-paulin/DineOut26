import { Button, Typography } from "@bolteu/kalep-react"

/** Figma `16164:22950` — toast illustration (`public/images/discover-filtered-empty.png`). */
const EMPTY_ILLUSTRATION_SRC = "/images/discover-filtered-empty.png"

/**
 * Discover bottom sheet when Live now, Open now, or Price filters match nothing.
 * Figma `16164:22950`.
 */
export function DiscoverFilteredEmptyState({
  onResetFilters,
}: {
  onResetFilters: () => void
}) {
  return (
    <section
      className="flex w-full flex-col items-center gap-6 px-2 pb-4 pt-6 text-center"
      aria-label="No matching restaurants"
    >
      <img
        src={EMPTY_ILLUSTRATION_SRC}
        alt=""
        width={200}
        height={148}
        className="block h-[9.25rem] w-[12.5rem] max-w-full object-contain"
        loading="lazy"
        decoding="async"
      />
      <div className="flex max-w-[18rem] flex-col gap-2">
        <Typography
          variant="body-l-compact-accent"
          color="primary"
          as="p"
          inlineStyle={{
            fontWeight: 600,
            fontVariationSettings: '"opsz" 18, "wght" 600',
          }}
        >
          No places match your filters
        </Typography>
        <Typography variant="body-s-regular" color="secondary" as="p">
          Try changing your filters or reset them to see all restaurants with
          offers.
        </Typography>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        onClick={onResetFilters}
      >
        Reset filters
      </Button>
    </section>
  )
}
