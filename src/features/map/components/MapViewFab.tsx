import { Button } from "@bolteu/kalep-react"
import Map from "@bolteu/kalep-react-icons/dist/Map"

export interface MapViewFabProps {
  onClick: () => void
  /** Override stacking when the FAB sits above a full-screen overlay (e.g. section list). */
  zClassName?: string
}

/**
 * Floating "View map" pill above the bottom nav. Uses Kalep `<Button>` so the
 * dark-mode treatment matches the rest of the app.
 */
export function MapViewFab({
  onClick,
  zClassName = "z-[55]",
}: MapViewFabProps) {
  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 ${zClassName}`}
      style={{ bottom: "calc(var(--nav-height) + 1rem)" }}
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
