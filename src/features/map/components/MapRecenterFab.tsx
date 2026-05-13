import MyLocationIos from "@bolteu/kalep-react-icons/dist/MyLocationIos"

export interface MapRecenterFabProps {
  visible: boolean
  bottomPx: number
  onClick: () => void
}

/**
 * Figma Consumer Dine-out `15838:19194` — `[Eater] Icon-Nav-Button`: 48×48 white
 * circle, {@link MyLocationIos}, elevation `0px 2px 3px rgba(0,0,0,0.16)`.
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
      <button
        type="button"
        data-no-press
        aria-label="Re-centre map on your location"
        onClick={onClick}
        className="relative flex size-12 cursor-pointer items-center justify-center rounded-full border-none bg-layer-floor-1 p-0 text-primary outline-none drop-shadow-[0px_2px_3px_rgba(0,0,0,0.16)] transition-colors hover:bg-active-neutral-secondary focus-visible:ring-2 focus-visible:ring-action-primary"
      >
        <MyLocationIos size="md" className="text-primary" aria-hidden />
      </button>
    </div>
  )
}
