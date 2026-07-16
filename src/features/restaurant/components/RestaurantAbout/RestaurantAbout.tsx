import { Typography } from "@bolteu/kalep-react"
import { useCallback, useMemo } from "react"
import { OfferCardListRatingStar } from "@/features/offers/components/OfferCardListRatingStar"
import { AccordionRow } from "./AccordionRow"
import { RestaurantGallery } from "./RestaurantGallery"
import type { RestaurantAboutProps } from "./restaurantAbout.types"
import {
  CardDivider,
  CARD_DIVIDER_GROOVE_BG_CLASS,
  CARD_DIVIDER_SECTION_LAST_CLASS,
} from "@/shared/components/CardDivider"
import { useRestaurantAbout } from "./useRestaurantAbout"
import { VenueInfoRows } from "./VenueInfoRow"

const FONT_FEAT = "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

/** Figma `19444:48926` — Heading M Accent name. */
const ABOUT_NAME_STYLE = {
  letterSpacing: "-0.616px",
  fontFeatureSettings: FONT_FEAT,
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

/** Figma Heading XS / XS Accent (`15886:38896`) — About us section title. */
const ABOUT_SECTION_HEADING_STYLE = {
  fontSize: "var(--Heading-XS-font-size, 20px)",
  lineHeight: "var(--Heading-XS-line-height, 25px)",
  letterSpacing: "-0.34px",
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

const DISCLAIMER_P1 =
  "The partner commits to only offer products that comply with the applicable rules of European Union law. All partners on the DineOut platform shall be considered traders within the meaning of Directive (EU) 2005/29."

const DISCLAIMER_P2 =
  "Partners are responsible for the sale of goods and services at the venue. DineOut is a provider of information society services (the DineOut app) only."

/**
 * Full “About” / Location stack — Figma `19444:49647` / `19444:49649`.
 * Header (name + rating + 271 gallery) is flush under the overlay nav.
 * Back / share chrome lives in {@link RestaurantDetailScreen}.
 */
export function RestaurantAbout({
  restaurant,
  venueGalleryCycles,
  showDisclaimer = true,
  onOpenExternalUrl,
  onOpenReviews,
  onOpenPriceInfo,
  onOpenHours,
  onOpenMenuGallery,
  onOpenAddress,
}: RestaurantAboutProps) {
  const { openAccordion, toggleAccordion } = useRestaurantAbout()

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

  const galleryImages = useMemo(() => {
    const fromAbout = restaurant.images.filter(Boolean)
    const fromCycles = venueGalleryCycles.flatMap((c) => [
      c.tall,
      c.top,
      c.bottom,
    ])
    const seen = new Set<string>()
    const merged: string[] = []
    for (const src of [...fromAbout, ...fromCycles]) {
      if (!src || seen.has(src)) continue
      seen.add(src)
      merged.push(src)
    }
    return merged.length >= 3 ? merged : fromAbout
  }, [restaurant.images, venueGalleryCycles])

  const ratingLabel = restaurant.rating.toFixed(1)
  const reviewsParen = `(${restaurant.reviewCount.toLocaleString()} reviews)`

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
    <section className={`flex w-full flex-col ${CARD_DIVIDER_GROOVE_BG_CLASS}`}>
      {/* Figma: continuous floor-1 from nav through venue rows (no top radius). */}
      <div className="flex w-full flex-col bg-layer-floor-1">
        <div className="flex w-full min-w-0 flex-col gap-0.5 px-6 py-3">
          <div className="min-w-0 max-w-full" title={restaurant.name}>
            <Typography
              variant="heading-m-accent"
              color="primary"
              as="h1"
              noWrap
              inlineStyle={ABOUT_NAME_STYLE}
            >
              {restaurant.name}
            </Typography>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-1 pb-1 pt-0">
            {ratingBadge}
            <Typography
              variant="body-s-regular"
              color="tertiary"
              as="span"
              inline
            >
              ·
            </Typography>
            {priceEl}
          </div>
        </div>

        <div className="w-full px-6 pb-3">
          <RestaurantGallery
            images={galleryImages}
            onSelectIndex={() => {
              onOpenMenuGallery?.()
            }}
            onMorePress={() => {
              onOpenMenuGallery?.()
            }}
          />
        </div>

        <div className="pb-3">
          <VenueInfoRows
            isOpenNow={restaurant.isOpenNow}
            hoursRowSubtitle={restaurant.hoursRowSubtitle}
            menuUrl={restaurant.menuUrl}
            address={restaurant.address}
            phone={restaurant.phone}
            website={restaurant.website}
            openExternalUrl={openExternalUrl}
            onOpenHours={onOpenHours}
            onOpenMenuGallery={onOpenMenuGallery}
            onOpenAddress={onOpenAddress}
            reserveUrl={restaurant.reserveUrl}
            instagramUrl={restaurant.instagramUrl}
            tiktokUrl={restaurant.tiktokUrl}
            facebookUrl={restaurant.facebookUrl}
          />
        </div>
      </div>

      <CardDivider />

      <div className={CARD_DIVIDER_SECTION_LAST_CLASS}>
        <div className="px-6 pb-4 pt-6">
          <Typography
            variant="heading-xs-accent"
            color="primary"
            as="h2"
            inlineStyle={ABOUT_SECTION_HEADING_STYLE}
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

        {showDisclaimer ?
          <footer className="flex flex-col gap-2 bg-layer-floor-0-grouped px-6 pb-[max(0.75rem,var(--safe-area-bottom))] pt-6">
            <Typography variant="body-s-accent" color="secondary" as="h3">
              Notices and Disclaimers
            </Typography>
            <Typography variant="body-s-regular" color="secondary" as="p">
              {DISCLAIMER_P1}
            </Typography>
            <Typography variant="body-s-regular" color="secondary" as="p">
              {DISCLAIMER_P2}
            </Typography>
            <Typography variant="body-s-regular" color="secondary" as="p">
              Further details can be found in our{" "}
              <button
                type="button"
                className="inline cursor-pointer border-0 bg-transparent p-0 text-action-primary underline decoration-solid"
                onClick={() => {
                  openExternalUrl("https://example.com/terms")
                }}
              >
                Terms and Conditions
              </button>
              .
            </Typography>
          </footer>
        : null}
      </div>
    </section>
  )
}
