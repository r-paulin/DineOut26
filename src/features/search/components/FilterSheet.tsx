import { Button, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { useId, useMemo, useState } from "react"
import { Drawer } from "vaul"
import {
  AMENITY_OPTIONS,
  CUISINE_OPTIONS,
  OFFER_OPTIONS,
  PRICE_OPTIONS,
} from "@/features/search/data/filterOptions"
import type {
  FilterKey,
  FilterState,
} from "@/features/search/filters.types"
import type { DateOptionRow } from "@/features/search/utils/dateOptions"
import { useDeviceShell } from "@/shared/context/useDeviceShell"
import { VAUL_SHEET_OVERLAY_CLASS } from "@/shared/utils/vaulAppSheetShell"
import { RadioFilterList } from "./RadioFilterList"

/** Above {@link SearchFullscreen} (`z-[120]`); below promo overlay peaks (`z-[125]`). */
const Z_FILTER_SHEET_OVERLAY = 122
const Z_FILTER_SHEET_CONTENT = 123

export interface FilterSheetProps {
  sheetKey: FilterKey | null
  filterState: FilterState
  dateOptionRows: DateOptionRow[]
  onClose: () => void
  onApply: (key: Exclude<FilterKey, "openNow">, value: string) => void
}

const SHEET_TITLE: Record<Exclude<FilterKey, "openNow">, string> = {
  date: "Date",
  offer: "Offers",
  price: "Price",
  cuisine: "Cuisine",
  amenity: "Amenities",
}

function committedDraftString(
  key: Exclude<FilterKey, "openNow">,
  state: FilterState,
): string {
  switch (key) {
    case "date":
      return state.date
    case "offer":
      return state.offer
    case "price":
      return state.price ?? ""
    case "cuisine":
      return state.cuisine ?? ""
    case "amenity":
      return state.amenity ?? ""
    default:
      return ""
  }
}

interface FilterSheetPanelProps {
  activeKey: Exclude<FilterKey, "openNow">
  filterState: FilterState
  dateOptionRows: DateOptionRow[]
  titleId: string
  onClose: () => void
  onApply: (key: Exclude<FilterKey, "openNow">, value: string) => void
}

/**
 * Inner panel remounts when `activeKey` changes so draft initializes from committed state without effects.
 */
function FilterSheetPanel({
  activeKey,
  filterState,
  dateOptionRows,
  titleId,
  onClose,
  onApply,
}: FilterSheetPanelProps) {
  const [draft, setDraft] = useState(() =>
    committedDraftString(activeKey, filterState),
  )

  const title = SHEET_TITLE[activeKey]

  const options = useMemo(() => {
    if (activeKey === "date") {
      return dateOptionRows.map((r) => ({ id: r.id, label: r.label }))
    }
    if (activeKey === "offer") return OFFER_OPTIONS
    if (activeKey === "price") return PRICE_OPTIONS
    if (activeKey === "cuisine") return CUISINE_OPTIONS
    return AMENITY_OPTIONS
  }, [activeKey, dateOptionRows])

  const applyDisabled =
    draft === committedDraftString(activeKey, filterState)

  /** Default value string for the active filter (same as legacy draft reset). */
  function committedResetValue(key: Exclude<FilterKey, "openNow">): string {
    switch (key) {
      case "date":
        return "today"
      case "offer":
        return "all"
      case "price":
      case "cuisine":
      case "amenity":
        return ""
      default:
        return ""
    }
  }

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const value = committedResetValue(activeKey)
    setDraft(value)
    onApply(activeKey, value)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (applyDisabled) return
    onApply(activeKey, draft)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-h-[85vh] flex-col overflow-hidden bg-layer-floor-1"
      aria-labelledby={titleId}
    >
      <div className="flex-none border-b border-separator bg-layer-floor-1 px-6 pb-4 pt-4">
        <div className="grid min-h-6 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <div className="flex justify-start">
            <button
              type="button"
              className="inline-flex size-6 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-primary"
              aria-label="Close"
              onClick={onClose}
            >
              <Cross size="lg" aria-hidden />
            </button>
          </div>
          <div
            id={titleId}
            className="pointer-events-none flex min-h-6 items-center justify-center"
          >
            <Typography as="span" variant="body-l-accent" align="center">
              {title}
            </Typography>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="cursor-pointer border-none bg-transparent p-0"
              onClick={handleReset}
            >
              <Typography as="span" variant="body-l-accent" color="action-primary">
                Reset
              </Typography>
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-4">
        <RadioFilterList
          name={`dineout-filter-${activeKey}`}
          options={options}
          value={draft}
          onChange={setDraft}
          aria-labelledby={titleId}
        />
      </div>

      <div className="flex-none bg-layer-floor-1 px-6 pb-[max(1.5rem,var(--safe-area-bottom))] pt-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={applyDisabled}
          fullWidth
        >
          Apply
        </Button>
      </div>
    </form>
  )
}

/**
 * Modal bottom sheet for a single filter dimension: radio list, Reset, Apply.
 * Uses Vaul `Drawer` (not Kalep `BottomSheet`) so `Drawer.Title` / `Drawer.Description`
 * sit directly under `Drawer.Content`, satisfying Radix dialog a11y and avoiding
 * console warnings from Kalep’s BottomSheet shell.
 */
export function FilterSheet({
  sheetKey,
  filterState,
  dateOptionRows,
  onClose,
  onApply,
}: FilterSheetProps) {
  const titleId = useId()
  const { portalRoot } = useDeviceShell()

  const activeKey =
    sheetKey && sheetKey !== "openNow"
      ? sheetKey
      : null

  const isOpen = activeKey !== null

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      dismissible
      repositionInputs={false}
      snapPoints={[]}
      container={portalRoot ?? undefined}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className={VAUL_SHEET_OVERLAY_CLASS}
          style={{ zIndex: Z_FILTER_SHEET_OVERLAY }}
        />
        <Drawer.Content
          className={[
            "fixed bottom-0 left-0 right-0 mx-auto h-fit w-full max-w-[var(--shell-width)] outline-none",
            "max-h-[97vh] overflow-hidden rounded-t-[32px] bg-layer-floor-1",
            "shadow-[0_0.375rem_0.75rem_rgba(0,0,0,0.24)]",
          ].join(" ")}
          style={{ zIndex: Z_FILTER_SHEET_CONTENT }}
        >
          {activeKey ? (
            <>
              <Drawer.Title className="sr-only">
                Filter: {SHEET_TITLE[activeKey]}
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                Choose one option for this filter. Reset restores defaults and closes
                the sheet. Apply saves your choice and closes the sheet.
              </Drawer.Description>
              <FilterSheetPanel
                key={activeKey}
                activeKey={activeKey}
                filterState={filterState}
                dateOptionRows={dateOptionRows}
                titleId={titleId}
                onClose={onClose}
                onApply={onApply}
              />
            </>
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
