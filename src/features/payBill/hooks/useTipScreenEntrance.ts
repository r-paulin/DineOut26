import gsap from "gsap"
import { useLayoutEffect } from "react"
import type { RefObject } from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

const DUR = 0.32
const STAGGER = 0.06
const EASE = "power2.out"
const Y = 10

/**
 * Staggered fade-in (+ slight rise) for tip screen blocks on mount.
 */
export function useTipScreenEntrance(
  rootRef: RefObject<HTMLElement | null>,
  illustrationRef: RefObject<HTMLElement | null>,
  titleBlockRef: RefObject<HTMLElement | null>,
  tipRowRef: RefObject<HTMLElement | null>,
  footerRef: RefObject<HTMLElement | null>,
): void {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const els = [
      illustrationRef.current,
      titleBlockRef.current,
      tipRowRef.current,
      footerRef.current,
    ].filter(Boolean) as HTMLElement[]

    if (els.length === 0) return

    if (prefersReducedMotion()) {
      gsap.set(els, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(els, { opacity: 0, y: Y })
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: DUR,
        ease: EASE,
        stagger: STAGGER,
      })
    }, root)

    return () => ctx.revert()
    // One-shot entrance when Tip screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs + DOM targets only
  }, [])
}
