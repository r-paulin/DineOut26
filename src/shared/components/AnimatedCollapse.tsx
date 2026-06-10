import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react"
import {
  MOTION_IN_PAGE_S,
  MOTION_REDUCED_S,
  MOTION_SHEET_DISMISS_S,
} from "@/shared/motion/motionDurations"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

/** Apple HIG emphasized deceleration (enter). */
const EASE_EMPHASIZED_ENTER_CSS = "cubic-bezier(0.32, 0.72, 0, 1)"
/** Apple HIG emphasized acceleration (exit). */
const EASE_EMPHASIZED_EXIT_CSS = "cubic-bezier(0.58, 0, 0.92, 0.36)"

const ENTER_MS = Math.round(MOTION_IN_PAGE_S * 1000)
const EXIT_MS = Math.round(MOTION_SHEET_DISMISS_S * 1000)
const REDUCED_MS = Math.round(MOTION_REDUCED_S * 1000)

export interface AnimatedCollapseProps {
  visible: boolean
  children: ReactNode
  className?: string
}

/**
 * iOS-style height collapse (grid 0fr/1fr) with opacity + slight vertical shift.
 * Keeps children mounted until the exit transition finishes.
 */
export function AnimatedCollapse({
  visible,
  children,
  className,
}: AnimatedCollapseProps) {
  const reducedMotion = prefersReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const animationGenerationRef = useRef(0)
  const contentRef = useRef<ReactNode>(null)

  if (visible && children != null) {
    contentRef.current = children
  }

  useLayoutEffect(() => {
    animationGenerationRef.current += 1
    const generation = animationGenerationRef.current

    if (visible) {
      setMounted(true)

      if (reducedMotion) {
        setOpen(true)
        return
      }

      setOpen(false)
      let innerFrame = 0
      const outerFrame = requestAnimationFrame(() => {
        innerFrame = requestAnimationFrame(() => {
          if (animationGenerationRef.current !== generation) return
          setOpen(true)
        })
      })
      return () => {
        cancelAnimationFrame(outerFrame)
        cancelAnimationFrame(innerFrame)
      }
    }

    setOpen(false)
    if (reducedMotion) {
      setMounted(false)
    }
  }, [visible, reducedMotion])

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "grid-template-rows") return
    if (event.target !== event.currentTarget) return
    if (open || visible) return
    setMounted(false)
  }

  const durationMs = reducedMotion ? REDUCED_MS : open ? ENTER_MS : EXIT_MS
  const easing = reducedMotion
    ? "ease-out"
    : open
      ? EASE_EMPHASIZED_ENTER_CSS
      : EASE_EMPHASIZED_EXIT_CSS

  const transitionStyle = {
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: easing,
  }

  const gridClass = [
    "grid overflow-hidden",
    reducedMotion ? "" : "transition-[grid-template-rows]",
    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const innerClass = [
    reducedMotion ? "" : "transition-[opacity,transform]",
    open ?
      "translate-y-0 scale-100 opacity-100"
    : "-translate-y-1 scale-[0.98] opacity-0",
  ]
    .filter(Boolean)
    .join(" ")

  if (!mounted && !visible) return null

  return (
    <div
      className={gridClass}
      style={transitionStyle}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden={!open && !visible}
    >
      <div className="min-h-0 overflow-hidden">
        {mounted && contentRef.current != null ?
          <div className={innerClass} style={transitionStyle}>
            {contentRef.current}
          </div>
        : null}
      </div>
    </div>
  )
}
