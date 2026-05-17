import { useEffect, useState } from "react"
import type { RestaurantFixedOpenHoursRow } from "@/features/restaurant/data/restaurantFixedOpenHours"
import {
  buildRestaurantHeroStatusPill,
  type RestaurantHeroStatusPill,
} from "@/features/restaurant/utils/restaurantOpenHoursUi"

const TICK_MS = 60_000

/**
 * Hero scrim pill labels from weekly hours + local clock; re-computes every minute.
 */
export function useRestaurantHeroStatusPill(
  weekly: readonly RestaurantFixedOpenHoursRow[],
): RestaurantHeroStatusPill {
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now())
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [weekly])

  return buildRestaurantHeroStatusPill(new Date(nowMs), weekly)
}
