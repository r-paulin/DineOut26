/**
 * Static search results: Riga venues (prototype).
 * Photos: `public/images/restaurants/` — raster filenames per venue (see repo).
 * Rows follow merged catalog (admin overrides in localStorage when set).
 */

import { getMergedRestaurantCatalogEntry } from "@/features/restaurants/restaurantCatalogRuntime"
import {
  RESTAURANT_CATALOG_ORDER,
} from "@/features/restaurants/restaurants.catalog"
import { restaurantImageUrl } from "@/shared/utils/publicImageUrls"

export type SearchResultRigaRow = {
  id: string
  /** Joins map / offers / time filter (`three-chefs`, `neiburgs`, …). */
  restaurantSlug: string
  name: string
  primaryImage: string
  sideTop: string
  sideBottom: string
  displayPrice: string
  area: string
  /** Tag line under meta (from catalog `tags`). */
  cuisine: string
  /** Richer pitch from venue profile (tooltip / future detail). */
  tagDescription?: string
  rating: string
  reviewSuffix: string
  primaryGrad?: boolean
}

function rowForSlug(slug: (typeof RESTAURANT_CATALOG_ORDER)[number]): SearchResultRigaRow {
  const e = getMergedRestaurantCatalogEntry(slug)!
  return {
    id: slug,
    restaurantSlug: slug,
    name: e.name,
    primaryImage: restaurantImageUrl(e.images.primary),
    sideTop: restaurantImageUrl(e.images.sideTop),
    sideBottom: restaurantImageUrl(e.images.sideBottom),
    displayPrice: e.displayPrice,
    area: e.area,
    cuisine: e.tags,
    tagDescription: e.tagDescription,
    rating: e.rating,
    reviewSuffix: e.reviewSuffix,
    primaryGrad: e.primaryGrad,
  }
}

/** Six Riga restaurants (order follows {@link RESTAURANT_CATALOG_ORDER}). */
export function getSearchResultsRiga(): SearchResultRigaRow[] {
  return RESTAURANT_CATALOG_ORDER.map(rowForSlug)
}
