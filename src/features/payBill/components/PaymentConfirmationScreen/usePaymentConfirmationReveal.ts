import gsap from "gsap"
import type { RefObject } from "react"
import { useLayoutEffect, useState } from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export type PaymentConfirmationPhase = "celebration" | "revealed"

const ENTRANCE_S = 1.05
/** Pause after hero settles before the summary sheet moves. */
const HOLD_BEFORE_SHEET_S = 0.55
const SHEET_IN_S = 0.78
const HERO_MORPH_S = 0.58

export interface UsePaymentConfirmationRevealArgs {
  rootRef: RefObject<HTMLElement | null>
  sheetRef: RefObject<HTMLElement | null>
  imgWrapRef: RefObject<HTMLElement | null>
  titleWrapRef: RefObject<HTMLElement | null>
}

export interface UsePaymentConfirmationRevealResult {
  phase: PaymentConfirmationPhase
}

/**
 * Figma 15767 → 15823: hero (check + title) eases into place slowly, short beat, then the
 * white sheet slides up with ease-out; compact morph runs after the sheet is in view.
 */
export function usePaymentConfirmationReveal({
  rootRef,
  sheetRef,
  imgWrapRef,
  titleWrapRef,
}: UsePaymentConfirmationRevealArgs): UsePaymentConfirmationRevealResult {
  const [phase, setPhase] = useState<PaymentConfirmationPhase>("celebration")

  useLayoutEffect(() => {
    const root = rootRef.current
    const sheet = sheetRef.current
    const imgWrap = imgWrapRef.current
    const titleWrap = titleWrapRef.current
    if (!root || !sheet || !imgWrap || !titleWrap) {
      return
    }

    if (prefersReducedMotion()) {
      gsap.set(root, { autoAlpha: 1 })
      gsap.set(sheet, { yPercent: 0 })
      gsap.set(imgWrap, { scale: 1, opacity: 1 })
      gsap.set(titleWrap, { autoAlpha: 1, scale: 1 })
      queueMicrotask(() => {
        setPhase("revealed")
      })
      return
    }

    gsap.set(sheet, { yPercent: 100 })
    gsap.set(root, { opacity: 0 })
    gsap.set(titleWrap, { autoAlpha: 0, scale: 1, y: 40 })
    gsap.set(imgWrap, { scale: 0.88, opacity: 0, y: 44 })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(root, { clearProps: "opacity" })
          gsap.set(imgWrap, { clearProps: "transform,opacity" })
          gsap.set(titleWrap, { clearProps: "transform,autoAlpha,opacity,visibility" })
          queueMicrotask(() => {
            setPhase("revealed")
          })
        },
      })

      tl.fromTo(
        root,
        { opacity: 0 },
        { opacity: 1, duration: ENTRANCE_S, ease: "power2.out" },
        0,
      )
      tl.fromTo(
        imgWrap,
        { scale: 0.88, opacity: 0, y: 44 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: ENTRANCE_S,
          ease: "power2.out",
        },
        0,
      )
      tl.fromTo(
        titleWrap,
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: ENTRANCE_S * 0.92,
          ease: "power2.out",
        },
        0.08,
      )
      tl.to({}, { duration: HOLD_BEFORE_SHEET_S })
      tl.to(sheet, {
        yPercent: 0,
        duration: SHEET_IN_S,
        ease: "power2.out",
      })
      tl.to(
        imgWrap,
        {
          scale: 0.4,
          transformOrigin: "50% 50%",
          duration: HERO_MORPH_S,
          ease: "power2.out",
        },
        ">",
      )
      tl.to(
        titleWrap,
        {
          scale: 0.4,
          transformOrigin: "50% 50%",
          duration: HERO_MORPH_S,
          ease: "power2.out",
        },
        "<",
      )
    }, root)

    return () => {
      ctx.revert()
    }
  }, [rootRef, sheetRef, imgWrapRef, titleWrapRef])

  return { phase }
}
