import { Typography } from "@bolteu/kalep-react"
import { OfferCardListRatingStar } from "@/features/offers/components/OfferCardListRatingStar"
import {
  SUMMARY_BAR_CLASS,
  SUMMARY_COL_DIVIDER_ELM,
  SUMMARY_COL_STACK,
  SUMMARY_SUBLINE,
  SUMMARY_VALUE_LINE,
} from "@/features/restaurant/components/restaurantDetailSummaryTokens"
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
  /** Opens the address bottom sheet (location column). */
  onOpenAddress?: () => void
}

/**
 * Restaurant summary: three equal columns, 1px dividers, rounded top 16px,
 * overlaps hero (Figma `16123:18008` Feed / Data).
 */
export function RestaurantDetailStatsBar({
  ratingValue,
  reviewsLine,
  priceRange,
  areaLabel,
  address,
  onOpenReviews,
  onOpenPriceInfo,
  onOpenAddress,
}: RestaurantDetailStatsBarProps) {
  return (
    <div className={SUMMARY_BAR_CLASS} role="group" aria-label="Restaurant summary">
      <button
        type="button"
        className={`${SUMMARY_COL_STACK} cursor-pointer border-0`}
        onClick={onOpenReviews}
        aria-label={`Rating ${ratingValue}, ${reviewsLine}`}
      >
        <span className="flex items-center justify-center gap-1">
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
      <div className={SUMMARY_COL_DIVIDER_ELM} aria-hidden />
      {onOpenPriceInfo ?
        <button
          type="button"
          className={`${SUMMARY_COL_STACK} cursor-pointer border-0`}
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
      : <div
          className={SUMMARY_COL_STACK}
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
        </div>
      }
      <div className={SUMMARY_COL_DIVIDER_ELM} aria-hidden />
      <button
        type="button"
        className={`${SUMMARY_COL_STACK} cursor-pointer border-0 bg-transparent text-inherit`}
        onClick={onOpenAddress}
        aria-label={`View address: ${areaLabel}, ${address}`}
      >
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
        <span
          className={SUMMARY_SUBLINE}
          style={{ fontFamily: "var(--font-family)" }}
        >
          {address}
        </span>
      </button>
    </div>
  )
}
