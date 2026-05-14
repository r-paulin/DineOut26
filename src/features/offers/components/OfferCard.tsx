import type { KeyboardEvent } from "react"
import { Typography } from "@bolteu/kalep-react"
import type { OfferCardModel } from "@/features/offers/offers.types"
import { OfferCardBadges } from "./OfferCardBadges"
import { OfferCardImageRatingBadge } from "./OfferCardImageRatingBadge"
import { OfferCardListGallery } from "./OfferCardListGallery"
import { OfferCardListRatingStar } from "./OfferCardListRatingStar"

export interface OfferCardProps {
  offer: OfferCardModel
  dimmed?: boolean
  onClick?: () => void
}

const R12 = "rounded-[12px]"

/** Figma `_Place / Card / XS` (15767:53166): 224px wide; image height keeps 188:158 aspect. */
const CAROUSEL_CARD_W_CLASS = "w-[224px]"
const CAROUSEL_IMAGE_H_CLASS = "h-[188px]"

const IMAGE_GRAD =
  "linear-gradient(180deg, rgba(0,0,0,0) 53.5%, rgba(0,0,0,0.5) 100%)"

/**
 * Figma `_Place / Card / XS` carousel 15767:53166 (224px) or `_Place / Card / XL` (list row).
 * Image corners: 12px ([Figma XL](https://www.figma.com/design/jPi3dvsMn6oKCqkvNDhyhe/Consumer---Dine-out?node-id=15735-22235)).
 */
export function OfferCard({ offer, dimmed, onClick }: OfferCardProps) {
  if (offer.layout === "list") {
    return <OfferCardList offer={offer} dimmed={dimmed} onClick={onClick} />
  }
  return (
    <OfferCardCarousel offer={offer} dimmed={dimmed} onClick={onClick} />
  )
}

function offerCardCarouselAriaLabel(offer: OfferCardModel): string {
  const parts = [offer.name]
  if (offer.campaign.discountLabel) parts.push(offer.campaign.discountLabel)
  parts.push(`${offer.priceRange}, ${offer.area}`)
  return parts.join(". ")
}

function OfferCardCarousel({
  offer,
  dimmed,
  onClick,
}: {
  offer: OfferCardModel
  dimmed?: boolean
  onClick?: () => void
}) {
  return (
    <article
      className={`${CAROUSEL_CARD_W_CLASS} flex-none relative`}
      style={{ opacity: dimmed ? 0.45 : 1 }}
    >
      <button
        type="button"
        aria-label={offerCardCarouselAriaLabel(offer)}
        className={`relative ${CAROUSEL_CARD_W_CLASS} ${CAROUSEL_IMAGE_H_CLASS} ${R12} overflow-hidden border-none p-0 cursor-pointer`}
        onClick={onClick}
      >
        <img
          src={offer.image}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover block"
        />
        <div
          className={`absolute inset-0 ${R12} pointer-events-none`}
          style={{ background: IMAGE_GRAD }}
        />
        <div className="absolute left-0 top-0 p-2 flex flex-col items-start">
          <OfferCardBadges
            campaign={offer.campaign}
            restaurantSlug={offer.restaurantSlug ?? offer.id}
          />
        </div>
        <OfferCardImageRatingBadge rating={offer.rating} />
      </button>
      <div className="mt-2 flex flex-col gap-0.5 w-full">
        <Typography
          variant="body-s-accent"
          color="primary"
          noWrap
          inlineStyle={{ letterSpacing: "-0.00525rem" }}
        >
          {offer.name}
        </Typography>
        <div className="ffeature flex gap-1 items-center text-xs leading-4">
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
}: {
  offer: OfferCardModel
  dimmed?: boolean
  onClick?: () => void
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

