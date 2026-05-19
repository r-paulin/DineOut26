import gsap from "gsap"
import type { RefObject } from "react"
import { useLayoutEffect, useState } from "react"
import {
  heroBandHeightForSheetInset,
  measureConfirmSheetInsetPx,
  measureHeroHostHeightPx,
} from "@/features/payBill/components/PaymentConfirmationScreen/paymentConfirmationLayout"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export type PaymentConfirmationPhase = "celebration" | "revealed"

const ENTRANCE_S = 0.6
const HOLD_AFTER_ENTRANCE_S = 2
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

function forceReflow(el: HTMLElement): void {
  void el.offsetHeight
}

function applyHeroBandHeight(heroBand: HTMLElement, sheetInsetPx: number): void {
  const hostH = measureHeroHostHeightPx(heroBand)
  const heightPx = heroBandHeightForSheetInset(hostH, sheetInsetPx)
  gsap.set(heroBand, {
    top: 0,
    left: 0,
    right: 0,
    bottom: "auto",
    height: heightPx,
    width: "100%",
  })
}

function applyHeroBandFull(heroBand: HTMLElement): void {
  const hostH = measureHeroHostHeightPx(heroBand)
  gsap.set(heroBand, {
    top: 0,
    left: 0,
    right: 0,
    bottom: "auto",
    height: hostH,
    width: "100%",
  })
}

function measureSheetInset(sheet: HTMLElement): number {
  forceReflow(sheet)
  return measureConfirmSheetInsetPx(sheet)
}

function isSheetRevealed(sheet: HTMLElement): boolean {
  const y = gsap.getProperty(sheet, "yPercent")
  return y === 0 || y === "0"
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

    const host = heroBand.parentElement

    const syncHeroToSheet = () => {
      if (!isSheetRevealed(sheet)) return
      applyHeroBandHeight(heroBand, measureSheetInset(sheet))
    }

    let ctx: gsap.Context | null = null

    if (prefersReducedMotion()) {
      applyHeroBandHeight(heroBand, measureSheetInset(sheet))
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
    } else {
      applyHeroBandFull(heroBand)
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

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            applyHeroBandHeight(heroBand, measureSheetInset(sheet))
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
            const sheetInsetPx = measureSheetInset(sheet)
            const hostH = measureHeroHostHeightPx(heroBand)
            const targetH = heroBandHeightForSheetInset(hostH, sheetInsetPx)
            gsap.to(heroBand, {
              height: targetH,
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
    }

    const resizeObserver =
      host && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            syncHeroToSheet()
          })
        : null
    if (host) resizeObserver?.observe(host)
    resizeObserver?.observe(sheet)

    return () => {
      resizeObserver?.disconnect()
      ctx?.revert()
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
