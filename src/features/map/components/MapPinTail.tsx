export interface MapPinTailProps {
  /** Selected map pin (Figma 15809:12977) — tail matches dark pill. */
  selected?: boolean
}

/** Small pointed tail under a map pin bubble. SVG kept inline (bespoke shape). */
export function MapPinTail({ selected }: MapPinTailProps) {
  return (
    <div
      className={`relative z-[1] -mt-0.5 h-2 w-4 ${selected ? "text-neutral-primary" : "text-layer-floor-1"}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 16 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-full w-full"
      >
        <path
          d="M8 8C8 8 1.5 2.5 0 0H16C14.5 2.5 8 8 8 8Z"
          fill="currentColor"
          stroke={selected ? "none" : "rgba(0,45,30,0.06)"}
          strokeWidth={selected ? 0 : 0.5}
        />
      </svg>
    </div>
  )
}
