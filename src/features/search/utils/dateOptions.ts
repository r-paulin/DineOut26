import type { DateValue } from "@/features/search/filters.types"

export interface DateOptionRow {
  id: DateValue
  label: string
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0")
}

/** Local calendar `YYYY-MM-DD` (not UTC). */
export function toLocalDateId(value: Date): string {
  const year = value.getFullYear()
  const month = pad2(value.getMonth() + 1)
  const day = pad2(value.getDate())
  return `${year}-${month}-${day}`
}

/**
 * Today + Tomorrow + next 5 days (7 rows). Labels match the date+time wheel
 * (Figma `15863:12867`): Today, Tomorrow, then `Sat, 10 Oct`.
 */
export function getDateOptions(now: Date): DateOptionRow[] {
  const shortFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

  const rows: DateOptionRow[] = [{ id: "today", label: "Today" }]

  const base = new Date(now)
  base.setHours(12, 0, 0, 0)

  for (let i = 1; i <= 6; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    rows.push({
      id: toLocalDateId(d),
      label: i === 1 ? "Tomorrow" : shortFormatter.format(d),
    })
  }

  return rows
}

/**
 * Keeps a stored filter date valid after midnight / long backgrounding:
 * - ISO equal to calendar today → `"today"`
 * - past ISO or outside the 7-day wheel → `"today"`
 */
export function normalizeFilterDate(
  date: DateValue,
  now: Date,
): DateValue {
  if (date === "today") return "today"

  const todayId = toLocalDateId(now)
  if (date === todayId) return "today"

  // YYYY-MM-DD lexicographic order matches chronological order.
  if (date < todayId) return "today"

  const validIds = new Set(getDateOptions(now).map((r) => r.id))
  if (!validIds.has(date)) return "today"

  return date
}

/** Short chip date fragment e.g. "Fri, 8 May" for a stored ISO date. */
export function formatDateChipLabel(isoDate: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!parts) return isoDate
  const d = new Date(
    Number(parts[1]),
    Number(parts[2]) - 1,
    Number(parts[3]),
    12,
    0,
    0,
    0,
  )
  if (Number.isNaN(d.getTime())) return isoDate
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d)
}

/** Chip label for date + time slot — e.g. `Today, Anytime`. */
export function formatDateTimeChipLabel(
  date: DateValue,
  timeSlotLabel: string,
  dateOptionRows: readonly DateOptionRow[],
): string {
  const dateLabel =
    date === "today" ?
      "Today"
    : (dateOptionRows.find((r) => r.id === date)?.label ??
      formatDateChipLabel(date))
  return `${dateLabel}, ${timeSlotLabel}`
}
