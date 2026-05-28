import gsap from "gsap"
import { useLayoutEffect, useRef } from "react"
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
  /** When true, lock content visible (custom tip sheet open) — no entrance replay. */
  modalOpen: boolean,
): void {
  const entranceDoneRef = useRef(false)

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

    const settleVisible = () => {
      gsap.killTweensOf(els)
      gsap.set(els, { opacity: 1, y: 0, clearProps: "opacity,y,transform" })
      entranceDoneRef.current = true
    }

    if (modalOpen || entranceDoneRef.current) {
      settleVisible()
      return
    }

    if (prefersReducedMotion()) {
      settleVisible()
      return
    }

    const alreadySettled = els.every((el) => {
      const opacity = Number(gsap.getProperty(el, "opacity"))
      return !Number.isNaN(opacity) && opacity >= 0.99
    })
    if (alreadySettled) {
      settleVisible()
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
        onComplete: settleVisible,
      })
    }, root)

    // Kill tweens without revert so opening overlays does not replay entrance.
    return () => {
      ctx.kill()
      settleVisible()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs + DOM targets only
  }, [modalOpen])
}
