import { Typography } from "@bolteu/kalep-react"
import { useCallback, useState } from "react"
import { OfferCardListRatingStar } from "@/features/offers/components/OfferCardListRatingStar"
import { RestaurantMenuGalleryModal } from "@/features/restaurant/components/RestaurantMenuGalleryModal"
import { AccordionRow } from "./AccordionRow"
import type { RestaurantAboutProps } from "./restaurantAbout.types"
import { CardDivider } from "@/shared/components/CardDivider"
import { RestaurantGallery } from "./RestaurantGallery"
import { useRestaurantAbout } from "./useRestaurantAbout"
import { VenueInfoRows } from "./VenueInfoRow"

const DISCLAIMER_P1 =
  "Information about this venue is provided by the restaurant and third parties. We do not guarantee accuracy, completeness, or availability."

const DISCLAIMER_P2 =
  "Offers, menus, and opening hours may change without notice. Always confirm details with the venue before visiting."

/**
 * Full “About” stack (Figma Consumer Dine-out `15886:44839`): name + meta in body,
 * gallery, venue rows, copy, accordions. Back / share chrome lives in
 * {@link RestaurantDetailScreen}.
 */
export function RestaurantAbout({
  restaurant,
  showDisclaimer = true,
  onOpenExternalUrl,
  galleryPortalContainer,
  onOpenReviews,
  onOpenPriceInfo,
  onOpenHours,
  onOpenMenuGallery,
}: RestaurantAboutProps) {
  const { openAccordion, toggleAccordion } = useRestaurantAbout()
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const openExternalUrl = useCallback(
    (url: string) => {
      const fn =
        onOpenExternalUrl ??
        ((u: string) => {
          window.open(u, "_blank", "noopener,noreferrer")
        })
      fn(url)
    },
    [onOpenExternalUrl],
  )

  const openGalleryAt = useCallback((index: number) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }, [])

  const ratingLabel = restaurant.rating.toFixed(1)
  const reviewsParen = `(${restaurant.reviewCount.toLocaleString()} reviews)`
  const menuRowValue = restaurant.menuRowValue ?? "Restaurant menu"

  const ratingBadge = onOpenReviews ? (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-left outline-none ring-inset ring-action-primary focus-visible:ring-2"
      onClick={onOpenReviews}
      aria-label={`Rating ${ratingLabel}, ${reviewsParen}`}
    >
      <OfferCardListRatingStar />
      <Typography variant="body-s-accent" color="primary" as="span" inline>
        {ratingLabel}
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="span" inline>
        {reviewsParen}
      </Typography>
    </button>
  ) : (
    <span className="inline-flex items-center gap-1">
      <OfferCardListRatingStar />
      <Typography variant="body-s-accent" color="primary" as="span" inline>
        {ratingLabel}
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="span" inline>
        {reviewsParen}
      </Typography>
    </span>
  )

  const priceEl = onOpenPriceInfo ? (
    <button
      type="button"
      className="cursor-pointer border-0 bg-transparent p-0 text-left outline-none ring-inset ring-action-primary focus-visible:ring-2"
      onClick={onOpenPriceInfo}
      aria-label={`Price range ${restaurant.priceRange} per person`}
    >
      <Typography variant="body-s-regular" color="primary" as="span" inline>
        {restaurant.priceRange}
      </Typography>
    </button>
  ) : (
    <Typography variant="body-s-regular" color="primary" as="span" inline>
      {restaurant.priceRange}
    </Typography>
  )

  return (
    <section className="flex w-full flex-col bg-layer-floor-1">
      <div className="flex w-full min-w-0 flex-col gap-0.5 px-4 py-3">
        <div className="min-w-0 max-w-full" title={restaurant.name}>
          <Typography
            variant="heading-m-accent"
            color="primary"
            as="h1"
            noWrap
          >
            {restaurant.name}
          </Typography>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-1 pb-1 pt-0">
          {ratingBadge}
          <Typography variant="body-s-regular" color="tertiary" as="span" inline>
            ·
          </Typography>
          {priceEl}
        </div>
      </div>

      <div className="min-w-0 px-4 pb-3">
        <RestaurantGallery
          images={restaurant.images}
          onSelectIndex={openGalleryAt}
          onMorePress={() => {
            openGalleryAt(0)
          }}
        />
      </div>

      <div className="pt-2">
        <VenueInfoRows
          isOpenNow={restaurant.isOpenNow}
          openingHours={restaurant.openingHours}
          menuUrl={restaurant.menuUrl}
          menuRowValue={menuRowValue}
          address={restaurant.address}
          phone={restaurant.phone}
          website={restaurant.website}
          openExternalUrl={openExternalUrl}
          onOpenHours={onOpenHours}
          onOpenMenuGallery={onOpenMenuGallery}
        />
      </div>

      <CardDivider />

      <div className="px-6 pt-6 pb-4">
        <Typography
          variant="heading-xs-accent"
          color="primary"
          as="h2"
          inlineStyle={{
            fontVariationSettings:
              "'wght' var(--font-weight-bold), 'opsz' 20",
          }}
        >
          About us
        </Typography>
        <p className="m-0 mt-2">
          <Typography variant="body-s-regular" color="secondary" as="span">
            {restaurant.description}
          </Typography>
        </p>
      </div>

      <AccordionRow
        title="Service types"
        expanded={openAccordion === "serviceTypes"}
        onToggle={() => {
          toggleAccordion("serviceTypes")
        }}
        variant="bullets"
        bulletItems={restaurant.serviceTypes}
      />
      <AccordionRow
        title="What we serve"
        expanded={openAccordion === "whatWeServe"}
        onToggle={() => {
          toggleAccordion("whatWeServe")
        }}
        variant="bullets"
        bulletItems={restaurant.whatWeServe}
      />
      <AccordionRow
        title="Amenities"
        expanded={openAccordion === "amenities"}
        onToggle={() => {
          toggleAccordion("amenities")
        }}
        variant="bullets"
        bulletItems={restaurant.amenities}
      />
      <AccordionRow
        title="Other details"
        expanded={openAccordion === "otherDetails"}
        onToggle={() => {
          toggleAccordion("otherDetails")
        }}
        variant="keyValue"
        keyValueRows={restaurant.otherDetails}
      />

      {showDisclaimer ? (
        <footer className="flex flex-col gap-2 bg-layer-floor-0-grouped px-6 pt-6 pb-[32px]">
          <Typography variant="body-s-accent" color="secondary" as="h3">
            Notices and Disclaimers
          </Typography>
          <Typography variant="body-s-regular" color="secondary" as="p">
            {DISCLAIMER_P1}
          </Typography>
          <Typography variant="body-s-regular" color="secondary" as="p">
            {DISCLAIMER_P2}
          </Typography>
          <Typography variant="body-s-regular" color="secondary" as="div">
            See our{" "}
            <button
              type="button"
              className="inline cursor-pointer border-0 bg-transparent p-0 underline decoration-solid text-action-primary"
              onClick={() => {
                openExternalUrl("https://example.com/terms")
              }}
            >
              Terms and Conditions
            </button>
            .
          </Typography>
        </footer>
      ) : null}

      <RestaurantMenuGalleryModal
        isOpen={galleryOpen}
        onOpenChange={setGalleryOpen}
        imageUrls={restaurant.images}
        ariaLabel={`Photos of ${restaurant.name}`}
        initialSlideIndex={galleryIndex}
        imageObjectFit="cover"
        container={galleryPortalContainer}
      />
    </section>
  )
}
