import gsap from "gsap"
import type { RefObject } from "react"
import { useLayoutEffect, useState } from "react"
import { readAppHeightPx } from "@/features/offers/utils/bottomSheetLayout"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export type PaymentConfirmationPhase = "celebration" | "revealed"

const ENTRANCE_S = 0.6
const HOLD_AFTER_ENTRANCE_S = 1
const SHEET_IN_S = 0.75
const TITLE_HIDE_S = 0.2
const HERO_MORPH_S = 0.75

/** Final checkmark size once summary sheet is visible. */
export const PAY_SUCCESS_CHECKMARK_FINAL_PX = 124
const HERO_FINAL_SCALE = PAY_SUCCESS_CHECKMARK_FINAL_PX / 180

/** Matches `--heading-s-line-height` (30px) + small buffer for celebration title slot. */
const CELEBRATION_TITLE_SLOT_MIN_PX = 40

function measureCelebrationTitleSlotPx(el: HTMLElement): number {
  return Math.max(el.scrollHeight, CELEBRATION_TITLE_SLOT_MIN_PX)
}

/** Space reserved for the receipt sheet — matches `max-h-[min(72vh,calc(var(--app-h)*0.72))]`. */
function getConfirmSheetInsetPx(sheet: HTMLElement): number {
  const appH = readAppHeightPx()
  const viewportCap =
    typeof window !== "undefined"
      ? Math.min(window.innerHeight * 0.72, appH * 0.72)
      : appH * 0.72
  const measured = Math.max(sheet.offsetHeight, sheet.getBoundingClientRect().height)
  return Math.min(measured, viewportCap)
}

export interface UsePaymentConfirmationRevealArgs {
  rootRef: RefObject<HTMLElement | null>
  heroBandRef: RefObject<HTMLElement | null>
  imgWrapRef: RefObject<HTMLElement | null>
  titleCelebrationRef: RefObject<HTMLElement | null>
  titleSlotRef: RefObject<HTMLElement | null>
  sheetRef: RefObject<HTMLElement | null>
}

export interface UsePaymentConfirmationRevealResult {
  phase: PaymentConfirmationPhase
}

/**
 * Large centered check on green → 1s hold → sheet up + hero band compresses →
 * checkmark scales down; title hides and its slot collapses.
 */
export function usePaymentConfirmationReveal({
  rootRef,
  heroBandRef,
  imgWrapRef,
  titleCelebrationRef,
  titleSlotRef,
  sheetRef,
}: UsePaymentConfirmationRevealArgs): UsePaymentConfirmationRevealResult {
  const [phase, setPhase] = useState<PaymentConfirmationPhase>("celebration")

  useLayoutEffect(() => {
    const root = rootRef.current
    const heroBand = heroBandRef.current
    const imgWrap = imgWrapRef.current
    const titleCelebration = titleCelebrationRef.current
    const titleSlot = titleSlotRef.current
    const sheet = sheetRef.current
    if (
      !root ||
      !heroBand ||
      !imgWrap ||
      !titleCelebration ||
      !titleSlot ||
      !sheet
    ) {
      return
    }

    const measureSheetInset = () => getConfirmSheetInsetPx(sheet)

    if (prefersReducedMotion()) {
      const sheetInsetPx = measureSheetInset()
      gsap.set(heroBand, { bottom: sheetInsetPx })
      gsap.set(sheet, { yPercent: 0 })
      gsap.set(imgWrap, {
        opacity: 1,
        y: 0,
        scale: HERO_FINAL_SCALE,
        transformOrigin: "50% 50%",
        force3D: true,
      })
      gsap.set(titleCelebration, { display: "none" })
      gsap.set(titleSlot, { height: 0, marginTop: 0, overflow: "hidden" })
      queueMicrotask(() => {
        setPhase("revealed")
      })
      return
    }

    gsap.set(heroBand, { bottom: 0 })
    gsap.set(sheet, { yPercent: 100 })
    const titleSlotHeightPx = measureCelebrationTitleSlotPx(titleCelebration)
    gsap.set(titleSlot, {
      height: titleSlotHeightPx,
      marginTop: 0,
      overflow: "hidden",
    })
    gsap.set(titleCelebration, { autoAlpha: 0 })
    gsap.set(imgWrap, {
      opacity: 0,
      y: 44,
      scale: 1,
      transformOrigin: "50% 50%",
      force3D: true,
    })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          const sheetInsetPx = measureSheetInset()
          gsap.set(heroBand, { bottom: sheetInsetPx })
          gsap.set(sheet, { yPercent: 0 })
          gsap.set(titleCelebration, { display: "none" })
          gsap.set(titleSlot, { height: 0, marginTop: 0, overflow: "hidden" })
          gsap.set(imgWrap, { clearProps: "opacity" })
          queueMicrotask(() => {
            setPhase("revealed")
          })
        },
      })

      tl.to(imgWrap, {
        opacity: 1,
        y: 0,
        duration: ENTRANCE_S,
        ease: "power2.out",
        force3D: true,
      })
      tl.to(
        titleCelebration,
        {
          autoAlpha: 1,
          duration: ENTRANCE_S,
          ease: "power2.out",
        },
        0.08,
      )

      tl.to({}, { duration: HOLD_AFTER_ENTRANCE_S })

      tl.add("sheetStart")
      tl.call(
        () => {
          const sheetInsetPx = measureSheetInset()
          gsap.to(heroBand, {
            bottom: sheetInsetPx,
            duration: SHEET_IN_S,
            ease: "power2.out",
            overwrite: "auto",
          })
          gsap.to(sheet, {
            yPercent: 0,
            duration: SHEET_IN_S,
            ease: "power2.out",
            overwrite: "auto",
          })
        },
        [],
        "sheetStart",
      )
      tl.to(
        titleCelebration,
        { autoAlpha: 0, duration: TITLE_HIDE_S, ease: "power2.out" },
        "sheetStart",
      )
      tl.to(
        titleSlot,
        {
          height: 0,
          marginTop: 0,
          duration: TITLE_HIDE_S,
          ease: "power2.out",
        },
        "sheetStart",
      )
      tl.to(
        imgWrap,
        {
          scale: HERO_FINAL_SCALE,
          y: 0,
          duration: HERO_MORPH_S,
          ease: "power2.inOut",
          force3D: true,
        },
        "sheetStart",
      )
      tl.set(
        titleCelebration,
        { display: "none" },
        `sheetStart+=${TITLE_HIDE_S}`,
      )
    }, root)

    return () => {
      ctx.revert()
      gsap.set(heroBand, { clearProps: "all" })
      gsap.set(sheet, { clearProps: "all" })
      gsap.set(imgWrap, { clearProps: "all" })
      gsap.set(titleCelebration, { clearProps: "all" })
      gsap.set(titleSlot, { clearProps: "all" })
    }
  }, [
    rootRef,
    heroBandRef,
    imgWrapRef,
    titleCelebrationRef,
    titleSlotRef,
    sheetRef,
  ])

  return { phase }
}
