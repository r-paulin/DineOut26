import { forwardRef } from "react"
import { RESTAURANT_DETAIL_SECTION_TITLE_CLASS } from "@/features/restaurant/components/restaurantDetailSectionTitle"

/** Figma `16670:54334` — menu thumbnail tile. */
const MENU_THUMB_W = 124
const MENU_THUMB_H = 165.333

const MENU_GALLERY_SCROLL_ROW =
  "flex gap-3 overflow-x-auto overflow-y-hidden pb-0 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x [overscroll-behavior-x:contain]"

export interface RestaurantDetailMenuSectionProps {
  imageUrls: readonly string[]
  onOpenGallery: (index: number) => void
}

/**
 * Figma `16670:54332` — Feed / Menu: title + horizontal menu page thumbnails.
 */
export const RestaurantDetailMenuSection = forwardRef<
  HTMLElement,
  RestaurantDetailMenuSectionProps
>(function RestaurantDetailMenuSection({ imageUrls, onOpenGallery }, ref) {
  if (imageUrls.length === 0) return null

  return (
    <section
      ref={ref}
      id="restaurant-detail-menu"
      className="flex w-full flex-col gap-3 bg-layer-floor-1 px-6 py-6"
      aria-labelledby="restaurant-detail-menu-heading"
    >
      <header>
        <h2
          className={RESTAURANT_DETAIL_SECTION_TITLE_CLASS}
          id="restaurant-detail-menu-heading"
        >
          Menu
        </h2>
      </header>
      <div className={MENU_GALLERY_SCROLL_ROW}>
        {imageUrls.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className="relative shrink-0 cursor-pointer overflow-hidden rounded-[4px] border border-neutral-secondary bg-neutral-secondary p-0"
            style={{ width: MENU_THUMB_W, height: MENU_THUMB_H }}
            onClick={() => {
              onOpenGallery(i)
            }}
            aria-label={`Open menu page ${i + 1} of ${imageUrls.length}`}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  )
})
