import gsap from "gsap"
import { useCallback, useLayoutEffect, useRef, type RefObject } from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

/** Matches {@link RestaurantDetailScreen} `DETAIL_MOTION_S` push enter. */
const DETAIL_PANEL_ENTER_S = 0.6
const ENTRANCE_DELAY_AFTER_PANEL_S = 0.12
const ENTRANCE_DURATION_S = 0.5
/** Fade the footer shell out with the detail panel dismiss. */
const EXIT_DURATION_S = 0.35

/**
 * Fade/slide the full “I'm at the venue” footer shell (background + content)
 * after the detail panel enter animation. Previously only the inner column
 * animated while `bg-layer-floor-1` on the shell stayed opaque — that caused
 * an empty bar flash on enter and a solid slab glitch on exit.
 */
export function useRestaurantAtVenueBarEntrance(
  shellRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): { runExit: () => void } {
  const exitingRef = useRef(false)

  const runExit = useCallback(() => {
    const el = shellRef.current
    if (!el || exitingRef.current) return
    exitingRef.current = true

    gsap.killTweensOf(el)

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 0, visibility: "hidden" })
      return
    }

    gsap.to(el, {
      autoAlpha: 0,
      y: 12,
      duration: EXIT_DURATION_S,
      ease: "power2.in",
      force3D: true,
    })
  }, [shellRef])

  useLayoutEffect(() => {
    exitingRef.current = false
    const el = shellRef.current
    if (!el) return

    if (!enabled) {
      gsap.killTweensOf(el)
      gsap.set(el, { autoAlpha: 0, visibility: "hidden", clearProps: "transform" })
      return
    }

    if (prefersReducedMotion()) {
      gsap.set(el, {
        autoAlpha: 1,
        y: 0,
        visibility: "visible",
        clearProps: "transform,opacity,visibility",
      })
      return
    }

    const delay = DETAIL_PANEL_ENTER_S + ENTRANCE_DELAY_AFTER_PANEL_S

    gsap.killTweensOf(el)
    gsap.set(el, { autoAlpha: 0, y: 24, visibility: "visible", force3D: true })

    const ctx = gsap.context(() => {
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: ENTRANCE_DURATION_S,
        delay,
        ease: "power2.out",
        force3D: true,
      })
    }, el)

    return () => {
      ctx.revert()
      gsap.killTweensOf(el)
    }
  }, [shellRef, enabled])

  return { runExit }
}
