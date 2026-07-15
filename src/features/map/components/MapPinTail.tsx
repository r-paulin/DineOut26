export type MapPinTailTone = "normal" | "selected" | "closed"

export interface MapPinTailProps {
  /** Figma `19206:45778` — tail fill matches pill surface. */
  tone?: MapPinTailTone
}

/** Small pointed tail under a map pin bubble. SVG kept inline (bespoke shape). */
export function MapPinTail({ tone = "normal" }: MapPinTailProps) {
  const colorClass =
    tone === "selected" ? "text-neutral-primary"
    : tone === "closed" ? "text-[#e5e8e7]"
    : "text-[var(--layer-floor-1,#fff)]"

  return (
    <div
      className={`relative z-[1] h-2 w-4 ${colorClass}`}
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
        />
      </svg>
    </div>
  )
}
