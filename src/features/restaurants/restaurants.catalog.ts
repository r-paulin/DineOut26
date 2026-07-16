import type {
  RestaurantSlug,
  RestaurantTimedOffer,
} from "@/features/offers/data/restaurantOffers.types"

/** Raster filenames under `public/images/restaurants/` (pass through {@link restaurantImageUrl}). */
export type RestaurantImageFiles = {
  primary: string
  sideTop: string
  sideBottom: string
}

/**
 * Single source of prototype venue facts, contact, tags, about bullets, logos,
 * and timed offers. Consumers build view models (search rows, offer cards, detail).
 */
export type RestaurantCatalogEntry = {
  slug: RestaurantSlug
  name: string
  images: RestaurantImageFiles
  /** Price band for search, detail, and discover cards (en dash). */
  displayPrice: string
  area: string
  rating: string
  reviewSuffix: string
  primaryGrad?: boolean
  /**
   * Short meta line for cards / map / search — Cuisine filter labels only
   * (`CUISINE_OPTIONS`), joined with ` · `.
   */
  tags: string
  tagDescription: string
  /** Ranged windows only — no `{ kind: "all-day" }` in catalog data. */
  timedOffers: RestaurantTimedOffer[]
  phone: string
  address: string
  website: string
  whatWeServe: readonly string[]
  amenities: readonly string[]
  /** Logo filenames under `public/images/restaurants/` — try in order. */
  logoFilenames: readonly string[]
}

const CATALOG: readonly RestaurantCatalogEntry[] = [
  {
    slug: "three-chefs",
    name: "3 Pavāru Restorāns",
    images: {
      primary: "3pavarurestorans1.jpg",
      sideTop: "3pavarurestorans2.jpg",
      sideBottom: "3pavarurestorans3.jpg",
    },
    displayPrice: "35–55 €",
    area: "Old Town",
    rating: "4.8",
    reviewSuffix: "(150+)",
    primaryGrad: true,
    tags: "Local / European",
    tagDescription:
      "Open kitchen · tasting menu · Latvian chefs — chef-driven contemporary format",
    timedOffers: [
      {
        discountPercent: 25,
        window: { kind: "range", start: "18:00", end: "22:00" },
        remainingSpots: 1,
      },
      {
        discountPercent: 15,
        window: { kind: "range", start: "12:00", end: "15:00" },
        remainingSpots: 7,
      },
    ],
    phone: "+371 20 370 537",
    address: "Torņa iela 4, Rīga",
    website: "https://www.3pavari.lv",
    whatWeServe: [
      "Open kitchen",
      "Tasting-format menus",
      "Latvian seasonal produce",
      "Wine pairings",
      "Jēkaba kazarmas setting",
      "Chef-led service",
      "À la carte options",
      "Private events",
      "Local suppliers",
      "Contemporary Latvian cuisine",
    ],
    amenities: [
      "Free Wi-Fi",
      "Card payment",
      "Reservations",
      "Wheelchair accessible",
      "Indoor seating",
      "Air conditioning",
      "Coat check",
      "Children welcome",
      "Vegetarian options",
      "Event catering",
    ],
    logoFilenames: ["3pavarurestorans-logo.png", "three-chefs-logo.png"],
  },
  {
    slug: "neiburgs",
    name: "Neiburgs",
    images: {
      primary: "Neiburgs-1.jpg",
      sideTop: "Neiburgs-2.jpg",
      sideBottom: "Neiburgs-3.jpg",
    },
    displayPrice: "40–65 €",
    area: "Old Town",
    rating: "4.7",
    reviewSuffix: "(200+)",
    primaryGrad: true,
    tags: "Mediterranean · Seafood",
    tagDescription:
      "Michelin Listed · wine pairing · seasonal menu — credibility markers that drive bookings",
    timedOffers: [
      {
        discountPercent: 20,
        window: { kind: "range", start: "19:00", end: "23:00" },
        remainingSpots: 2,
      },
      {
        discountPercent: 15,
        window: { kind: "range", start: "12:00", end: "17:00" },
        remainingSpots: 5,
      },
    ],
    phone: "+371 20 235 504",
    address: "Jauniela 27, Rīga",
    website: "https://www.neiburgs.com",
    whatWeServe: [
      "Mediterranean influences",
      "Wine pairing menus",
      "Seasonal tasting menus",
      "Michelin Guide selection",
      "Seafood focus",
      "Old Town boutique hotel dining",
      "À la carte",
      "Business lunch",
      "Outdoor seating (seasonal)",
      "Reservations recommended",
    ],
    amenities: [
      "Free Wi-Fi",
      "Card payment",
      "Hotel guest access",
      "Reservations",
      "Wheelchair accessible",
      "Indoor seating",
      "Outdoor seating",
      "Air conditioning",
      "Valet (hotel)",
      "Pet-friendly terrace (seasonal)",
    ],
    logoFilenames: ["Neiburgs-logo.png", "neiburgs-logo.png"],
  },
  {
    slug: "melna-bite",
    name: "Melna Bite",
    images: {
      primary: "Melna Bite 1.jpg",
      sideTop: "Melna Bite 2.jpg",
      sideBottom: "Melna Bite 3.jpg",
    },
    displayPrice: "20–35 €",
    area: "Old Town",
    rating: "4.6",
    reviewSuffix: "(300+)",
    primaryGrad: true,
    tags: "Local / European · Café / Brunch",
    tagDescription:
      "Modern Latvian · farm to table — local sourcing with a contemporary twist",
    timedOffers: [
      {
        discountPercent: 30,
        window: { kind: "range", start: "12:00", end: "14:00" },
        remainingSpots: 1,
      },
    ],
    phone: "+371 67 130 675",
    address: "Audēju iela 13, Rīga",
    website: "https://www.melnabite.lv",
    whatWeServe: [
      "Modern Latvian plates",
      "European classics",
      "Centrum hotel restaurant",
      "Brunch and lunch",
      "Seasonal updates",
      "Wine by the glass",
      "Comfortable dining room",
      "Family-friendly",
      "Group tables",
      "Dinner service",
    ],
    amenities: [
      "Free Wi-Fi",
      "Card payment",
      "Hotel lift access",
      "Reservations",
      "Wheelchair accessible",
      "Indoor seating",
      "Air conditioning",
      "SPA hotel combo",
      "Children's menu",
      "Breakfast buffet",
    ],
    logoFilenames: [
      "Melna Bite logo.png",
      "Melna-Bite-logo.png",
      "melna-bite-logo.png",
    ],
  },
  {
    slug: "kolonade",
    name: "Kolonāde",
    images: {
      primary: "kolonade-1.jpg",
      sideTop: "kolonade-2.jpg",
      sideBottom: "kolonade-3.jpg",
    },
    displayPrice: "30–50 €",
    area: "Vērmanes Garden",
    rating: "4.7",
    reviewSuffix: "(180+)",
    primaryGrad: true,
    tags: "Local / European",
    tagDescription:
      "Park terrace · city views · fine dining — the setting is its biggest differentiator",
    timedOffers: [
      {
        discountPercent: 20,
        window: { kind: "range", start: "12:00", end: "14:00" },
        remainingSpots: 1,
      },
      {
        discountPercent: 10,
        window: { kind: "range", start: "17:00", end: "20:00" },
        remainingSpots: 8,
      },
    ],
    phone: "+371 26 608 882",
    address: "Brīvības bulvāris 26, Rīga",
    website: "https://www.kolonade.lv",
    whatWeServe: [
      "Wine-forward dining",
      "Park terrace seating",
      "City and monument views",
      "Seasonal chef's menu",
      "Fine dining format",
      "Champagne and cocktails",
      "Private celebrations",
      "Opera district location",
      "Sommelier picks",
      "Tasting flights",
    ],
    amenities: [
      "Free Wi-Fi",
      "Card payment",
      "Reservations",
      "Terrace seating",
      "Indoor seating",
      "Air conditioning",
      "Private dining",
      "Wheelchair accessible",
      "Coat check",
      "Event hire",
    ],
    logoFilenames: ["Kolonade-logo.png", "kolonade-logo.png"],
  },
  {
    slug: "max-cekot",
    name: "Max Cekot Kitchen",
    images: {
      primary: "max-cekot-1.jpg",
      sideTop: "max-cekot-1.jpg",
      sideBottom: "max-cekot-1.jpg",
    },
    displayPrice: "60–90 €",
    area: "Sarkandaugava",
    rating: "4.9",
    reviewSuffix: "(80+)",
    primaryGrad: true,
    tags: "Local / European",
    tagDescription:
      "Set menu only · chef's table · industrial space — unique format and location",
    timedOffers: [
      {
        discountPercent: 30,
        window: { kind: "range", start: "18:00", end: "21:00" },
        remainingSpots: 1,
      },
    ],
    phone: "+371 20 112 102",
    address: "Jelgavas iela 42/8, Rīga",
    website: "https://www.maxcekot.com",
    whatWeServe: [
      "Michelin-starred tasting",
      "Set-menu experience",
      "Chef's table",
      "Industrial-brick venue",
      "Modern European",
      "Wine programme",
      "Thursday-Saturday dinner",
      "Limited seats",
      "Parking on site",
      "Gift cards",
    ],
    amenities: [
      "Free Wi-Fi",
      "Card payment",
      "Reservations required",
      "Parking",
      "Indoor seating",
      "Air conditioning",
      "Coat check",
      "Wheelchair accessible",
      "Gift vouchers",
      "Sommelier service",
    ],
    logoFilenames: ["max-cekot-logo.png", "Max-cekot-logo.png"],
  },
  {
    slug: "rozengrals",
    name: "Rozengrals",
    images: {
      primary: "Rozengrals-1.jpg",
      sideTop: "Rozengrals-2.jpg",
      sideBottom: "Rozengrals-3.jpg",
    },
    displayPrice: "25–45 €",
    area: "Old Town",
    rating: "4.5",
    reviewSuffix: "(400+)",
    primaryGrad: true,
    tags: "Local / European",
    tagDescription:
      "Medieval vault · historic · traditional — the 1293 vault is the whole experience",
    timedOffers: [
      {
        discountPercent: 10,
        window: { kind: "range", start: "17:00", end: "20:00" },
        remainingSpots: 1,
      },
    ],
    phone: "+371 25 769 877",
    address: "Rozēna iela 1, Rīga",
    website: "https://www.rozengrals.lv",
    whatWeServe: [
      "Medieval-themed halls",
      "Traditional Latvian dishes",
      "Historic wine cellar",
      "Live folk evenings",
      "Group and banquet menus",
      "Old Town vault setting",
      "Honey beer and mead",
      "Medieval feast menus",
      "Tourist-friendly",
      "Late dining",
    ],
    amenities: [
      "Free Wi-Fi",
      "Card payment",
      "Reservations",
      "Indoor seating",
      "Historic building",
      "Group menus",
      "Live music evenings",
      "Coat check",
      "Cellar tours",
      "Late hours",
    ],
    logoFilenames: ["Rozengrals-logo.png", "rozengrals-logo.png"],
  },
]

export const RESTAURANTS_BY_SLUG: Record<RestaurantSlug, RestaurantCatalogEntry> =
  Object.fromEntries(CATALOG.map((e) => [e.slug, e])) as Record<
    RestaurantSlug,
    RestaurantCatalogEntry
  >

/** Curated list order (search, hand-off). */
export const RESTAURANT_CATALOG_ORDER: readonly RestaurantSlug[] = CATALOG.map(
  (e) => e.slug,
)
