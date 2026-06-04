import { Button, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import MyLocationIos from "@bolteu/kalep-react-icons/dist/MyLocationIos"
import { useId } from "react"
import { Drawer } from "vaul"
import { VenueAddressMapSnapshot } from "@/features/restaurant/components/VenueAddressMapSnapshot"
import {
  RESTAURANT_ADDRESS_SHEET_CLOSE,
  RESTAURANT_ADDRESS_SHEET_GET_DIRECTIONS,
  RESTAURANT_ADDRESS_SHEET_TITLE,
} from "@/features/restaurant/constants/restaurantAddressSheetCopy"
import {
  Z_RESTAURANT_SHEET_CONTENT,
  Z_RESTAURANT_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import type { RestaurantSlug } from "@/features/offers/data/restaurantOffers.types"
import { SHEET_CLOSE_ICON_ON_SURFACE_CLASS } from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_OVERLAY_CLASS,
  vaulSheetContentClassName,
} from "@/shared/utils/vaulAppSheetShell"

export interface RestaurantAddressSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Portal target (device shell); falls back to default when absent. */
  container?: HTMLElement | null
  address: string
  restaurantSlug: RestaurantSlug
  /** Google Maps search URL for “Get directions”. */
  mapsHref: string
  /** Optional analytics when the user requests directions. */
  onGetDirections?: () => void
}

const INLINE_CLOSE_BTN =
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-neutral-secondary p-1 outline-none hover:bg-active-neutral-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-primary"

/**
 * Bottom sheet: venue address + static map snapshot.
 * Figma `16947:60202` — MODAL / Address.
 */
export function RestaurantAddressSheet({
  isOpen,
  onOpenChange,
  container,
  address,
  restaurantSlug,
  mapsHref,
  onGetDirections,
}: RestaurantAddressSheetProps) {
  const titleId = useId()

  const handleGetDirections = () => {
    window.open(mapsHref, "_blank", "noopener,noreferrer")
    onGetDirections?.()
  }

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
          className={`${vaulSheetContentClassName()} bg-layer-floor-2`}
          style={{ zIndex: Z_RESTAURANT_SHEET_CONTENT }}
        >
          <Drawer.Title className="sr-only">
            {RESTAURANT_ADDRESS_SHEET_TITLE}: {address}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Map snapshot and directions for this restaurant.
          </Drawer.Description>
          <div className="flex flex-col pb-[max(1.5rem,var(--safe-area-bottom))]">
            <div className="flex w-full items-start gap-2 pl-6 pr-3 pb-3 pt-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1 pt-2">
                <h2 id={titleId} className="m-0 p-0">
                  <Typography variant="heading-s-accent" color="primary" as="span">
                    {RESTAURANT_ADDRESS_SHEET_TITLE}
                  </Typography>
                </h2>
                <Typography variant="body-m-regular" color="secondary" as="p">
                  {address}
                </Typography>
              </div>
              <Drawer.Close asChild>
                <button
                  type="button"
                  className={INLINE_CLOSE_BTN}
                  aria-label="Close"
                >
                  <Cross
                    size="xs"
                    className={SHEET_CLOSE_ICON_ON_SURFACE_CLASS}
                    aria-hidden
                  />
                </button>
              </Drawer.Close>
            </div>
            <div className="w-full px-6 pb-6">
              <VenueAddressMapSnapshot restaurantSlug={restaurantSlug} />
            </div>
            <div className="flex w-full flex-col gap-4 px-6">
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                startIcon={<MyLocationIos aria-hidden />}
                onClick={handleGetDirections}
              >
                {RESTAURANT_ADDRESS_SHEET_GET_DIRECTIONS}
              </Button>
              <Drawer.Close asChild>
                <Button type="button" variant="secondary" size="lg" fullWidth>
                  {RESTAURANT_ADDRESS_SHEET_CLOSE}
                </Button>
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
