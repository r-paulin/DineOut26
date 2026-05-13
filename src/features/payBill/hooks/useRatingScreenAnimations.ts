import gsap from "gsap"
import { useLayoutEffect, useRef } from "react"
import type { RefObject } from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

/**
 * One-shot GSAP entrance on the hero illustration wrapper when the rating step mounts.
 */
export function useRatingScreenHeroEntrance(
  heroRef: RefObject<HTMLElement | null>,
): void {
  useLayoutEffect(() => {
    const el = heroRef.current
    if (!el) return
    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, scale: 1, y: 0 })
      return
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, scale: 0.94, y: 14 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "power2.out" },
      )
    }, el)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only hero intro
  }, [])
}

/**
 * When the user first selects a star (0 → ≥1), fade/slide in the feedback field + footer.
 */
export function useRatingScreenRevealOnStars(
  revealedRef: RefObject<HTMLElement | null>,
  stars: number,
): void {
  const prevStars = useRef(0)

  useLayoutEffect(() => {
    const el = revealedRef.current
    const was = prevStars.current
    prevStars.current = stars

    if (stars < 1 || was > 0 || !el) return

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0 })
      return
    }
    gsap.killTweensOf(el)
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.36, ease: "power2.out" },
    )
  }, [stars])
}
