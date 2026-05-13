import ReCenter from "@bolteu/kalep-react-icons/dist/ReCenter"
import { IconButton } from "@bolteu/kalep-react"

export interface MapRecenterFabProps {
  visible: boolean
  bottomPx: number
  onClick: () => void
}

/**
 * Figma `[Eater] Icon-Nav-Button` — white circular FAB, ReCenter icon, light shadow.
 */
export function MapRecenterFab({
  visible,
  bottomPx,
  onClick,
}: MapRecenterFabProps) {
  if (!visible) return null

  return (
    <div
      className="pointer-events-auto fixed right-4 z-[40]"
      style={{ bottom: `${bottomPx}px` }}
    >
      <IconButton
        variant="secondary"
        shape="round"
        size="md"
        aria-label="Re-center map on your location"
        onClick={onClick}
        overrideClassName="border border-separator bg-layer-floor-1 shadow-[0_0.125rem_0.375rem_rgba(0,0,0,0.16)]"
        icon={<ReCenter size="md" className="text-primary" />}
      />
    </div>
  )
}
