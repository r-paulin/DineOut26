import { Typography } from "@bolteu/kalep-react"
import { OfferCardListRatingStar } from "@/features/offers/components/OfferCardListRatingStar"
import {
  SUMMARY_COL_DIVIDER,
  SUMMARY_COL_STACK,
  SUMMARY_SUBLINE,
  SUMMARY_VALUE_LINE,
} from "@/features/restaurant/components/restaurantDetailSummaryTokens"
import { googleMapsSearchUrl } from "@/shared/utils/googleMapsSearchUrl"

export interface RestaurantDetailStatsBarProps {
  ratingValue: string
  reviewsLine: string
  priceRange: string
  /** Neighborhood / area tag (e.g. “Old Town”), same source as list cards. */
  areaLabel: string
  /** Full venue address for display + Google Maps query. */
  address: string
  onOpenReviews?: () => void
  onOpenPriceInfo?: () => void
  /** Optional hook when the user opens Maps from the location column. */
  onOpenMaps?: () => void
}

const LINK_RESET =
  "cursor-pointer border-0 text-inherit no-underline decoration-transparent visited:text-inherit"

/**
 * Restaurant summary: three equal columns, 1px dividers, rounded top 16px,
 * overlaps hero (Figma Consumer Dine-out restaurant detail).
 */
export function RestaurantDetailStatsBar({
  ratingValue,
  reviewsLine,
  priceRange,
  areaLabel,
  address,
  onOpenReviews,
  onOpenPriceInfo,
  onOpenMaps,
}: RestaurantDetailStatsBarProps) {
  const mapsHref = googleMapsSearchUrl(address)

  return (
    <div
      className="relative z-[1] -mt-4 mx-0 flex w-full rounded-t-[16px] bg-layer-floor-1 px-2 pb-3 pt-5 shadow-[0_-0.25rem_0.75rem_rgba(0,0,0,0.08)]"
      role="group"
      aria-label="Restaurant summary"
    >
      <button
        type="button"
        className={`${SUMMARY_COL_STACK} cursor-pointer border-0`}
        onClick={onOpenReviews}
        aria-label={`Rating ${ratingValue}, ${reviewsLine}`}
      >
        <span className="flex items-center justify-center gap-1 leading-none">
          <OfferCardListRatingStar />
          <Typography
            variant="body-s-accent"
            color="primary"
            as="span"
            inlineStyle={SUMMARY_VALUE_LINE}
          >
            {ratingValue}
          </Typography>
        </span>
        <span
          className={SUMMARY_SUBLINE}
          style={{ fontFamily: "var(--font-family)" }}
        >
          {reviewsLine}
        </span>
      </button>
      <button
        type="button"
        className={`${SUMMARY_COL_STACK} ${SUMMARY_COL_DIVIDER} cursor-pointer border-0`}
        onClick={onOpenPriceInfo}
        aria-label={`Price range ${priceRange} per person`}
      >
        <Typography
          variant="body-s-accent"
          color="primary"
          as="span"
          inlineStyle={SUMMARY_VALUE_LINE}
        >
          {priceRange}
        </Typography>
        <span
          className={SUMMARY_SUBLINE}
          style={{ fontFamily: "var(--font-family)" }}
        >
          per person
        </span>
      </button>
      <a
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${SUMMARY_COL_STACK} ${SUMMARY_COL_DIVIDER} ${LINK_RESET}`}
        onClick={() => {
          onOpenMaps?.()
        }}
        aria-label={`Open in Google Maps: ${areaLabel}, ${address}`}
      >
        <div className="w-full min-w-0">
          <Typography
            variant="body-s-accent"
            color="primary"
            as="div"
            align="center"
            lines={1}
            inlineStyle={SUMMARY_VALUE_LINE}
          >
            {areaLabel}
          </Typography>
        </div>
        <div className="w-full min-w-0">
          <Typography
            variant="body-s-regular"
            color="secondary"
            as="div"
            align="center"
            lines={1}
            inlineStyle={{
              fontFamily: "var(--font-family)",
              fontSize: "14px",
              lineHeight: "1.125rem",
            }}
          >
            {address}
          </Typography>
        </div>
      </a>
    </div>
  )
}
