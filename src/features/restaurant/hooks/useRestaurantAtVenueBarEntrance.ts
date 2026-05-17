import gsap from "gsap"
import type { RefObject } from "react"
import { useLayoutEffect } from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

/** Matches {@link RestaurantDetailScreen} `DETAIL_MOTION_S` push enter. */
const DETAIL_PANEL_ENTER_S = 0.6
const ENTRANCE_DELAY_AFTER_PANEL_S = 0.12
const ENTRANCE_DURATION_S = 0.5

/**
 * Fade/slide the fixed “I'm at the venue” button up after the detail panel enter
 * animation finishes (bar shell / gradient stays visible).
 */
export function useRestaurantAtVenueBarEntrance(
  buttonRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useLayoutEffect(() => {
    if (!enabled) return
    const el = buttonRef.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0, clearProps: "transform,opacity,visibility" })
      return
    }

    const delay =
      DETAIL_PANEL_ENTER_S + ENTRANCE_DELAY_AFTER_PANEL_S

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 24, force3D: true },
        {
          autoAlpha: 1,
          y: 0,
          duration: ENTRANCE_DURATION_S,
          delay,
          ease: "power2.out",
          force3D: true,
        },
      )
    }, el)

    return () => {
      ctx.revert()
      gsap.killTweensOf(el)
    }
  }, [buttonRef, enabled])
}
