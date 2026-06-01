import type { MutableRefObject } from "react"
import { useCallback, useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"
import { slideOffScreenXPx } from "@/shared/utils/slideOffScreenXPx"
import { slideOffScreenYPx } from "@/shared/utils/slideOffScreenYPx"

gsap.registerPlugin(CustomEase)

/** GSAP `ease` for timeline tweens (string name or CustomEase output). */
export type SlidePanelEase = string | ((ratio: number) => number)

export interface UseSlideInPanelOptions {
  /** Slide axis: `x` from right (default), `y` from bottom. */
  axis?: "x" | "y"
  motionDurationS: number
  easeEnter: SlidePanelEase
  easeExit: SlidePanelEase
  staggerPanelAfterScrimS?: number
  staggerScrimAfterPanelExitS?: number
}

/**
 * GSAP slide-in panel + scrim fade for full-screen shell panels.
 * Horizontal: restaurant detail, pay picker. Vertical: claimed offer.
 * Keeps transforms off React `style` so re-renders do not fight tweens.
 */
export function useSlideInPanel(
  options: UseSlideInPanelOptions,
  defaultOnCompleteRef: MutableRefObject<() => void>,
) {
  const {
    axis = "x",
    motionDurationS,
    easeEnter,
    easeExit,
    staggerPanelAfterScrimS = 0,
    staggerScrimAfterPanelExitS = 0,
  } = options

  const rootRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const exitingRef = useRef(false)

  useLayoutEffect(() => {
    const root = rootRef.current
    const scrim = scrimRef.current
    const panel = panelRef.current
    if (!root || !scrim || !panel) return

    const offProp = axis === "y" ? "y" : "x"
    const offValue =
      axis === "y" ?
        slideOffScreenYPx(panel, root)
      : slideOffScreenXPx(panel, root)

    if (prefersReducedMotion()) {
      gsap.set(scrim, { opacity: 1 })
      gsap.set(panel, { [offProp]: 0, clearProps: "transform" })
      return
    }

    gsap.set(scrim, { opacity: 0 })
    gsap.set(panel, { [offProp]: offValue, force3D: true })

    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .to(
          scrim,
          { opacity: 1, duration: motionDurationS, ease: "sine.out" },
          0,
        )
        .to(
          panel,
          {
            [offProp]: 0,
            duration: motionDurationS,
            ease: easeEnter,
            force3D: true,
          },
          staggerPanelAfterScrimS,
        )
    }, root)

    return () => {
      ctx.revert()
    }
  }, [axis, motionDurationS, easeEnter, staggerPanelAfterScrimS])

  const runExit = useCallback(
    (after?: () => void) => {
      if (exitingRef.current) return
      exitingRef.current = true

      const scrim = scrimRef.current
      const panel = panelRef.current
      const root = rootRef.current
      const finish = () => {
        exitingRef.current = false
        ;(after ?? defaultOnCompleteRef.current)()
      }

      if (prefersReducedMotion() || !scrim || !panel) {
        finish()
        return
      }

      const offProp = axis === "y" ? "y" : "x"
      const offValue =
        axis === "y" ?
          slideOffScreenYPx(panel, root)
        : slideOffScreenXPx(panel, root)

      gsap.killTweensOf([scrim, panel])
      gsap
        .timeline({
          onComplete: finish,
          onInterrupt: () => {
            exitingRef.current = false
            finish()
          },
        })
        .to(
          panel,
          {
            [offProp]: offValue,
            duration: motionDurationS,
            ease: easeExit,
            force3D: true,
          },
          0,
        )
        .to(
          scrim,
          {
            opacity: 0,
            duration: motionDurationS,
            ease: "sine.in",
          },
          staggerScrimAfterPanelExitS,
        )
    },
    [
      axis,
      motionDurationS,
      easeExit,
      staggerScrimAfterPanelExitS,
      defaultOnCompleteRef,
    ],
  )

  return { rootRef, scrimRef, panelRef, runExit }
}
