import gsap from "gsap"
import { useCallback, useLayoutEffect, useRef, type RefObject } from "react"
import {
  EASE_STANDARD_OUT,
  MOTION_IN_PAGE_S,
  MOTION_SHEET_DISMISS_S,
  MOTION_VENUE_BAR_DELAY_S,
} from "@/shared/motion"
import { motionReduced } from "@/shared/motion/motionHelpers"

/**
 * Fade/slide the full “I'm at the venue” footer shell after detail panel enter.
 * Exit resolves only after the bar (promo + CTA) has fully left.
 */
export function useRestaurantAtVenueBarEntrance(
  shellRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): { runExit: () => Promise<void> } {
  const exitingRef = useRef(false)

  const runExit = useCallback((): Promise<void> => {
    const el = shellRef.current
    if (!el) return Promise.resolve()
    if (exitingRef.current) {
      return new Promise((resolve) => {
        const tween = gsap.getTweensOf(el)[0]
        if (tween) {
          tween.eventCallback("onComplete", () => resolve())
          tween.eventCallback("onInterrupt", () => resolve())
        } else {
          resolve()
        }
      })
    }
    exitingRef.current = true

    gsap.killTweensOf(el)

    if (motionReduced()) {
      gsap.set(el, { autoAlpha: 0, visibility: "hidden" })
      return Promise.resolve()
    }

    const slideY = Math.max(el.offsetHeight, 48)

    return new Promise((resolve) => {
      gsap.to(el, {
        autoAlpha: 0,
        y: slideY,
        duration: MOTION_SHEET_DISMISS_S,
        ease: EASE_STANDARD_OUT,
        force3D: true,
        onComplete: () => {
          gsap.set(el, { visibility: "hidden" })
          resolve()
        },
        onInterrupt: () => resolve(),
      })
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

    if (motionReduced()) {
      gsap.set(el, {
        autoAlpha: 1,
        y: 0,
        visibility: "visible",
        clearProps: "transform,opacity,visibility",
      })
      return
    }

    gsap.killTweensOf(el)
    gsap.set(el, { autoAlpha: 0, y: 24, visibility: "visible", force3D: true })

    const ctx = gsap.context(() => {
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: MOTION_IN_PAGE_S,
        delay: MOTION_VENUE_BAR_DELAY_S,
        ease: EASE_STANDARD_OUT,
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
