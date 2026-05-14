import gsap from "gsap"
import type { RefObject } from "react"
import { useLayoutEffect, useState } from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export type PaymentConfirmationPhase = "celebration" | "revealed"

const ENTRANCE_S = 0.55
const HOLD_AFTER_ENTRANCE_S = 1.45
const SHEET_IN_S = 0.62
const HERO_MORPH_S = 0.55

export interface UsePaymentConfirmationRevealArgs {
  rootRef: RefObject<HTMLElement | null>
  sheetRef: RefObject<HTMLElement | null>
  clusterRef: RefObject<HTMLElement | null>
  imgWrapRef: RefObject<HTMLElement | null>
  titleLargeWrapRef: RefObject<HTMLElement | null>
  titleSmallWrapRef: RefObject<HTMLElement | null>
}

export interface UsePaymentConfirmationRevealResult {
  phase: PaymentConfirmationPhase
}

/**
 * Figma 15767 → 15823: entrance on the hero, 2s beat, then sheet slides up while the
 * checkmark scales 180→72 and the title crossfades to Heading XS.
 */
export function usePaymentConfirmationReveal({
  rootRef,
  sheetRef,
  clusterRef,
  imgWrapRef,
  titleLargeWrapRef,
  titleSmallWrapRef,
}: UsePaymentConfirmationRevealArgs): UsePaymentConfirmationRevealResult {
  const [phase, setPhase] = useState<PaymentConfirmationPhase>("celebration")

  useLayoutEffect(() => {
    const root = rootRef.current
    const sheet = sheetRef.current
    const cluster = clusterRef.current
    const imgWrap = imgWrapRef.current
    const titleLargeWrap = titleLargeWrapRef.current
    const titleSmallWrap = titleSmallWrapRef.current
    if (
      !root ||
      !sheet ||
      !cluster ||
      !imgWrap ||
      !titleLargeWrap ||
      !titleSmallWrap
    ) {
      return
    }

    if (prefersReducedMotion()) {
      gsap.set(sheet, { yPercent: 0 })
      gsap.set(imgWrap, { scale: 1, opacity: 1 })
      gsap.set(titleLargeWrap, { autoAlpha: 0 })
      gsap.set(titleSmallWrap, { autoAlpha: 1 })
      queueMicrotask(() => {
        setPhase("revealed")
      })
      return
    }

    gsap.set(sheet, { yPercent: 100 })
    gsap.set(titleSmallWrap, { autoAlpha: 0 })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(cluster, { clearProps: "transform" })
          gsap.set(imgWrap, { clearProps: "transform" })
          gsap.set(titleLargeWrap, { clearProps: "autoAlpha,opacity,visibility" })
          gsap.set(titleSmallWrap, { clearProps: "autoAlpha,opacity,visibility" })
          queueMicrotask(() => {
            setPhase("revealed")
          })
        },
      })

      tl.fromTo(
        imgWrap,
        { scale: 0.72, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: ENTRANCE_S,
          ease: "back.out(1.25)",
        },
      )
      tl.to({}, { duration: HOLD_AFTER_ENTRANCE_S })
      tl.to(
        sheet,
        { yPercent: 0, duration: SHEET_IN_S, ease: "power3.out" },
        "<0.08",
      )
      tl.to(
        imgWrap,
        {
          scale: 0.4,
          transformOrigin: "50% 50%",
          duration: HERO_MORPH_S,
          ease: "power2.out",
        },
        "<",
      )
      tl.to(
        cluster,
        { y: -88, duration: HERO_MORPH_S, ease: "power2.inOut" },
        "<",
      )
      tl.to(titleLargeWrap, { autoAlpha: 0, duration: 0.22 }, "<0.12")
      tl.to(titleSmallWrap, { autoAlpha: 1, duration: 0.28 }, "<0.1")
    }, root)

    return () => {
      ctx.revert()
    }
  }, [
    rootRef,
    sheetRef,
    clusterRef,
    imgWrapRef,
    titleLargeWrapRef,
    titleSmallWrapRef,
  ])

  return { phase }
}
