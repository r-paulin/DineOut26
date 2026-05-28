import gsap from "gsap"
import { useLayoutEffect, useRef } from "react"
import type { RefObject } from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

const DUR = 0.32
const STAGGER = 0.06
const EASE = "power2.out"
const Y = 10

function collectEntranceElements(
  illustrationRef: RefObject<HTMLElement | null>,
  titleBlockRef: RefObject<HTMLElement | null>,
  tipRowRef: RefObject<HTMLElement | null>,
  footerRef: RefObject<HTMLElement | null>,
): HTMLElement[] {
  return [
    illustrationRef.current,
    titleBlockRef.current,
    tipRowRef.current,
    footerRef.current,
  ].filter(Boolean) as HTMLElement[]
}

function settleEntranceElements(els: HTMLElement[]): void {
  gsap.killTweensOf(els)
  gsap.set(els, { opacity: 1, y: 0, clearProps: "opacity,y,transform" })
}

/**
 * Staggered fade-in (+ slight rise) for tip screen blocks on mount only.
 * Opening the custom-tip sheet must not re-run this effect (see {@link useTipScreenEntranceLock}).
 */
export function useTipScreenEntrance(
  rootRef: RefObject<HTMLElement | null>,
  illustrationRef: RefObject<HTMLElement | null>,
  titleBlockRef: RefObject<HTMLElement | null>,
  tipRowRef: RefObject<HTMLElement | null>,
  footerRef: RefObject<HTMLElement | null>,
): void {
  const entranceDoneRef = useRef(false)
  const ctxRef = useRef<gsap.Context | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const els = collectEntranceElements(
      illustrationRef,
      titleBlockRef,
      tipRowRef,
      footerRef,
    )
    if (els.length === 0) return

    const settleVisible = () => {
      ctxRef.current?.kill()
      ctxRef.current = null
      settleEntranceElements(els)
      entranceDoneRef.current = true
    }

    if (entranceDoneRef.current || prefersReducedMotion()) {
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

    ctxRef.current = gsap.context(() => {
      gsap.set(els, { opacity: 0, y: Y })
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: DUR,
        ease: EASE,
        stagger: STAGGER,
        onComplete: () => {
          ctxRef.current = null
          settleVisible()
        },
      })
    }, root)

    return () => {
      ctxRef.current?.kill()
      ctxRef.current = null
      settleVisible()
    }
    // One-shot entrance when Tip screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs + DOM targets only
  }, [])
}

/** Snap tip content visible while the custom-tip sheet is open (no entrance replay). */
export function useTipScreenEntranceLock(
  illustrationRef: RefObject<HTMLElement | null>,
  titleBlockRef: RefObject<HTMLElement | null>,
  tipRowRef: RefObject<HTMLElement | null>,
  footerRef: RefObject<HTMLElement | null>,
  modalOpen: boolean,
): void {
  useLayoutEffect(() => {
    if (!modalOpen) return
    const els = collectEntranceElements(
      illustrationRef,
      titleBlockRef,
      tipRowRef,
      footerRef,
    )
    if (els.length === 0) return
    settleEntranceElements(els)
  }, [
    footerRef,
    illustrationRef,
    modalOpen,
    tipRowRef,
    titleBlockRef,
  ])
}
