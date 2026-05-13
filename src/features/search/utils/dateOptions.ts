import type { DateValue } from "@/features/search/filters.types"

export interface DateOptionRow {
  id: DateValue
  label: string
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0")
}

function toLocalDateId(value: Date): string {
  const year = value.getFullYear()
  const month = pad2(value.getMonth() + 1)
  const day = pad2(value.getDate())
  return `${year}-${month}-${day}`
}

/**
 * Returns Today plus the next 7 calendar days (8 rows total), labels from the device locale.
 */
export function getDateOptions(now: Date): DateOptionRow[] {
  const longFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const rows: DateOptionRow[] = [{ id: "today", label: "Today" }]

  const base = new Date(now)
  base.setHours(12, 0, 0, 0)

  for (let i = 1; i <= 7; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    rows.push({
      id: toLocalDateId(d),
      label: longFormatter.format(d),
    })
  }

  return rows
}

/** Short chip label e.g. "Fri, 8 May" for a stored ISO date */
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
