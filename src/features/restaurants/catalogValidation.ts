import type {
  RestaurantSlug,
  RestaurantTimedOffer,
  TimedOfferWindow,
} from "@/features/offers/data/restaurantOffers.types"
import type { RestaurantCatalogEntry } from "./restaurants.catalog"
import { RESTAURANTS_BY_SLUG } from "./restaurants.catalog"

function isTimedOfferWindow(v: unknown): v is TimedOfferWindow {
  if (!v || typeof v !== "object") return false
  const o = v as { kind?: unknown }
  if (o.kind === "all-day") return true
  if (o.kind === "range") {
    const r = v as { start?: unknown; end?: unknown }
    return typeof r.start === "string" && typeof r.end === "string"
  }
  return false
}

function isTimedOffer(v: unknown): v is RestaurantTimedOffer {
  if (!v || typeof v !== "object") return false
  const o = v as { discountPercent?: unknown; window?: unknown }
  return (
    typeof o.discountPercent === "number" &&
    Number.isFinite(o.discountPercent) &&
    isTimedOfferWindow(o.window)
  )
}

/**
 * Parse `timedOffers` from admin JSON textarea.
 */
export function parseTimedOffersFromJson(
  json: string,
): { ok: true; value: RestaurantTimedOffer[] } | { ok: false; error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(json) as unknown
  } catch {
    return { ok: false, error: "Invalid JSON" }
  }
  if (!Array.isArray(parsed)) {
    return { ok: false, error: "Expected an array of offers" }
  }
  const out: RestaurantTimedOffer[] = []
  for (let i = 0; i < parsed.length; i += 1) {
    const row = parsed[i]
    if (!isTimedOffer(row)) {
      return { ok: false, error: `Invalid offer at index ${i}` }
    }
    const spots = (row as { remainingSpots?: unknown }).remainingSpots
    if (
      spots !== undefined &&
      (typeof spots !== "number" || !Number.isFinite(spots))
    ) {
      return { ok: false, error: `Invalid remainingSpots at index ${i}` }
    }
    out.push({
      discountPercent: row.discountPercent,
      window: row.window,
      remainingSpots:
        typeof spots === "number" ? Math.round(spots) : undefined,
    })
  }
  return { ok: true, value: out }
}

function linesToList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

function splitLogoFilenames(text: string): string[] {
  const byComma = text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (byComma.length > 1) return byComma
  return linesToList(text)
}

export type BuildEntryFromFormInput = {
  slug: RestaurantSlug
  name: string
  displayPrice: string
  area: string
  rating: string
  reviewSuffix: string
  tags: string
  tagDescription: string
  phone: string
  address: string
  website: string
  imagesPrimary: string
  imagesSideTop: string
  imagesSideBottom: string
  logoFilenamesText: string
  whatWeServeText: string
  amenitiesText: string
  timedOffersJson: string
  primaryGrad: boolean
}

export function buildEntryFromForm(
  input: BuildEntryFromFormInput,
):
  | { ok: true; entry: RestaurantCatalogEntry }
  | { ok: false; error: string } {
  const base = RESTAURANTS_BY_SLUG[input.slug]
  if (!base) return { ok: false, error: "Unknown slug" }

  const timed = parseTimedOffersFromJson(input.timedOffersJson.trim())
  if (!timed.ok) return timed

  const whatWeServe = linesToList(input.whatWeServeText)
  const amenities = linesToList(input.amenitiesText)
  const logoFilenames = splitLogoFilenames(input.logoFilenamesText)

  if (whatWeServe.length < 1) {
    return { ok: false, error: "Add at least one “What we serve” line" }
  }
  if (amenities.length < 1) {
    return { ok: false, error: "Add at least one amenity line" }
  }
  if (logoFilenames.length < 1) {
    return { ok: false, error: "Add at least one logo filename" }
  }

  const name = input.name.trim()
  if (!name) return { ok: false, error: "Name is required" }

  return {
    ok: true,
    entry: {
      slug: input.slug,
      name,
      images: {
        primary: input.imagesPrimary.trim(),
        sideTop: input.imagesSideTop.trim(),
        sideBottom: input.imagesSideBottom.trim(),
      },
      displayPrice: input.displayPrice.trim(),
      area: input.area.trim(),
      rating: input.rating.trim(),
      reviewSuffix: input.reviewSuffix.trim(),
      primaryGrad: input.primaryGrad,
      tags: input.tags.trim(),
      tagDescription: input.tagDescription.trim(),
      timedOffers: timed.value,
      phone: input.phone.trim(),
      address: input.address.trim(),
      website: input.website.trim(),
      whatWeServe,
      amenities,
      logoFilenames,
    },
  }
}
