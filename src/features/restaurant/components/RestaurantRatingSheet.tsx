import { Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import OpenIn from "@bolteu/kalep-react-icons/dist/OpenIn"
import { useId, type ReactNode } from "react"
import { Drawer } from "vaul"
import { OfferCardListRatingStar } from "@/features/offers/components/OfferCardListRatingStar"
import {
  Z_RESTAURANT_SHEET_CONTENT,
  Z_RESTAURANT_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import type { RestaurantRatingSourceRowModel } from "@/features/restaurant/restaurantDetail.types"
import {
  SHEET_CLOSE_ICON_ON_SURFACE_CLASS,
  SHEET_CLOSE_ON_SURFACE_NESTED_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_OVERLAY_CLASS,
  vaulSheetContentClassName,
} from "@/shared/utils/vaulAppSheetShell"

/** Figma `15886:45340` — Google mark for rating source row. */
const RATING_MARK_GOOGLE_SRC = "/images/rating-source-google.svg"
/** Figma `15886:45356` — TripAdvisor mark for rating source row. */
const RATING_MARK_TRIPADVISOR_SRC = "/images/rating-source-tripadvisor.png"

export interface RestaurantRatingSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  googleMaps: RestaurantRatingSourceRowModel
  tripadvisor: RestaurantRatingSourceRowModel
  /** Portal target (device shell); falls back to default when absent. */
  container?: HTMLElement | null
}

function RatingSourceRowLink({
  row,
  logo,
  externalLabel,
}: {
  row: RestaurantRatingSourceRowModel
  logo: ReactNode
  externalLabel: string
}) {
  return (
    <a
      href={row.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full min-w-0 items-center gap-3 border-0 bg-transparent px-6 py-3 text-left no-underline outline-none ring-inset ring-action-primary focus-visible:ring-2"
      aria-label={externalLabel}
    >
      <span className="flex size-6 shrink-0 items-center justify-center">
        {logo}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0">
        <span className="flex min-w-0 flex-wrap items-center gap-1">
          <OfferCardListRatingStar />
          <Typography variant="body-m-accent" color="primary" as="span">
            {row.ratingValue}
          </Typography>
          <Typography variant="body-m-regular" color="secondary" as="span">
            {row.reviewsParenthetical}
          </Typography>
        </span>
        <Typography variant="body-s-regular" color="secondary" as="span" noWrap>
          {row.subtitle}
        </Typography>
      </span>
      <OpenIn size="md" className="shrink-0 text-secondary" aria-hidden />
    </a>
  )
}

/**
 * Bottom sheet: aggregated rating sources (Google Maps + TripAdvisor).
 * Figma: MODAL / Rating (Consumer Dine-out).
 * Uses Vaul `Drawer` directly so the sheet shell can use **16px** top radii and
 * `overflow-hidden` (Kalep `BottomSheet` uses `rounded-t-lg` without clipping).
 */
export function RestaurantRatingSheet({
  isOpen,
  onOpenChange,
  googleMaps,
  tripadvisor,
  container,
}: RestaurantRatingSheetProps) {
  const titleId = useId()

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      dismissible
      repositionInputs={false}
      snapPoints={[]}
      container={container ?? undefined}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className={VAUL_SHEET_OVERLAY_CLASS}
          style={{ zIndex: Z_RESTAURANT_SHEET_OVERLAY }}
        />
        <Drawer.Content
          className={vaulSheetContentClassName()}
          style={{ zIndex: Z_RESTAURANT_SHEET_CONTENT }}
        >
          <Drawer.Title className="sr-only">
            Rating
          </Drawer.Title>
          <Drawer.Close asChild>
            <button
              type="button"
              className={SHEET_CLOSE_ON_SURFACE_NESTED_CLASS}
              aria-label="Close"
            >
              <Cross size="xs" className={SHEET_CLOSE_ICON_ON_SURFACE_CLASS} aria-hidden />
            </button>
          </Drawer.Close>
          <div
            className="flex flex-col pb-[max(2rem,var(--safe-area-bottom))]"
          >
            <Drawer.Description className="sr-only">
              Score reflects reviews from TripAdvisor and Google Maps. Each row
              opens the listing in a new browser tab.
            </Drawer.Description>
            <div className="flex w-full flex-col gap-2 px-6 pb-3 pt-6 pe-14">
              <h2 id={titleId} className="m-0 p-0">
                <Typography variant="heading-m-accent" color="primary" as="span">
                  Rating
                </Typography>
              </h2>
              <Typography variant="body-s-regular" color="secondary" as="p">
                Score reflects reviews from TripAdvisor and Google Maps
              </Typography>
            </div>
            <RatingSourceRowLink
              row={googleMaps}
              logo={
                <img
                  src={RATING_MARK_GOOGLE_SRC}
                  alt=""
                  width={24}
                  height={24}
                  decoding="async"
                  className="block size-6 object-contain"
                />
              }
              externalLabel={`Open ${googleMaps.subtitle} in a new tab`}
            />
            <RatingSourceRowLink
              row={tripadvisor}
              logo={
                <img
                  src={RATING_MARK_TRIPADVISOR_SRC}
                  alt=""
                  width={24}
                  height={24}
                  decoding="async"
                  className="block size-6 object-contain"
                />
              }
              externalLabel={`Open ${tripadvisor.subtitle} in a new tab`}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
