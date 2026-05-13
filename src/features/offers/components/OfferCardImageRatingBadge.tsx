import { Typography } from "@bolteu/kalep-react"
import Star from "@bolteu/kalep-react-icons/dist/Star"

/** Figma rating star fill (place cards + list meta). */
const RATING_STAR_ICON_CLASS = "shrink-0 text-[#FFB200]"

export interface OfferCardImageRatingBadgeProps {
  rating: string
  /** XL / map-opened: e.g. `(200+)`, shown after the score per Figma M badge. */
  reviewCount?: string
  /**
   * `compact` — `_Place / Card / XS` hero (15735:21933), 20px pill, Body XS.
   * `comfortable` — `_Place / Card / On Map - Opened` (15809:13976), taller pill, Body S.
   */
  density?: "compact" | "comfortable"
  /**
   * Map-opened only: omit absolute positioning so a parent overlay can pin the pill
   * (e.g. flex `items-end justify-end` in the hero bounds).
   */
  staticComfortable?: boolean
}

/**
 * Figma rating pill: star `#FFB200`; score + optional review count follow density.
 */
export function OfferCardImageRatingBadge({
  rating,
  reviewCount,
  density = "compact",
  staticComfortable = false,
}: OfferCardImageRatingBadgeProps) {
  if (density === "comfortable") {
    const pill = (
      <div className="flex w-max shrink-0 flex-nowrap items-center gap-1 rounded bg-layer-floor-1 px-2 py-0.5 shadow-[0_0.1rem_0.15rem_rgba(0,0,0,0.16)]">
        <Star size="xs" className={RATING_STAR_ICON_CLASS} aria-hidden />
        <Typography
          as="span"
          variant="body-s-accent"
          color="primary"
          inlineStyle={{ letterSpacing: "-0.00525rem", lineHeight: "1.25rem" }}
        >
          {rating}
        </Typography>
        {reviewCount ? (
          <Typography
            as="span"
            variant="body-s-regular"
            color="secondary"
            inlineStyle={{ letterSpacing: "-0.00525rem", lineHeight: "1.25rem" }}
          >
            {reviewCount}
          </Typography>
        ) : null}
      </div>
    )
    if (staticComfortable) {
      return pill
    }
    return (
      <div className="absolute bottom-3 right-3 z-[1]">{pill}</div>
    )
  }

  return (
    <div className="absolute right-2 bottom-2 z-[1] flex h-5 items-center gap-1 rounded bg-layer-floor-1 pl-1 pr-1.5">
      <Star
        size="xs"
        width={12}
        height={12}
        className={RATING_STAR_ICON_CLASS}
        aria-hidden
      />
      <Typography
        as="span"
        variant="body-xs-accent"
        color="primary"
        inlineStyle={{ letterSpacing: 0, lineHeight: "1rem" }}
      >
        {rating}
      </Typography>
    </div>
  )
}
