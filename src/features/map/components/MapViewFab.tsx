import { Button } from "@bolteu/kalep-react"
import Map from "@bolteu/kalep-react-icons/dist/Map"
import { forwardRef } from "react"

export interface MapViewFabProps {
  onClick: () => void
  /** Override stacking when the FAB sits above a full-screen overlay (e.g. section list). */
  zClassName?: string
  /**
   * When true (default), clears the home bottom nav height. When false, only
   * safe-area inset is used (overlays without bottom nav).
   */
  aboveBottomNav?: boolean
}

/**
 * Floating "View map" pill. Uses Kalep `<Button>` so the dark-mode treatment
 * matches the rest of the app.
 *
 * `ref` targets the motion node (inner), so exits can tween `y` / opacity
 * without fighting the outer `translateX(-50%)` centering.
 */
export const MapViewFab = forwardRef<HTMLDivElement, MapViewFabProps>(
  function MapViewFab(
    { onClick, zClassName = "z-[55]", aboveBottomNav = true },
    ref,
  ) {
    const bottom = aboveBottomNav
      ? "calc(var(--nav-layout-offset) + 1rem)"
      : "calc(env(safe-area-inset-bottom, 0px) + 1rem)"

    return (
      <div
        className={`fixed left-1/2 -translate-x-1/2 ${zClassName}`}
        style={{ bottom }}
      >
        <div ref={ref}>
          <Button
            variant="primary"
            size="lg"
            onClick={onClick}
            aria-label="View map"
            startIcon={<Map />}
          >
            View map
          </Button>
        </div>
      </div>
    )
  },
)
