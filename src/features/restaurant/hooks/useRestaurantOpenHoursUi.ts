import { useEffect, useMemo, useState } from "react"
import type { RestaurantFixedOpenHoursRow } from "@/features/restaurant/data/restaurantFixedOpenHours"
import {
  buildOpenHoursUiState,
  type RestaurantOpenHoursUi,
} from "@/features/restaurant/utils/restaurantOpenHoursUi"

const TICK_MS = 60_000

/**
 * Live open-hours UI from weekly schedule + local clock (recomputes every minute).
 */
export function useRestaurantOpenHoursUi(
  weekly: readonly RestaurantFixedOpenHoursRow[],
): RestaurantOpenHoursUi {
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now())
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [weekly])

  return useMemo(
    () => buildOpenHoursUiState(new Date(nowMs), weekly),
    [nowMs, weekly],
  )
}
