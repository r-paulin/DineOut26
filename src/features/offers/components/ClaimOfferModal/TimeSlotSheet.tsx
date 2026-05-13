import { Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { useId } from "react"
import { Drawer } from "vaul"
import {
  Z_CLAIM_NESTED_SHEET_CONTENT,
  Z_CLAIM_NESTED_SHEET_OVERLAY,
  Z_SEARCH_OPEN_AT_CONTENT,
  Z_SEARCH_OPEN_AT_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import {
  SHEET_CLOSE_ICON_ON_SURFACE_CLASS,
  SHEET_CLOSE_ON_SURFACE_CLASS,
  SHEET_CLOSE_ON_SURFACE_NESTED_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_OVERLAY_CLASS,
  vaulSheetContentClassName,
} from "@/shared/utils/vaulAppSheetShell"

export interface TimeSlotSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  slots: string[]
  value: string
  onChange: (time: string) => void
  container?: HTMLElement | null
  /** `nested` = claim flow inside another drawer; `standalone` = search / discover chips. */
  variant?: "nested" | "standalone"
  /** Visible list heading (sr-only title stays “Select arrival time”). */
  listTitle?: string
}

const drawerShellProps = {
  dismissible: true,
  repositionInputs: false,
  snapPoints: [] as number[],
} as const

/**
 * Quarter-hour arrival time picker (claim modal + search “open at” filter).
 */
export function TimeSlotSheet({
  isOpen,
  onOpenChange,
  slots,
  value,
  onChange,
  container,
  variant = "nested",
  listTitle = "Select arrival time",
}: TimeSlotSheetProps) {
  const titleId = useId()
  const nested = variant === "nested"
  const zOverlay = nested ? Z_CLAIM_NESTED_SHEET_OVERLAY : Z_SEARCH_OPEN_AT_OVERLAY
  const zContent = nested ? Z_CLAIM_NESTED_SHEET_CONTENT : Z_SEARCH_OPEN_AT_CONTENT
  const closeClass = nested
    ? SHEET_CLOSE_ON_SURFACE_NESTED_CLASS
    : SHEET_CLOSE_ON_SURFACE_CLASS
  const contentClass = vaulSheetContentClassName(nested ? "nested" : "default")

  const portal = (
    <Drawer.Portal>
      <Drawer.Overlay
        className={VAUL_SHEET_OVERLAY_CLASS}
        style={{ zIndex: zOverlay }}
      />
      <Drawer.Content
        className={[
          contentClass,
          nested ? "" : "mx-auto max-w-[var(--shell-width)]",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ zIndex: zContent }}
      >
        <Drawer.Title className="sr-only">Select arrival time</Drawer.Title>
        <Drawer.Close asChild>
          <button
            type="button"
            className={closeClass}
            aria-label="Close"
          >
            <Cross size="xs" className={SHEET_CLOSE_ICON_ON_SURFACE_CLASS} aria-hidden />
          </button>
        </Drawer.Close>
        <div
          className="flex max-h-[calc(85vh-4rem)] flex-col overflow-y-auto overscroll-y-contain pb-[max(1.5rem,var(--safe-area-bottom))]"
        >
          <Drawer.Description className="sr-only">
            Choose your arrival time within the offer window.
          </Drawer.Description>
          <div className="flex w-full flex-col gap-2 px-6 pb-3 pt-6 pe-14">
            <h2 id={titleId} className="m-0 p-0">
              <Typography variant="body-l-accent" color="primary" as="span">
                {listTitle}
              </Typography>
            </h2>
          </div>
          <ul className="m-0 flex list-none flex-col p-0">
            {slots.map((slot, index) => {
              const selected = slot === value
              return (
                <li
                  key={slot}
                  className={`m-0 border-b border-separator p-0 ${index === slots.length - 1 ? "border-b-0" : ""}`}
                >
                  <button
                    type="button"
                    data-no-press
                    className="flex w-full cursor-pointer flex-row items-center justify-between border-none bg-transparent px-6 py-4 text-left"
                    onClick={() => {
                      onChange(slot)
                      onOpenChange(false)
                    }}
                  >
                    <Typography
                      as="span"
                      variant="body-m-regular"
                      color="primary"
                    >
                      {slot}
                    </Typography>
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected
                          ? "border-special-brand bg-special-brand"
                          : "border-separator bg-transparent"
                      }`}
                      aria-hidden
                    >
                      {selected ? (
                        <span className="size-2 rounded-full bg-static-key-light" />
                      ) : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  )

  if (nested) {
    return (
      <Drawer.NestedRoot
        open={isOpen}
        onOpenChange={onOpenChange}
        {...drawerShellProps}
        container={container ?? undefined}
      >
        {portal}
      </Drawer.NestedRoot>
    )
  }

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      {...drawerShellProps}
      container={container ?? undefined}
    >
      {portal}
    </Drawer.Root>
  )
}
