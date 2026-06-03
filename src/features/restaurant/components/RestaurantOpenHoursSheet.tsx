import { Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { useId, useMemo } from "react"
import { Drawer } from "vaul"
import {
  Z_RESTAURANT_SHEET_CONTENT,
  Z_RESTAURANT_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import { isClosedDayRange } from "@/features/restaurant/data/restaurantFixedOpenHours"
import type { RestaurantFixedOpenHoursRow } from "@/features/restaurant/data/restaurantFixedOpenHours"
import {
  buildOpenHoursUiState,
  todayDayName,
} from "@/features/restaurant/utils/restaurantOpenHoursUi"
import { SHEET_CLOSE_ICON_ON_SURFACE_CLASS } from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_OVERLAY_CLASS,
  vaulSheetContentClassName,
} from "@/shared/utils/vaulAppSheetShell"

export interface RestaurantOpenHoursSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Portal target (device shell); falls back to default when absent. */
  container?: HTMLElement | null
  /** Weekly grid; heading/subtitle derived live when the sheet opens. */
  weeklyRows: readonly RestaurantFixedOpenHoursRow[]
}

const INLINE_CLOSE_BTN =
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-neutral-secondary p-1 outline-none hover:bg-active-neutral-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-primary"

/**
 * Bottom sheet: weekly opening hours.
 * Figma: MODAL / Time (`16643:34914` open, `16643:34936` closed).
 */
export function RestaurantOpenHoursSheet({
  isOpen,
  onOpenChange,
  container,
  weeklyRows,
}: RestaurantOpenHoursSheetProps) {
  const titleId = useId()
  const hoursUi = useMemo(
    () => buildOpenHoursUiState(new Date(), weeklyRows),
    [weeklyRows, isOpen],
  )
  const today = todayDayName(new Date())

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
            Opening hours: {hoursUi.openHoursSheetHeading}.{" "}
            {hoursUi.openHoursSheetSubtitle}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Weekly opening hours for this restaurant.
          </Drawer.Description>
          <div className="flex flex-col pb-[max(2rem,var(--safe-area-bottom))]">
            <div className="flex w-full items-start gap-2 pl-6 pr-3 pb-3 pt-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1 pt-2">
                <h2 id={titleId} className="m-0 p-0">
                  <Typography variant="heading-s-accent" color="primary" as="span">
                    {hoursUi.openHoursSheetHeading}
                  </Typography>
                </h2>
                <Typography variant="body-m-regular" color="secondary" as="p">
                  {hoursUi.openHoursSheetSubtitle}
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
            <div className="flex w-full gap-6 px-6 pb-4">
              <div className="min-w-[7.75rem] shrink-0">
                {weeklyRows.map((row) => {
                  const isToday = row.day === today
                  return (
                    <Typography
                      key={row.day}
                      variant={isToday ? "body-m-accent" : "body-m-regular"}
                      color={isToday ? "primary" : "secondary"}
                      as="div"
                      noWrap
                    >
                      {row.day}
                    </Typography>
                  )
                })}
              </div>
              <div className="min-w-0 flex-1">
                {weeklyRows.map((row) => {
                  const isToday = row.day === today
                  const closed = isClosedDayRange(row.range)
                  return (
                    <Typography
                      key={`${row.day}-hours`}
                      variant={isToday ? "body-m-accent" : "body-m-regular"}
                      color={
                        isToday ? "primary"
                        : closed ? "secondary"
                        : "primary"
                      }
                      as="div"
                      noWrap
                    >
                      {row.range}
                    </Typography>
                  )
                })}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
