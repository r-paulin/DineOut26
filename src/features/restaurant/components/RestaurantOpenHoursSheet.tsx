import { Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { useId } from "react"
import { Drawer } from "vaul"
import {
  Z_RESTAURANT_SHEET_CONTENT,
  Z_RESTAURANT_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import type { RestaurantFixedOpenHoursRow } from "@/features/restaurant/data/restaurantFixedOpenHours"
import {
  SHEET_CLOSE_ICON_ON_SURFACE_CLASS,
  SHEET_CLOSE_ON_SURFACE_NESTED_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_OVERLAY_CLASS,
  vaulSheetContentClassName,
} from "@/shared/utils/vaulAppSheetShell"

export interface RestaurantOpenHoursSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Portal target (device shell); falls back to default when absent. */
  container?: HTMLElement | null
  /** Main title from {@link buildOpenHoursUiState}: `Open now` or `Closed`. */
  heading: string
  /** Detail line only, e.g. `Closes at 23:00` / `Opens at 12:00`. */
  subtitle: string
  /** Weekly grid; must align with {@link heading} / {@link subtitle} source. */
  weeklyRows: readonly RestaurantFixedOpenHoursRow[]
}

/**
 * Bottom sheet: weekly opening hours (fixed prototype data).
 * Figma: MODAL / Time (`15888:17224`). Same shell pattern as {@link RestaurantRatingSheet}.
 */
export function RestaurantOpenHoursSheet({
  isOpen,
  onOpenChange,
  container,
  heading,
  subtitle,
  weeklyRows,
}: RestaurantOpenHoursSheetProps) {
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
            Opening hours: {heading}. {subtitle}
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
              Weekly opening hours for this restaurant.
            </Drawer.Description>
            <div className="flex w-full flex-col gap-2 px-6 pb-3 pt-6 pe-14">
              <h2 id={titleId} className="m-0 p-0">
                <Typography variant="heading-m-accent" color="primary" as="span">
                  {heading}
                </Typography>
              </h2>
              <Typography variant="body-s-regular" color="secondary" as="p">
                {subtitle}
              </Typography>
            </div>
            <div className="flex w-full gap-6 px-6 pb-4">
              <div className="min-w-[7.75rem] shrink-0">
                {weeklyRows.map((row) => (
                  <Typography
                    key={row.day}
                    variant="body-m-regular"
                    color="secondary"
                    as="div"
                    noWrap
                  >
                    {row.day}
                  </Typography>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                {weeklyRows.map((row) => (
                  <Typography
                    key={`${row.day}-hours`}
                    variant="body-m-regular"
                    color="primary"
                    as="div"
                    noWrap
                  >
                    {row.range}
                  </Typography>
                ))}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
