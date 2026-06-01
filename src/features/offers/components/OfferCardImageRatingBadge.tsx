import { Typography } from "@bolteu/kalep-react"
import { OfferCardListRatingStar } from "@/features/offers/components/OfferCardListRatingStar"

/** e.g. `200+` → `(200+)`; catalog values already parenthesized pass through. */
export function formatReviewCountForBadge(raw?: string): string | undefined {
  const t = raw?.trim()
  if (!t) return undefined
  if (t.startsWith("(") && t.endsWith(")")) return t
  return `(${t})`
}

export interface OfferCardImageRatingBadgeProps {
  rating: string
  /** Shown after the score, e.g. `(200+)`. */
  reviewCount?: string
  /**
   * `compact` — carousel XS hero badge placement.
   * `comfortable` — map-opened card hero (may add shadow).
   */
  density?: "compact" | "comfortable"
  /**
   * Map-opened only: omit absolute positioning so a parent overlay can pin the pill
   * (e.g. flex `items-end justify-end` in the hero bounds).
   */
  staticComfortable?: boolean
}

/** Figma `_Badge / Rating` (`16545:27772`). */
const RATING_BADGE_PILL_CLASS =
  "flex w-max shrink-0 flex-nowrap items-center justify-center gap-0.5 overflow-hidden rounded-[4px] bg-layer-floor-1 py-0.5 pl-0.5 pr-1"

const RATING_BADGE_COMFORTABLE_SHADOW =
  "shadow-[0_0.1rem_0.15rem_rgba(0,0,0,0.16)]"

const RATING_BADGE_RATING_STYLE = {
  letterSpacing: "-0.294px",
  lineHeight: "1.125rem",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'tnum' 1",
} as const

const RATING_BADGE_REVIEW_STYLE = {
  letterSpacing: "-0.084px",
  lineHeight: "1.125rem",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

function RatingBadgePill({
  rating,
  formattedReviewCount,
  withShadow,
}: {
  rating: string
  formattedReviewCount?: string
  withShadow?: boolean
}) {
  return (
    <div
      className={[RATING_BADGE_PILL_CLASS, withShadow ? RATING_BADGE_COMFORTABLE_SHADOW : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <OfferCardListRatingStar />
      <Typography
        as="span"
        variant="body-s-accent"
        color="primary"
        inlineStyle={RATING_BADGE_RATING_STYLE}
      >
        {rating}
      </Typography>
      {formattedReviewCount ?
        <Typography
          as="span"
          variant="body-s-regular"
          color="secondary"
          inlineStyle={RATING_BADGE_REVIEW_STYLE}
        >
          {formattedReviewCount}
        </Typography>
      : null}
    </div>
  )
}

/**
 * Figma `_Badge / Rating` (`16545:27772`): 16px star, Body S compact score + review count.
 */
export function OfferCardImageRatingBadge({
  rating,
  reviewCount,
  density = "compact",
  staticComfortable = false,
}: OfferCardImageRatingBadgeProps) {
  const formattedReviewCount = formatReviewCountForBadge(reviewCount)
  const pill = (
    <RatingBadgePill
      rating={rating}
      formattedReviewCount={formattedReviewCount}
      withShadow={density === "comfortable"}
    />
  )

  if (density === "comfortable") {
    if (staticComfortable) {
      return pill
    }
    return <div className="absolute bottom-3 right-3 z-[1]">{pill}</div>
  }

  return <div className="absolute right-2 bottom-2 z-[1]">{pill}</div>
}
