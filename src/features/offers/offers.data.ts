import type { RestaurantSlug } from "@/features/offers/data/restaurantOffers.types"
import { getMergedRestaurantCatalogEntry } from "@/features/restaurants/restaurantCatalogRuntime"
import type { RestaurantCatalogEntry } from "@/features/restaurants/restaurants.catalog"
import { restaurantImageUrl } from "@/shared/utils/publicImageUrls"
import { withRestaurantTags } from "./data/restaurantTagProfiles"
import type { OfferCardModel } from "./offers.types"
import { computeOfferCardCampaignForSlug } from "./utils/offerCampaign"

function u(filename: string): string {
  return restaurantImageUrl(filename)
}

type ImgSlot = keyof RestaurantCatalogEntry["images"]

function slotUrl(slug: RestaurantSlug, slot: ImgSlot): string {
  const r = getMergedRestaurantCatalogEntry(slug)
  if (!r) return u("")
  return u(r.images[slot])
}

function campaignFor(slug: string) {
  return computeOfferCardCampaignForSlug(slug)
}

function discoverRow(
  id: string,
  slug: RestaurantSlug,
  imageSlot: ImgSlot,
): OfferCardModel {
  const r = getMergedRestaurantCatalogEntry(slug)!
  return {
    id,
    restaurantSlug: slug,
    name: r.name,
    priceRange: r.displayPrice,
    area: r.area,
    cuisine: "",
    rating: r.rating,
    reviewCount: r.reviewSuffix,
    image: slotUrl(slug, imageSlot),
    campaign: campaignFor(slug),
  }
}

export function getOffersToday(): OfferCardModel[] {
  return [
    discoverRow("neiburgs", "neiburgs", "primary"),
    discoverRow("three-chefs", "three-chefs", "primary"),
    discoverRow("melna-bite", "melna-bite", "primary"),
    discoverRow("kolonade-today", "kolonade", "primary"),
  ].map(withRestaurantTags)
}

export function getOffersDinner(): OfferCardModel[] {
  return [
    discoverRow("rozengrals", "rozengrals", "primary"),
    discoverRow("neiburgs-dinner", "neiburgs", "sideTop"),
    discoverRow("melna-bite-dinner", "melna-bite", "sideTop"),
    discoverRow("max-cekot", "max-cekot", "primary"),
    discoverRow("kolonade-dinner", "kolonade", "sideTop"),
  ].map(withRestaurantTags)
}

/** Horizontal carousel under “Near you”. */
export function getOffersNearYou(): OfferCardModel[] {
  return [
    discoverRow("near-melna", "melna-bite", "primary"),
    discoverRow("near-chefs", "three-chefs", "primary"),
    discoverRow("near-max", "max-cekot", "primary"),
    discoverRow("near-kolonade", "kolonade", "sideBottom"),
  ].map(withRestaurantTags)
}

function xlRow(
  id: string,
  slug: RestaurantSlug,
  galleryFiles: string[],
  extra?: Partial<Pick<OfferCardModel, "closesAt" | "isOpen">>,
): OfferCardModel {
  const r = getMergedRestaurantCatalogEntry(slug)!
  return {
    id,
    restaurantSlug: slug,
    name: r.name,
    priceRange: r.displayPrice,
    area: r.area,
    cuisine: "",
    rating: r.rating,
    image: slotUrl(slug, "primary"),
    galleryImages: galleryFiles.map(u),
    reviewCount: r.reviewSuffix,
    layout: "list",
    ...extra,
    campaign: campaignFor(slug),
  }
}

/** Vertical list under “All restaurants” (XL layout). */
export function getOffersAllRestaurants(): OfferCardModel[] {
  return (
    [
      xlRow(
        "xl-neiburgs",
        "neiburgs",
        [
          "Neiburgs-1.jpg",
          "Neiburgs-2.jpg",
          "Rozengrals-1.jpg",
          "Melna Bite 1.jpg",
        ],
        { closesAt: "21:00" },
      ),
      xlRow("xl-rozengrals", "rozengrals", [
        "Rozengrals-1.jpg",
        "Neiburgs-1.jpg",
        "Neiburgs-2.jpg",
        "Melna Bite 2.jpg",
      ]),
      xlRow(
        "xl-melna",
        "melna-bite",
        [
          "Melna Bite 1.jpg",
          "Melna Bite 2.jpg",
          "max-cekot-1.jpg",
          "Neiburgs-2.jpg",
        ],
        { isOpen: false },
      ),
      xlRow("xl-chefs", "three-chefs", [
        "3pavarurestorans1.jpg",
        "Neiburgs-2.jpg",
        "Melna Bite 1.jpg",
        "Rozengrals-1.jpg",
      ]),
      xlRow("xl-kolonade", "kolonade", [
        "kolonade-1.jpg",
        "kolonade-2.jpg",
        "kolonade-3.jpg",
        "Neiburgs-1.jpg",
      ]),
      xlRow("xl-max-cekot", "max-cekot", [
        "max-cekot-1.jpg",
        "Melna Bite 2.jpg",
        "Neiburgs-2.jpg",
        "Rozengrals-1.jpg",
      ]),
    ] satisfies OfferCardModel[]
  ).map(withRestaurantTags)
}
