/**
 * Time picker config for claim-offer arrival selection.
 * All comparisons use the passed `now` (device clock); callers pass `new Date()`.
 */

import type { DateValue } from "@/features/search/filters.types"
import {
  compareYmd,
  resolveScheduleYmd,
  toLocalYmd,
} from "@/features/offers/utils/offerScheduleLocal"

export type TimePickerMode = "native" | "slots"

export interface TimePickerConfig {
  mode: TimePickerMode
  slots?: string[]
  initialValue: string
  minTime: string
  maxTime: string
}

export interface OfferTimeConfig {
  isAllDay: boolean
  offerStart: string
  offerEnd: string
  workingHoursStart: string
  workingHoursEnd: string
}

export interface GetTimePickerConfigOptions {
  /** When set, slot filtering uses this local calendar day vs `now` (future = full window). */
  offerScheduleDate?: DateValue
}

/** Same defaults as the claim flow when reading offer cards. */
export function toOfferTimeConfigFromCardFields(offer: {
  isAllDay?: boolean
  offerStart?: string
  offerEnd?: string
  workingHoursStart?: string
  workingHoursEnd?: string
}): OfferTimeConfig {
  return {
    isAllDay: Boolean(offer.isAllDay),
    offerStart: offer.offerStart ?? "12:00",
    offerEnd: offer.offerEnd ?? "23:00",
    workingHoursStart: offer.workingHoursStart ?? "12:00",
    workingHoursEnd: offer.workingHoursEnd ?? "23:00",
  }
}

const TIME_RE = /^(\d{1,2}):(\d{2})$/

/** Minutes since midnight [0, 1439], or `null` if the string is not a valid `HH:MM`. */
export function parseHHMMToMinutes(s: string): number | null {
  const m = TIME_RE.exec(s.trim())
  if (!m) return null
  const h = Number.parseInt(m[1]!, 10)
  const min = Number.parseInt(m[2]!, 10)
  if (Number.isNaN(h) || Number.isNaN(min) || min > 59 || h > 23) return null
  return h * 60 + min
}

export function formatMinutesToHHMM(totalMinutes: number): string {
  const m = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`
}

function maxTimeString(a: string, b: string): string {
  const am = parseHHMMToMinutes(a)
  const bm = parseHHMMToMinutes(b)
  if (am == null && bm == null) return a
  if (am == null) return b
  if (bm == null) return a
  return am >= bm ? a : b
}

function minTimeString(a: string, b: string): string {
  const am = parseHHMMToMinutes(a)
  const bm = parseHHMMToMinutes(b)
  if (am == null && bm == null) return a
  if (am == null) return b
  if (bm == null) return a
  return am <= bm ? a : b
}

function nowHHMM(now: Date): string {
  return formatMinutesToHHMM(now.getHours() * 60 + now.getMinutes())
}

/** 15-minute slots from start through end (inclusive), both "HH:MM". */
export function generateQuarterHourSlots(start: string, end: string): string[] {
  const startM = parseHHMMToMinutes(start)
  const endM = parseHHMMToMinutes(end)
  if (startM == null || endM == null) return []
  let cur = startM
  if (cur > endM) return []
  const out: string[] = []
  while (cur <= endM) {
    out.push(formatMinutesToHHMM(cur))
    cur += 15
  }
  return out
}

/**
 * Quarter-hour choices within `[minTime, maxTime]` (inclusive), for bottom-sheet
 * pickers replacing native `type="time"`. When the window is narrower than one
 * 15-minute step, returns a single `HH:MM` clamped to `minTime` (same inclusive
 * window as the old native control).
 */
export function quarterHourSlotsBetween(minTime: string, maxTime: string): string[] {
  const minM = parseHHMMToMinutes(minTime)
  const maxM = parseHHMMToMinutes(maxTime)
  if (minM == null || maxM == null || minM > maxM) return []

  let cur = Math.ceil(minM / 15) * 15
  if (cur > maxM) {
    return [formatMinutesToHHMM(Math.min(minM, maxM))]
  }

  const out: string[] = []
  while (cur <= maxM) {
    out.push(formatMinutesToHHMM(cur))
    cur += 15
  }
  return out
}

/** Options shown in the claim / search arrival-time bottom sheet for a resolved config. */
export function getArrivalTimeSheetSlots(cfg: TimePickerConfig): string[] {
  if (cfg.mode === "slots") return cfg.slots ?? []
  return quarterHourSlotsBetween(cfg.minTime, cfg.maxTime)
}

/**
 * Slots strictly after `nowMinutes` (same-day clock): removes slot if slot ≤ now.
 */
export function filterFutureSlots(slots: string[], now: Date): string[] {
  const nowM = now.getHours() * 60 + now.getMinutes()
  return slots.filter((s) => {
    const sm = parseHHMMToMinutes(s)
    return sm != null && sm > nowM
  })
}

function pastDayUnclaimableSlotsConfig(
  offer: OfferTimeConfig,
  now: Date,
): TimePickerConfig {
  const nowStr = nowHHMM(now)
  const minTime = maxTimeString(offer.workingHoursStart, nowStr)
  const maxTime = minTimeString(offer.workingHoursEnd, offer.offerEnd)
  return {
    mode: "slots",
    slots: [],
    initialValue: offer.offerEnd,
    minTime,
    maxTime,
  }
}

export function getTimePickerConfig(
  offer: OfferTimeConfig,
  now: Date,
  options?: GetTimePickerConfigOptions,
): TimePickerConfig {
  const { workingHoursStart, workingHoursEnd } = offer
  const nowStr = nowHHMM(now)
  const todayYmd = toLocalYmd(now)
  const scheduleYmd =
    options?.offerScheduleDate != null ?
      resolveScheduleYmd(options.offerScheduleDate, now)
    : todayYmd
  const dayCmp = compareYmd(scheduleYmd, todayYmd)

  if (dayCmp < 0) {
    if (offer.isAllDay) {
      return {
        mode: "native",
        minTime: "23:59",
        maxTime: "00:00",
        initialValue: "23:59",
      }
    }
    return pastDayUnclaimableSlotsConfig(offer, now)
  }

  const isFutureOfferDay = dayCmp > 0

  if (offer.isAllDay) {
    if (isFutureOfferDay) {
      const minTime = workingHoursStart
      const maxTime = workingHoursEnd
      return {
        mode: "native",
        minTime,
        maxTime,
        initialValue: minTime,
      }
    }
    const minTime = maxTimeString(workingHoursStart, nowStr)
    const maxTime = workingHoursEnd
    const initialValue = minTime
    return {
      mode: "native",
      minTime,
      maxTime,
      initialValue,
    }
  }

  const allSlots = generateQuarterHourSlots(offer.offerStart, offer.offerEnd)
  const slots =
    isFutureOfferDay ? allSlots : filterFutureSlots(allSlots, now)
  const minTime = isFutureOfferDay ?
    maxTimeString(workingHoursStart, offer.offerStart)
  : maxTimeString(workingHoursStart, nowStr)
  const maxTime = minTimeString(workingHoursEnd, offer.offerEnd)

  if (slots.length === 0) {
    const minM = parseHHMMToMinutes(minTime)
    const maxM = parseHHMMToMinutes(maxTime)
    /** Quarter-hour grid can skip the last minute; native HH:MM still allows a valid choice. */
    if (minM != null && maxM != null && minM <= maxM) {
      return {
        mode: "native",
        minTime,
        maxTime,
        initialValue: minTime,
      }
    }
    return {
      mode: "slots",
      slots: [],
      initialValue: offer.offerEnd,
      minTime,
      maxTime,
    }
  }

  return {
    mode: "slots",
    slots,
    initialValue: slots[0]!,
    minTime,
    maxTime,
  }
}

/**
 * Same rules as the claim flow: no future arrival slots (windowed) or native
 * min time after closing (all-day past venue hours) ⇒ cannot claim.
 */
export function isOfferUnclaimableByClock(
  offer: OfferTimeConfig,
  now: Date,
  options?: GetTimePickerConfigOptions,
): boolean {
  const cfg = getTimePickerConfig(offer, now, options)
  if (cfg.mode === "slots") {
    return cfg.slots == null || cfg.slots.length === 0
  }
  const minM = parseHHMMToMinutes(cfg.minTime)
  const maxM = parseHHMMToMinutes(cfg.maxTime)
  if (minM == null || maxM == null) return false
  return minM > maxM
}
