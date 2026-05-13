import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { IconButton, Typography } from "@bolteu/kalep-react"
import type { OfferCardModel } from "@/features/offers/offers.types"
import { mapOfferToRestaurantCardView } from "@/features/offers/utils/mapPlaceCardView"
import { OfferCardBadges } from "./OfferCardBadges"
import { OfferCardImageRatingBadge } from "./OfferCardImageRatingBadge"

const IMAGE_GRAD =
  "linear-gradient(180deg, rgba(0,0,0,0) 53.5%, rgba(0,0,0,0.5) 100%)"

export interface MapPlaceCardOpenedProps {
  offer: OfferCardModel
  onClose: () => void
  /** Opens full restaurant detail; slug from `offer.restaurantSlug ?? offer.id`. */
  onRestaurantPress?: (slug: string) => void
}

/**
 * Figma `_Place / Card / On Map - Opened` (15809:13976) — hero, campaign badges,
 * rating, close, name + meta. Floated above the map (not in the bottom sheet).
 */
export function MapPlaceCardOpened({
  offer,
  onClose,
  onRestaurantPress,
}: MapPlaceCardOpenedProps) {
  const view = mapOfferToRestaurantCardView(offer)
  const slug = offer.restaurantSlug ?? offer.id
  const cuisineLine =
    view.cuisineTags.length > 0
      ? view.cuisineTags.join(", ")
      : offer.cuisine

  const openDetail = () => {
    if (onRestaurantPress && slug) onRestaurantPress(slug)
  }

  return (
    <div
      role={onRestaurantPress && slug ? "button" : undefined}
      tabIndex={onRestaurantPress && slug ? 0 : undefined}
      className={`relative w-full overflow-hidden rounded-[12px] shadow-[0_2px_3px_rgba(0,0,0,0.16)]${
        onRestaurantPress && slug ? " cursor-pointer" : ""
      }`}
      onClick={onRestaurantPress && slug ? openDetail : undefined}
      onKeyDown={
        onRestaurantPress && slug
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                openDetail()
              }
            }
          : undefined
      }
      aria-label={
        onRestaurantPress && slug
          ? `Open ${view.name} restaurant details`
          : undefined
      }
    >
      <div className="relative w-full">
        <div className="relative z-0 w-full overflow-hidden bg-layer-floor-1 aspect-[308/156]">
          <img
            src={offer.image}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: IMAGE_GRAD }}
          />
          <div className="absolute left-3 top-3 z-[1] w-fit max-w-[calc(100%-3.5rem)]">
            <OfferCardBadges campaign={offer.campaign} density="comfortable" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-end justify-end pb-3 pe-3">
          <div className="pointer-events-auto">
            <OfferCardImageRatingBadge
              rating={offer.rating}
              reviewCount={view.reviewCount ? `(${view.reviewCount})` : undefined}
              density="comfortable"
              staticComfortable
            />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute right-3 top-3 z-[2]">
        <IconButton
          variant="secondary"
          shape="round"
          size="md"
          aria-label="Close restaurant details"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          overrideClassName="pointer-events-auto size-8 min-h-8 min-w-8 border-0 bg-layer-floor-1 shadow-[0_0.1rem_0.15rem_rgba(0,0,0,0.16)] p-0"
          icon={<Cross size="md" className="text-primary" />}
        />
      </div>
      <div className="flex flex-col gap-0.5 bg-layer-floor-1 px-4 pb-4 pt-2">
        <Typography
          as="h2"
          variant="heading-xs-accent"
          color="primary"
          noWrap
          inlineStyle={{ letterSpacing: "-0.02125rem" }}
        >
          {view.name}
        </Typography>
        <div className="flex min-w-0 items-baseline gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {view.isOpen ? (
            <>
              <Typography variant="body-s-accent" color="primary" as="span">
                Open
              </Typography>
              <Typography variant="body-s-regular" color="secondary" as="span">
                {"\u00a0\u00b7\u00a0"}
              </Typography>
              {view.closesAt ? (
                <Typography variant="body-s-regular" color="primary" as="span">
                  {`Closes ${view.closesAt}`}
                </Typography>
              ) : (
                <Typography variant="body-s-regular" color="primary" as="span">
                  {offer.area}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body-s-accent" color="danger-primary" as="span">
              Closed
            </Typography>
          )}
        </div>
        <div className="flex min-w-0 flex-wrap items-baseline gap-1">
          <Typography variant="body-s-regular" color="secondary" as="span">
            {cuisineLine}
          </Typography>
          <Typography variant="body-s-regular" color="tertiary" as="span">
            ·
          </Typography>
          <Typography variant="body-s-regular" color="secondary" as="span">
            {view.priceRange}
          </Typography>
        </div>
      </div>
    </div>
  )
}
