import type { ReactNode } from "react"
import { Typography } from "@bolteu/kalep-react"
import ChevronRight from "@bolteu/kalep-react-icons/dist/ChevronRight"

export interface SheetSectionHeaderProps {
  title: ReactNode
  showAllLink?: boolean
  /** Opens the full-section offer list; omit when `showAllLink` is false. */
  onAllClick?: () => void
}

/**
 * Section title row (Figma Heading XS): title + optional “All” with 18px chevron,
 * vertically centered as one row.
 */
export function SheetSectionHeader({
  title,
  showAllLink = true,
  onAllClick,
}: SheetSectionHeaderProps) {
  const allAria =
    typeof title === "string"
      ? `View all in ${title}`
      : "View all in this section"

  return (
    <div className="flex items-center justify-between gap-3 pt-3 w-full">
      <h2 className="flex-1 min-w-0 m-0 text-primary text-xl leading-[1.5625rem] font-semibold tracking-[-0.02125rem] [font-variation-settings:'wght'_var(--font-weight-semibold)]">
        {title}
      </h2>
      {showAllLink ? (
        <button
          type="button"
          className="ffeature inline-flex items-center gap-1 px-0 py-0 border-none bg-transparent cursor-pointer shrink-0 self-center"
          onClick={onAllClick}
          aria-label={allAria}
        >
          <Typography variant="body-s-accent" color="primary" as="span">
            All
          </Typography>
          <span className="inline-flex shrink-0 text-primary [&_svg]:size-[18px]">
            <ChevronRight size="lg" aria-hidden />
          </span>
        </button>
      ) : null}
    </div>
  )
}
