import { Button } from "@bolteu/kalep-react"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import { useRef } from "react"
import { useRestaurantAtVenueBarEntrance } from "@/features/restaurant/hooks/useRestaurantAtVenueBarEntrance"

export interface RestaurantDetailAtVenueBarProps {
  onPress?: () => void
  /** When false, skip entrance animation (e.g. About overlay open). */
  animateIn?: boolean
}

/** Fixed primary CTA — replaces inline Pay with DineOut (Figma `16004:24692` family). */
export function RestaurantDetailAtVenueBar({
  onPress,
  animateIn = true,
}: RestaurantDetailAtVenueBarProps) {
  const buttonWrapRef = useRef<HTMLDivElement>(null)
  useRestaurantAtVenueBarEntrance(
    buttonWrapRef,
    animateIn && Boolean(onPress),
  )

  if (!onPress) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex justify-center bg-gradient-to-t from-layer-floor-1 from-60% to-transparent px-6 pt-4 pb-[calc(32px+env(safe-area-inset-bottom,0px))]"
    >
      <div ref={buttonWrapRef} className="w-full">
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={onPress}
          overrideClassName="pointer-events-auto"
        >
          <Pin size="sm" className="shrink-0 text-static-key-light" aria-hidden />
          I&apos;m at the venue
        </Button>
      </div>
    </div>
  )
}
