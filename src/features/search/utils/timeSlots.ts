/** Discover date+time wheel — Figma `15863:12867`. */
export type TimeSlotId =
  | "any"
  | "morning"
  | "lunch"
  | "afternoon"
  | "evening"
  | "lateNight"

export interface TimeSlotOption {
  id: TimeSlotId
  /** Wheel / chip label (e.g. `Anytime`, `12:00–15:00`). */
  label: string
  /** Inclusive start minute from midnight; null for Anytime. */
  startMinutes: number | null
  /** Exclusive end minute from midnight; null for Anytime. `1440` = end of day. */
  endMinutes: number | null
}

export const TIME_SLOT_OPTIONS: readonly TimeSlotOption[] = [
  { id: "any", label: "Anytime", startMinutes: null, endMinutes: null },
  {
    id: "morning",
    label: "08:00–12:00",
    startMinutes: 8 * 60,
    endMinutes: 12 * 60,
  },
  {
    id: "lunch",
    label: "12:00–15:00",
    startMinutes: 12 * 60,
    endMinutes: 15 * 60,
  },
  {
    id: "afternoon",
    label: "15:00–18:00",
    startMinutes: 15 * 60,
    endMinutes: 18 * 60,
  },
  {
    id: "evening",
    label: "18:00–22:00",
    startMinutes: 18 * 60,
    endMinutes: 22 * 60,
  },
  {
    id: "lateNight",
    /** Local evening through end of calendar day; offers wrapping past midnight are not modeled. */
    label: "22:00–00:00",
    startMinutes: 22 * 60,
    endMinutes: 24 * 60,
  },
] as const

export const DEFAULT_TIME_SLOT_ID: TimeSlotId = "any"

export function getTimeSlotOption(id: TimeSlotId): TimeSlotOption {
  return (
    TIME_SLOT_OPTIONS.find((o) => o.id === id) ?? TIME_SLOT_OPTIONS[0]!
  )
}

export function isTimeSlotId(value: string): value is TimeSlotId {
  return TIME_SLOT_OPTIONS.some((o) => o.id === value)
}
