import { Button, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { useEffect, useId, useMemo, useState } from "react"
import Picker from "react-mobile-picker"
import type { DateValue, TimeSlotId } from "@/features/search/filters.types"
import {
  formatDateTimeChipLabel,
  type DateOptionRow,
} from "@/features/search/utils/dateOptions"
import {
  DEFAULT_TIME_SLOT_ID,
  TIME_SLOT_OPTIONS,
  getTimeSlotOption,
  isTimeSlotId,
} from "@/features/search/utils/timeSlots"

const ITEM_HEIGHT = 56
/** Three rows visible (Figma `15863:12867` selection band). */
const PICKER_HEIGHT = ITEM_HEIGHT * 3

export interface DateTimeFilterPanelProps {
  filterDate: DateValue
  filterTimeSlot: TimeSlotId
  dateOptionRows: DateOptionRow[]
  titleId: string
  onClose: () => void
  onApply: (date: DateValue, timeSlot: TimeSlotId) => void
}

type DateTimePickerValue = {
  date: string
  timeSlot: string
  [key: string]: string
}

type PickerTextColor = "primary" | "secondary" | "tertiary"

function pickerItemColor(
  index: number,
  selectedIndex: number,
): PickerTextColor {
  const distance = Math.abs(index - selectedIndex)
  if (distance === 0) return "primary"
  if (distance === 1) return "secondary"
  return "tertiary"
}

/**
 * Date + time wheel sheet body — Figma `15863:12867`.
 * Two-axis iOS-style picker; Apply commits both axes together.
 */
export function DateTimeFilterPanel({
  filterDate,
  filterTimeSlot,
  dateOptionRows,
  titleId,
  onClose,
  onApply,
}: DateTimeFilterPanelProps) {
  const liveId = useId()
  const [draft, setDraft] = useState<DateTimePickerValue>(() => ({
    date: filterDate,
    timeSlot: filterTimeSlot,
  }))

  const dateIds = useMemo(
    () => new Set(dateOptionRows.map((r) => r.id)),
    [dateOptionRows],
  )

  const safeDraft = useMemo((): DateTimePickerValue => {
    const date = dateIds.has(draft.date) ? draft.date : "today"
    const timeSlot = isTimeSlotId(draft.timeSlot)
      ? draft.timeSlot
      : DEFAULT_TIME_SLOT_ID
    return { date, timeSlot }
  }, [dateIds, draft.date, draft.timeSlot])

  // Keep controlled value and internal draft aligned when options coerce.
  useEffect(() => {
    if (
      draft.date !== safeDraft.date ||
      draft.timeSlot !== safeDraft.timeSlot
    ) {
      setDraft(safeDraft)
    }
  }, [draft.date, draft.timeSlot, safeDraft])

  const selectedDateIndex = Math.max(
    0,
    dateOptionRows.findIndex((r) => r.id === safeDraft.date),
  )
  const selectedTimeIndex = Math.max(
    0,
    TIME_SLOT_OPTIONS.findIndex((s) => s.id === safeDraft.timeSlot),
  )

  const applyDisabled =
    safeDraft.date === filterDate && safeDraft.timeSlot === filterTimeSlot

  const resetDisabled =
    filterDate === "today" &&
    filterTimeSlot === DEFAULT_TIME_SLOT_ID &&
    safeDraft.date === "today" &&
    safeDraft.timeSlot === DEFAULT_TIME_SLOT_ID

  const liveLabel = formatDateTimeChipLabel(
    safeDraft.date,
    getTimeSlotOption(
      isTimeSlotId(safeDraft.timeSlot)
        ? safeDraft.timeSlot
        : DEFAULT_TIME_SLOT_ID,
    ).label,
    dateOptionRows,
  )

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (resetDisabled) return
    setDraft({ date: "today", timeSlot: DEFAULT_TIME_SLOT_ID })
    if (
      filterDate === "today" &&
      filterTimeSlot === DEFAULT_TIME_SLOT_ID
    ) {
      // Committed default; only snap the wheels back.
      return
    }
    onApply("today", DEFAULT_TIME_SLOT_ID)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (applyDisabled) return
    if (!isTimeSlotId(safeDraft.timeSlot)) return
    onApply(safeDraft.date, safeDraft.timeSlot)
  }

  const handlePickerChange = (value: DateTimePickerValue) => {
    const date = dateIds.has(String(value.date)) ? String(value.date) : "today"
    const timeSlot = isTimeSlotId(String(value.timeSlot))
      ? String(value.timeSlot)
      : DEFAULT_TIME_SLOT_ID
    setDraft({ date, timeSlot })
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
              Date and time
            </Typography>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="cursor-pointer border-none bg-transparent p-0 disabled:cursor-default disabled:opacity-40"
              onClick={handleReset}
              disabled={resetDisabled}
              aria-label="Reset date and time to Today, Anytime"
            >
              <Typography as="span" variant="body-l-accent" color="action-primary">
                Reset
              </Typography>
            </button>
          </div>
        </div>
      </div>

      <div
        id={liveId}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveLabel}
      </div>

      <div className="relative flex-none px-6 py-2">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-1/2 z-0 h-14 -translate-y-1/2 rounded-2xl bg-neutral-secondary"
        />
        <Picker
          value={safeDraft}
          onChange={handlePickerChange}
          height={PICKER_HEIGHT}
          itemHeight={ITEM_HEIGHT}
          wheelMode="natural"
          className="relative z-[1] w-full gap-[56px] [&_>div:last-child]:opacity-0"
          aria-label="Date and time"
          aria-describedby={liveId}
        >
          <Picker.Column name="date" aria-label="Date">
            {dateOptionRows.map((row, index) => (
              <Picker.Item key={row.id} value={row.id}>
                {({ selected }) => (
                  <div className="flex h-full w-full items-center justify-end">
                    <Typography
                      as="span"
                      variant="body-m-regular"
                      color={
                        selected
                          ? "primary"
                          : pickerItemColor(index, selectedDateIndex)
                      }
                    >
                      {row.label}
                    </Typography>
                  </div>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
          <Picker.Column name="timeSlot" aria-label="Time">
            {TIME_SLOT_OPTIONS.map((slot, index) => (
              <Picker.Item key={slot.id} value={slot.id}>
                {({ selected }) => (
                  <div className="flex h-full w-full items-center justify-start">
                    <Typography
                      as="span"
                      variant="body-m-regular"
                      color={
                        selected
                          ? "primary"
                          : pickerItemColor(index, selectedTimeIndex)
                      }
                    >
                      {slot.label}
                    </Typography>
                  </div>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
        </Picker>
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
