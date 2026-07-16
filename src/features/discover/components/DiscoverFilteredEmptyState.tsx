import { Button, Typography } from "@bolteu/kalep-react"

/** Figma `19444:56050` — paper-bag empty illustration. */
const EMPTY_ILLUSTRATION_SRC = "/images/discover-filtered-empty.png"

/**
 * Filtered results empty state (fullscreen + discover sheet).
 * Figma `19444:56050`. Side inset is always 24px (`px-6`) on this block.
 */
export function DiscoverFilteredEmptyState({
  onResetFilters,
}: {
  onResetFilters: () => void
}) {
  return (
    <section
      className="box-border flex w-full max-w-full flex-col items-center justify-center px-6 text-center"
      aria-label="No matching venues"
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
      <div className="flex w-full flex-col items-center gap-2 pb-4">
        <Typography
          variant="heading-s-accent"
          color="primary"
          as="p"
          align="center"
          inlineStyle={{
            letterSpacing: "-0.48px",
            fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
          }}
        >
          No offers available right now
        </Typography>
        <Typography
          variant="body-m-regular"
          color="primary"
          as="p"
          align="center"
        >
          Refine your filters to explore other dining options.
        </Typography>
      </div>
      <div className="w-full max-w-[10rem]">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onResetFilters}
          fullWidth
        >
          Clear filters
        </Button>
      </div>
    </section>
  )
}
