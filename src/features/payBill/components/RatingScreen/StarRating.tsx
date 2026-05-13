import Star from "@bolteu/kalep-react-icons/dist/Star"
import StarOutlined from "@bolteu/kalep-react-icons/dist/StarOutlined"
import gsap from "gsap"
import { useCallback, useRef } from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export interface StarRatingProps {
  value: number
  onChange: (value: number) => void
}

/** Figma Consumer Dine-out stars: filled uses `--color-bg-warning-primary` (warm amber), empty outline `text-tertiary`. */
const STAR_FILL_CLASS = "text-[color:var(--color-bg-warning-primary)]"

/**
 * 1–5 stars (48px hit targets, 4px gap); tap toggles down per PRD (same star deselects step).
 */
export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="relative flex w-full shrink-0 flex-nowrap items-start justify-center gap-1">
      {([1, 2, 3, 4, 5] as const).map((i) => (
        <StarButton
          key={i}
          index={i}
          filled={value >= i}
          value={value}
          onChange={onChange}
        />
      ))}
    </div>
  )
}

function StarButton({
  index,
  filled,
  value,
  onChange,
}: {
  index: 1 | 2 | 3 | 4 | 5
  filled: boolean
  value: number
  onChange: (v: number) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const handle = useCallback(() => {
    const el = ref.current
    if (el && !prefersReducedMotion()) {
      gsap.killTweensOf(el)
      gsap.fromTo(
        el,
        { scale: 1 },
        { scale: 1.2, duration: 0.075, yoyo: true, repeat: 1, ease: "power2.out" },
      )
    }
    if (value === index) {
      onChange(index === 1 ? 0 : index - 1)
    } else {
      onChange(index)
    }
  }, [index, onChange, value])

  const Icon = filled ? Star : StarOutlined
  return (
    <button
      ref={ref}
      type="button"
      className="flex size-12 shrink-0 items-center justify-center rounded-md border-none bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
      aria-label={`${index} star${index > 1 ? "s" : ""}`}
      onClick={handle}
    >
      <Icon
        size="xl"
        className={filled ? STAR_FILL_CLASS : "text-tertiary"}
        aria-hidden
      />
    </button>
  )
}
