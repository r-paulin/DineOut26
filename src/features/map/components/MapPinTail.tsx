export interface MapPinTailProps {
  /** Selected map pin (Figma 15809:12977) — tail matches green pill. */
  selected?: boolean
}

/** Small pointed tail under a map pin bubble. SVG kept inline (bespoke shape). */
export function MapPinTail({ selected }: MapPinTailProps) {
  const fill = selected ? "var(--map-pin-selected)" : "white"
  return (
    <div className="w-4 h-2 relative z-[1] -mt-0.5" aria-hidden>
      <svg viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full h-full">
        <path
          d="M8 8C8 8 1.5 2.5 0 0H16C14.5 2.5 8 8 8 8Z"
          fill={fill}
          stroke="rgba(0,45,30,0.06)"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  )
}
