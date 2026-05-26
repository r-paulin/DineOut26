import { Button } from "@bolteu/kalep-react"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import { useLayoutEffect, useRef } from "react"
import { useRestaurantAtVenueBarEntrance } from "@/features/restaurant/hooks/useRestaurantAtVenueBarEntrance"

export interface RestaurantDetailAtVenueBarProps {
  onPress?: () => void
  /** When false, skip entrance animation (e.g. About overlay open). */
  animateIn?: boolean
  /** Parent calls this before the detail panel exit tween. */
  onExitAnimationRef?: (runExit: (() => void) | null) => void
}

/**
 * Fixed primary CTA after the user has claimed an offer at this venue (Figma `16004:24692`).
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
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex justify-center bg-layer-floor-1 px-6 pt-4 pb-[calc(32px+env(safe-area-inset-bottom,0px))]"
    >
      <div className="pointer-events-auto w-full">
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
      </div>
    </div>
  )
}
