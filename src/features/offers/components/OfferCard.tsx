import { useRef, useState, type KeyboardEvent } from "react"
import { Typography } from "@bolteu/kalep-react"
import Heart from "@bolteu/kalep-react-icons/dist/Heart"
import HeartOutlined from "@bolteu/kalep-react-icons/dist/HeartOutlined"
import type { OfferCardModel } from "@/features/offers/offers.types"
import type { DateValue } from "@/features/search/filters.types"
import { useSnackbar } from "@/shared/snackbar"
import { OfferCardBadges } from "./OfferCardBadges"
import { OfferCardImageRatingBadge } from "./OfferCardImageRatingBadge"
import { OfferCardListGallery } from "./OfferCardListGallery"
import { OfferCardListRatingStar } from "./OfferCardListRatingStar"

export interface OfferCardProps {
  offer: OfferCardModel
  dimmed?: boolean
  onClick?: () => void
  selectedDate?: DateValue
  liveNowFilter?: boolean
}

const R8 = "rounded-[8px]"

/** Figma `_Place / Card / List` (`18904:45034`): 224px wide, 158px hero. */
const CAROUSEL_CARD_W_CLASS = "w-[224px]"
const CAROUSEL_IMAGE_H_CLASS = "h-[158px]"

const IMAGE_GRAD =
  "linear-gradient(180deg, rgba(0,0,0,0) 53.5%, rgba(0,0,0,0.5) 100%)"

/**
 * Figma `_Place / Card / XS` carousel 15767:53166 (224px) or `_Place / Card / XL` (list row).
 * Image corners: 12px ([Figma XL](https://www.figma.com/design/jPi3dvsMn6oKCqkvNDhyhe/Consumer---Dine-out?node-id=15735-22235)).
 */
export function OfferCard({
  offer,
  dimmed,
  onClick,
  selectedDate = "today",
  liveNowFilter,
}: OfferCardProps) {
  if (offer.layout === "list") {
    return (
      <OfferCardList
        offer={offer}
        dimmed={dimmed}
        onClick={onClick}
        selectedDate={selectedDate}
        liveNowFilter={liveNowFilter}
      />
    )
  }
  return (
    <OfferCardCarousel
      offer={offer}
      dimmed={dimmed}
      onClick={onClick}
      selectedDate={selectedDate}
      liveNowFilter={liveNowFilter}
    />
  )
}

function offerCardCarouselAriaLabel(offer: OfferCardModel): string {
  const parts = [offer.name]
  if (offer.campaign.discountLabel) parts.push(offer.campaign.discountLabel)
  const reviewCount = offer.reviewCount?.trim().replace(/^\(|\)$/g, "")
  if (reviewCount) {
    parts.push(`${offer.rating}, ${reviewCount} reviews`)
  } else {
    parts.push(offer.rating)
  }
  parts.push(`${offer.priceRange}, ${offer.area}`)
  return parts.join(". ")
}

function OfferCardCarousel({
  offer,
  dimmed,
  onClick,
  selectedDate = "today",
  liveNowFilter,
}: {
  offer: OfferCardModel
  dimmed?: boolean
  onClick?: () => void
  selectedDate?: DateValue
  liveNowFilter?: boolean
}) {
  const snackbar = useSnackbar()
  const [favorite, setFavorite] = useState(false)
  const lastSnackbarIdRef = useRef<string | number | null>(null)

  return (
    <article
      className={`${CAROUSEL_CARD_W_CLASS} flex-none relative`}
      style={{ opacity: dimmed ? 0.45 : 1 }}
    >
      <button
        type="button"
        aria-label={offerCardCarouselAriaLabel(offer)}
        className={`relative ${CAROUSEL_CARD_W_CLASS} ${CAROUSEL_IMAGE_H_CLASS} ${R8} overflow-hidden border-none p-0 cursor-pointer`}
        onClick={onClick}
      >
        <img
          src={offer.image}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover block"
        />
        <div
          className={`absolute inset-0 ${R8} pointer-events-none`}
          style={{ background: IMAGE_GRAD }}
        />
        <div className="absolute left-2 top-2 z-[1] flex max-w-[calc(100%-2.5rem)] flex-col items-start gap-1">
          <OfferCardBadges
            campaign={offer.campaign}
            restaurantSlug={offer.restaurantSlug ?? offer.id}
            density="hero-dark"
            selectedDate={selectedDate}
            liveNowFilter={liveNowFilter}
          />
        </div>
        <button
          type="button"
          className="absolute right-2 top-2 z-[2] inline-flex size-4 items-center justify-center border-none bg-transparent p-0 text-primary-inverted drop-shadow-[0_0.1rem_0.15rem_rgba(0,0,0,0.16)]"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          onClick={(e) => {
            e.stopPropagation()
            setFavorite((prev) => {
              const next = !prev
              if (lastSnackbarIdRef.current != null) {
                snackbar.remove(lastSnackbarIdRef.current)
              }
              const id = snackbar.add({
                description: next ? "Added to favorites." : "Favorite removed",
                timeout: 3000,
              })
              lastSnackbarIdRef.current = id
              return next
            })
          }}
        >
          {favorite ?
            <Heart size="sm" aria-hidden />
          : <HeartOutlined size="sm" aria-hidden />}
        </button>
        <OfferCardImageRatingBadge
          rating={offer.rating}
          reviewCount={offer.reviewCount}
        />
      </button>
      <div className="mt-2 flex w-full flex-col gap-0.5">
        <Typography
          variant="body-m-accent"
          color="primary"
          noWrap
          inlineStyle={{
            lineHeight: "20px",
            letterSpacing: "-0.176px",
            fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
          }}
        >
          {offer.name}
        </Typography>
        <div className="ffeature flex items-center gap-1 text-xs leading-4">
          <Typography variant="body-xs-regular" color="primary" as="span">
            {offer.priceRange}
          </Typography>
          <Typography
            variant="body-xs-accent"
            color="tertiary"
            as="span"
            aria-hidden
          >
            ·
          </Typography>
          <Typography variant="body-xs-regular" color="primary" as="span">
            {offer.area}
          </Typography>
        </div>
        <span
          className="min-w-0"
          title={offer.tagDescription}
        >
          <Typography variant="body-xs-regular" color="secondary">
            {offer.cuisine}
          </Typography>
        </span>
      </div>
    </article>
  )
}

function OfferCardList({
  offer,
  dimmed,
  onClick,
  selectedDate = "today",
  liveNowFilter,
}: {
  offer: OfferCardModel
  dimmed?: boolean
  onClick?: () => void
  selectedDate?: DateValue
  liveNowFilter?: boolean
}) {
  const slides =
    offer.galleryImages && offer.galleryImages.length > 0
      ? offer.galleryImages
      : [offer.image]

  const keyHandler = (e: KeyboardEvent) => {
    if (!onClick) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <article
      className={`flex min-w-0 w-full flex-col gap-2 overflow-x-visible pb-6 ${
        onClick ? "cursor-pointer" : ""
      }`}
      style={{ opacity: dimmed ? 0.45 : 1 }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? keyHandler : undefined}
    >
      {/*
        XL gallery uses the same horizontal scroll row as sheet carousels
        (`BottomSheetScrollContent`). Figma `_Place / Card / XL` (15735:22235):
        8px gap gallery→copy; 24px pb.
      */}
      <OfferCardListGallery
        photos={slides}
        campaign={offer.campaign}
        restaurantSlug={offer.restaurantSlug ?? offer.id}
        selectedDate={selectedDate}
        liveNowFilter={liveNowFilter}
      />
      <div className="flex min-w-0 w-full flex-col gap-0.5">
        <Typography
          variant="heading-s-accent"
          color="primary"
          noWrap
          inlineStyle={{ letterSpacing: "-0.03rem" }}
        >
          {offer.name}
        </Typography>
        <div className="flex flex-wrap items-center gap-1 text-sm leading-5">
          <OfferCardListRatingStar />
          <Typography variant="body-s-accent" color="primary" as="span">
            {offer.rating}
          </Typography>
          {offer.reviewCount ? (
            <Typography variant="body-s-regular" color="secondary" as="span">
              {offer.reviewCount}
            </Typography>
          ) : null}
          <Typography variant="body-s-regular" color="tertiary" as="span">
            ·
          </Typography>
          <Typography variant="body-s-regular" color="primary" as="span">
            {offer.priceRange}
          </Typography>
          <Typography variant="body-s-regular" color="tertiary" as="span">
            ·
          </Typography>
          <Typography variant="body-s-regular" color="primary" as="span">
            {offer.area}
          </Typography>
        </div>
        <span
          className="min-w-0"
          title={offer.tagDescription}
        >
          <Typography variant="body-xs-regular" color="secondary">
            {offer.cuisine}
          </Typography>
        </span>
      </div>
    </article>
  )
}

