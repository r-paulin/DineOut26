import type { MutableRefObject } from "react"
import { useCallback, useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import {
  EASE_EMPHASIZED_ENTER,
  EASE_EMPHASIZED_EXIT,
  MOTION_PUSH_S,
  registerMotion,
} from "@/shared/motion"
import { motionReduced } from "@/shared/motion/motionHelpers"
import { slideOffScreenXPx } from "@/shared/utils/slideOffScreenXPx"
import { slideOffScreenYPx } from "@/shared/utils/slideOffScreenYPx"

registerMotion()

/** GSAP `ease` for timeline tweens (string name or CustomEase output). */
export type SlidePanelEase = string | ((ratio: number) => number)

export interface UseSlideInPanelOptions {
  /** Slide axis: `x` from right (default), `y` from bottom. */
  axis?: "x" | "y"
  /** Defaults to {@link MOTION_PUSH_S}. */
  motionDurationS?: number
  /** Defaults to {@link EASE_EMPHASIZED_ENTER}. */
  easeEnter?: SlidePanelEase
  /** Defaults to {@link EASE_EMPHASIZED_EXIT}. */
  easeExit?: SlidePanelEase
  /** Target scrim opacity when open (0 = no visible dim). */
  scrimOpacity?: number
  /** Skip the enter tween (panel already at rest — e.g. staged under success). */
  skipEnter?: boolean
  staggerPanelAfterScrimS?: number
  staggerScrimAfterPanelExitS?: number
}

/**
 * GSAP slide-in panel + scrim fade for full-screen shell panels.
 * Horizontal: restaurant detail, search, pay picker. Keeps transforms off React
 * `style` so re-renders do not fight tweens. Respects `prefers-reduced-motion`.
 */
export function useSlideInPanel(
  options: UseSlideInPanelOptions,
  defaultOnCompleteRef: MutableRefObject<() => void>,
) {
  const {
    axis = "x",
    motionDurationS = MOTION_PUSH_S,
    easeEnter = EASE_EMPHASIZED_ENTER,
    easeExit = EASE_EMPHASIZED_EXIT,
    scrimOpacity = 0,
    skipEnter = false,
    staggerPanelAfterScrimS = 0,
    staggerScrimAfterPanelExitS = 0,
  } = options

  const rootRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const exitingRef = useRef(false)
  /** Only the first paint matters — unlocking a staged panel must not replay enter. */
  const skipEnterOnMountRef = useRef(skipEnter)

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

    if (skipEnterOnMountRef.current || motionReduced()) {
      gsap.set(scrim, { opacity: scrimOpacity })
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
          {
            opacity: scrimOpacity,
            duration: motionDurationS,
            ease: easeEnter,
          },
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
  }, [
    axis,
    motionDurationS,
    easeEnter,
    scrimOpacity,
    staggerPanelAfterScrimS,
  ])

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

      if (motionReduced() || !scrim || !panel) {
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
            ease: easeExit,
          },
          staggerScrimAfterPanelExitS,
        )
    },
    [
      axis,
      motionDurationS,
      easeExit,
      scrimOpacity,
      staggerScrimAfterPanelExitS,
      defaultOnCompleteRef,
    ],
  )

  return { rootRef, scrimRef, panelRef, runExit }
}
