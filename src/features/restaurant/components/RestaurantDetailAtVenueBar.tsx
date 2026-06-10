import { Button, Typography } from "@bolteu/kalep-react"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import { useLayoutEffect, useRef } from "react"
import {
  RESTAURANT_AT_VENUE_BAR_CTA,
  RESTAURANT_AT_VENUE_BAR_PROMO,
} from "@/features/restaurant/constants/restaurantAtVenueBarCopy"
import { useRestaurantAtVenueBarEntrance } from "@/features/restaurant/hooks/useRestaurantAtVenueBarEntrance"

export interface RestaurantDetailAtVenueBarProps {
  onPress?: () => void
  /** When false, skip entrance animation (e.g. About overlay open). */
  animateIn?: boolean
  /** Parent calls this before the detail panel exit tween. */
  onExitAnimationRef?: (runExit: (() => void) | null) => void
}

/**
 * Fixed primary CTA after the user has claimed an offer at this venue (Figma `17459:183249`).
 * Parent omits `onPress` when there is no active claim — the bar is not rendered.
 */
export function RestaurantDetailAtVenueBar({
  onPress,
  animateIn = true,
  onExitAnimationRef,
}: RestaurantDetailAtVenueBarProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const { runExit } = useRestaurantAtVenueBarEntrance(
    shellRef,
    animateIn && Boolean(onPress),
  )

  useLayoutEffect(() => {
    onExitAnimationRef?.(runExit)
    return () => onExitAnimationRef?.(null)
  }, [onExitAnimationRef, runExit])

  if (!onPress) return null

  return (
    <div
      ref={shellRef}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex justify-center border-t border-separator bg-layer-floor-2 px-6 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="pointer-events-auto flex w-full flex-col items-center gap-3">
        <p className="m-0 w-full overflow-hidden text-center">
          <Typography variant="body-s-regular" color="secondary" as="span" noWrap>
            {RESTAURANT_AT_VENUE_BAR_PROMO}
          </Typography>
        </p>
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={onPress}
          aria-label={RESTAURANT_AT_VENUE_BAR_CTA}
        >
          <Pin size="lg" className="shrink-0 text-static-key-light" aria-hidden />
          {RESTAURANT_AT_VENUE_BAR_CTA}
        </Button>
      </div>
    </div>
  )
}
