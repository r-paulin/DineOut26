import { Button, Typography } from "@bolteu/kalep-react"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import PercentFlower from "@bolteu/kalep-react-icons/dist/PercentFlower"
import { useLayoutEffect, useRef } from "react"
import { DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT } from "@/features/offers/constants/dineOutStackablePromo"
import { useRestaurantAtVenueBarEntrance } from "@/features/restaurant/hooks/useRestaurantAtVenueBarEntrance"

export interface RestaurantDetailAtVenueBarProps {
  onPress?: () => void
  /** When false, skip entrance animation (e.g. About overlay open). */
  animateIn?: boolean
  /** Parent calls this before the detail panel exit tween. */
  onExitAnimationRef?: (runExit: (() => void) | null) => void
}

/** Fixed primary CTA — replaces inline Pay with DineOut (Figma `16004:24692` family). */
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
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex justify-center bg-layer-floor-1 px-6 pt-4 pb-[calc(32px+env(safe-area-inset-bottom,0px))]"
    >
      <div className="pointer-events-auto flex w-full flex-col gap-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={onPress}
          aria-label="I'm at the venue"
        >
          <Pin size="sm" className="shrink-0 text-static-key-light" aria-hidden />
          I&apos;m at the venue
        </Button>
        <div className="flex items-center justify-center gap-1">
          <PercentFlower
            size="sm"
            className="shrink-0 text-danger-primary"
            aria-hidden
          />
          <Typography variant="body-xs-regular" color="primary" as="p" align="center">
            {DINEOUT_STACKABLE_PAYMENT_PROMO_TEXT}
          </Typography>
        </div>
      </div>
    </div>
  )
}
