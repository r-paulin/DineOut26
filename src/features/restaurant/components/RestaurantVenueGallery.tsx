import type { RestaurantDetailModel } from "@/features/restaurant/restaurantDetail.types"

export interface RestaurantVenueGalleryProps {
  venueGalleryCycles: RestaurantDetailModel["venueGalleryCycles"]
  /** Applied to the scroll container (default `pt-6`). */
  className?: string
}

/** Horizontal mosaic gallery shared by venue section and About page. */
export function RestaurantVenueGallery({
  venueGalleryCycles,
  className = "pt-6",
}: RestaurantVenueGalleryProps) {
  return (
    <div
      className={`w-full min-w-0 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      <div className="flex w-max flex-row gap-3">
        {venueGalleryCycles.map((cycle, i) => (
          <div key={`${cycle.tall}-${i}`} className="flex shrink-0 gap-3">
            <div className="h-[250px] w-[272px] shrink-0 overflow-hidden rounded-[12px] bg-neutral-secondary">
              <img
                src={cycle.tall}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex h-[250px] w-[130px] shrink-0 flex-col gap-3">
              <div className="h-[120px] w-full shrink-0 overflow-hidden rounded-[12px] bg-neutral-secondary">
                <img
                  src={cycle.top}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="h-[120px] w-full shrink-0 overflow-hidden rounded-[12px] bg-neutral-secondary">
                <img
                  src={cycle.bottom}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
