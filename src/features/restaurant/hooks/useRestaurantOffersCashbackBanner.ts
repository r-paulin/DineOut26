import { useCallback, useState } from "react"
import {
  dismissRestaurantOffersCashbackBanner,
  isRestaurantOffersCashbackBannerDismissed,
} from "@/features/restaurant/utils/restaurantOffersCashbackBannerDismiss"

export function useRestaurantOffersCashbackBanner(venueSlug: string): {
  visible: boolean
  dismiss: () => void
} {
  const [dismissed, setDismissed] = useState(() =>
    isRestaurantOffersCashbackBannerDismissed(venueSlug),
  )

  const dismiss = useCallback(() => {
    dismissRestaurantOffersCashbackBanner(venueSlug)
    setDismissed(true)
  }, [venueSlug])

  return { visible: !dismissed, dismiss }
}
