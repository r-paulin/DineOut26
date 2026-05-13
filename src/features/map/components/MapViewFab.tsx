import { Button } from "@bolteu/kalep-react"
import Map from "@bolteu/kalep-react-icons/dist/Map"

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
 */
export function MapViewFab({
  onClick,
  zClassName = "z-[55]",
  aboveBottomNav = true,
}: MapViewFabProps) {
  const bottom = aboveBottomNav
    ? "calc(var(--nav-height) + 1rem)"
    : "calc(env(safe-area-inset-bottom, 0px) + 1rem)"

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 ${zClassName}`}
      style={{ bottom }}
    >
      <Button
        variant="primary"
        onClick={onClick}
        aria-label="View map"
        startIcon={<Map />}
      >
        View map
      </Button>
    </div>
  )
}
