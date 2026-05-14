import { useMemo } from "react"
import { SheetVerticalOfferSection } from "@/features/offers"
import { restaurantSlugVisibleForPreset } from "@/features/offers/utils/offerCampaign"
import { useRestaurantCatalogSnapshot } from "@/features/restaurants/restaurantCatalogRuntime"
import { getSearchResultsRiga } from "@/features/search/data/searchResultsRiga"
import { searchResultRigaToOfferCard } from "@/features/search/utils/searchResultRigaToOfferCard"

export interface SearchResultsStaticProps {
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
 * venues), filtered to places with at least one timed offer in data.
 */
export function SearchResultsStatic({
  headingOverride,
  onRestaurantPress,
}: SearchResultsStaticProps) {
  const catalogSnapshot = useRestaurantCatalogSnapshot()
  const offers = useMemo(() => {
    const rows = getSearchResultsRiga().filter((r) =>
      restaurantSlugVisibleForPreset(r.restaurantSlug, "any"),
    )
    return rows.map(searchResultRigaToOfferCard)
  }, [catalogSnapshot])

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
