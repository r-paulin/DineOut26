import { useMemo } from "react"
import { SheetVerticalOfferSection } from "@/features/offers"
import { restaurantSlugVisibleForPreset } from "@/features/offers/utils/offerCampaign"
import { SEARCH_RESULTS_RIGA } from "@/features/search/data/searchResultsRiga"
import type { OfferTimePreset } from "@/features/search/filters.types"
import { searchResultRigaToOfferCard } from "@/features/search/utils/searchResultRigaToOfferCard"

export interface SearchResultsStaticProps {
  offerTimePreset: OfferTimePreset
  /**
   * Discover “All” on a themed section: same catalogue + XL cards as search,
   * but this string is shown as the list heading instead of “N restaurants”.
   */
  headingOverride?: string
  onRestaurantPress?: (slug: string) => void
}

/**
 * Fullscreen search / section “match” list: vertical XL `OfferCard` stack
 * (`SheetVerticalOfferSection`), same source as Figma SEARCH match (all Riga
 * venues), filtered by offer-time preset.
 */
export function SearchResultsStatic({
  offerTimePreset,
  headingOverride,
  onRestaurantPress,
}: SearchResultsStaticProps) {
  const offers = useMemo(() => {
    const rows = SEARCH_RESULTS_RIGA.filter((r) =>
      restaurantSlugVisibleForPreset(r.restaurantSlug, offerTimePreset),
    )
    return rows.map(searchResultRigaToOfferCard)
  }, [offerTimePreset])

  const countTitle =
    offers.length === 1 ? "1 restaurant" : `${offers.length} restaurants`
  const listTitle = headingOverride ?? countTitle

  return (
    <SheetVerticalOfferSection
      sectionAriaLabel={headingOverride ?? "Search results"}
      title={listTitle}
      onRestaurantPress={onRestaurantPress}
      showAllLink={false}
      offers={offers}
    />
  )
}
