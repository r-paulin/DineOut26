import { useCallback, useEffect, useMemo, useState } from "react"
import { flushSync } from "react-dom"
import {
  AMENITY_OPTIONS,
  CUISINE_OPTIONS,
  OFFER_OPTIONS,
  PRICE_CHIP_LABEL,
} from "@/features/search/data/filterOptions"
import {
  getDefaultFilterState,
  type DateValue,
  type FilterKey,
  type FilterState,
  type OfferValue,
  type PriceValue,
  type TimeSlotId,
} from "@/features/search/filters.types"
import {
  formatDateTimeChipLabel,
  getDateOptions,
  normalizeFilterDate,
} from "@/features/search/utils/dateOptions"
import { getTimeSlotOption } from "@/features/search/utils/timeSlots"
import { createLogger } from "@/shared/utils/logger"

const log = createLogger("filters")

export interface UseFiltersReturn {
  state: FilterState
  sheetKey: FilterKey | null
  dateOptionRows: ReturnType<typeof getDateOptions>
  openSheet: (key: Exclude<FilterKey, "openNow">) => void
  closeSheet: () => void
  applySheetValue: (
    key: Exclude<FilterKey, "openNow" | "date">,
    value: string,
  ) => void
  /**
   * Commits the combined date + time wheel (Figma `15863:12867`).
   * @returns `true` when date/timeSlot actually changed (for skeleton/UX).
   */
  applyDateTimeFilter: (date: DateValue, timeSlot: TimeSlotId) => boolean
  toggleOpenNowToday: () => void
  clearOpenNowFilter: () => void
  getChipLabel: (key: FilterKey) => string
  isChipActive: (key: FilterKey) => boolean
  /** A chip is "locked" when the current filter combination makes it non-interactive (e.g. offer = Pre-book when date ≠ Today). */
  isChipLocked: (key: FilterKey) => boolean
  /** Trailing affordance for the open-now row */
  openNowTrailing: "none" | "clear" | "chevron"
  /** Restores all filter chips to {@link getDefaultFilterState}. */
  resetAllFilters: () => void
}

function findOfferLabel(id: OfferValue): string {
  return OFFER_OPTIONS.find((o) => o.id === id)?.label ?? "All offers"
}

/**
 * Effective offer value used for the chip label / active state.
 *
 * When the date is anything other than "today", the offer filter is locked to
 * `"prebook"` (live offers aren't bookable for future dates). The user's
 * previously selected offer is kept in state so it's restored automatically
 * when they switch back to "today".
 */
function getEffectiveOffer(state: FilterState): OfferValue {
  return state.date === "today" ? state.offer : "prebook"
}

function findCuisineLabel(id: string): string {
  return CUISINE_OPTIONS.find((o) => o.id === id)?.label ?? id
}

function findAmenityLabel(id: string): string {
  return AMENITY_OPTIONS.find((o) => o.id === id)?.label ?? id
}

export function useFilters(): UseFiltersReturn {
  const [state, setState] = useState<FilterState>(() => getDefaultFilterState())
  const [sheetKey, setSheetKey] = useState<FilterKey | null>(null)
  const [todayAnchor, setTodayAnchor] = useState(() => new Date())

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return
    }

    const refreshTodayAnchor = () => setTodayAnchor(new Date())
    const millisUntilNextDay = (): number => {
      const next = new Date()
      next.setHours(24, 0, 0, 0)
      return Math.max(250, next.getTime() - Date.now() + 25)
    }

    let midnightTimer = window.setTimeout(function onMidnight() {
      refreshTodayAnchor()
      midnightTimer = window.setTimeout(onMidnight, millisUntilNextDay())
    }, millisUntilNextDay())

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshTodayAnchor()
      }
    }

    window.addEventListener("focus", refreshTodayAnchor)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.clearTimeout(midnightTimer)
      window.removeEventListener("focus", refreshTodayAnchor)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const dateOptionRows = useMemo(
    () => getDateOptions(todayAnchor),
    [todayAnchor],
  )

  // After midnight / long background: collapse ISO "today" and drop stale dates.
  useEffect(() => {
    setState((prev) => {
      const nextDate = normalizeFilterDate(prev.date, todayAnchor)
      if (nextDate === prev.date) return prev
      const next: FilterState = { ...prev, date: nextDate }
      if (nextDate !== "today") {
        next.openNow = false
      }
      return next
    })
  }, [todayAnchor])

  const closeSheet = useCallback(() => {
    setSheetKey(null)
  }, [])

  const openSheet = useCallback((key: Exclude<FilterKey, "openNow">) => {
    setSheetKey(key)
  }, [])

  const applyDateTimeFilter = useCallback(
    (date: DateValue, timeSlot: TimeSlotId): boolean => {
      let changed = false
      flushSync(() => {
        setSheetKey(null)
        setState((prev) => {
          const nextDate = normalizeFilterDate(date, todayAnchor)
          if (prev.date === nextDate && prev.timeSlot === timeSlot) {
            return prev
          }
          changed = true
          const next: FilterState = {
            ...prev,
            date: nextDate,
            timeSlot,
          }
          if (nextDate !== "today") {
            next.openNow = false
          }
          return next
        })
      })
      if (changed) {
        log.debug("filter apply: date+time", date, timeSlot)
      }
      return changed
    },
    [todayAnchor],
  )

  const applySheetValue = useCallback(
    (key: Exclude<FilterKey, "openNow" | "date">, value: string) => {
      flushSync(() => {
        setSheetKey(null)
        setState((prev) => {
          if (key === "offer") {
            return { ...prev, offer: value as OfferValue }
          }
          if (key === "price") {
            return {
              ...prev,
              price: value === "" ? null : (value as PriceValue),
            }
          }
          if (key === "cuisine") {
            return { ...prev, cuisine: value === "" ? null : value }
          }
          if (key === "amenity") {
            return { ...prev, amenity: value === "" ? null : value }
          }
          return prev
        })
      })
      log.debug("filter apply:", key, value)
    },
    [],
  )

  const toggleOpenNowToday = useCallback(() => {
    setState((prev) => {
      if (prev.date !== "today") return prev
      return { ...prev, openNow: !prev.openNow }
    })
  }, [])

  const clearOpenNowFilter = useCallback(() => {
    setState((prev) => ({ ...prev, openNow: false }))
  }, [])

  const resetAllFilters = useCallback(() => {
    setState(getDefaultFilterState())
    setSheetKey(null)
    log.debug("filter reset all")
  }, [])

  const getChipLabel = useCallback(
    (key: FilterKey): string => {
      switch (key) {
        case "date":
          return formatDateTimeChipLabel(
            state.date,
            getTimeSlotOption(state.timeSlot).label,
            dateOptionRows,
          )
        case "offer":
          return findOfferLabel(getEffectiveOffer(state))
        case "openNow":
          return "Open now"
        case "price":
          return state.price ? PRICE_CHIP_LABEL[state.price] : "Price"
        case "cuisine":
          return state.cuisine ? findCuisineLabel(state.cuisine) : "Cuisine"
        case "amenity":
          return state.amenity ? findAmenityLabel(state.amenity) : "Amenities"
        default:
          return ""
      }
    },
    [dateOptionRows, state],
  )

  const isChipActive = useCallback(
    (key: FilterKey): boolean => {
      const defaults = getDefaultFilterState()
      switch (key) {
        case "date":
          return (
            state.date !== defaults.date ||
            state.timeSlot !== defaults.timeSlot
          )
        case "offer":
          return getEffectiveOffer(state) !== defaults.offer
        case "openNow":
          return state.date === "today" && state.openNow
        case "price":
          return state.price !== defaults.price
        case "cuisine":
          return state.cuisine !== defaults.cuisine
        case "amenity":
          return state.amenity !== defaults.amenity
        default:
          return false
      }
    },
    [state],
  )

  const isChipLocked = useCallback(
    (key: FilterKey): boolean => {
      // Offer is forced to "prebook" when the date is not today.
      if (key === "offer") return state.date !== "today"
      return false
    },
    [state.date],
  )

  const openNowTrailing = useMemo<"none" | "clear" | "chevron">(() => {
    if (state.date === "today" && state.openNow) return "clear"
    return "none"
  }, [state.date, state.openNow])

  return {
    state,
    sheetKey,
    dateOptionRows,
    openSheet,
    closeSheet,
    applySheetValue,
    applyDateTimeFilter,
    toggleOpenNowToday,
    clearOpenNowFilter,
    resetAllFilters,
    getChipLabel,
    isChipActive,
    isChipLocked,
    openNowTrailing,
  }
}
