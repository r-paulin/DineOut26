export interface RestaurantAboutRestaurant {
  name: string
  rating: number
  reviewCount: number
  priceRange: string
  /** At least four image URLs for the mosaic + gallery modal. */
  images: string[]
  isOpenNow: boolean
  openingHours: string
  menuUrl: string
  /** Second line on the menu row; defaults to “Restaurant menu” in the screen. */
  menuRowValue?: string
  address: string
  phone: string
  website: string
  description: string
  serviceTypes: string[]
  whatWeServe: string[]
  amenities: string[]
  otherDetails: { label: string; value: string }[]
}

export interface RestaurantAboutProps {
  restaurant: RestaurantAboutRestaurant
  showDisclaimer?: boolean
  /** Opens http(s) URLs (menu, website). Defaults to a new tab in the web shell. */
  onOpenExternalUrl?: (url: string) => void
  /** Portal target for the fullscreen photo gallery (e.g. device shell root). */
  galleryPortalContainer?: HTMLElement | null
  /** Opens the ratings sources bottom sheet (star + score + reviews row). */
  onOpenReviews?: () => void
  /** Opens the opening-hours bottom sheet (venue hours row). */
  onOpenHours?: () => void
  /** Opens the fullscreen menu photo gallery (menu row); when omitted, menu row opens `menuUrl` externally. */
  onOpenMenuGallery?: () => void
  /** Opens price info / menu gallery (same as detail stats price column). */
  onOpenPriceInfo?: () => void
}
