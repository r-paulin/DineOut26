import gsap from "gsap"
import type { RefObject } from "react"
import { useLayoutEffect, useState } from "react"
import {
  heroBandHeightForSheetInset,
  measureConfirmSheetInsetPx,
  measureHeroHostHeightPx,
  measurePayConfirmNavReservePx,
} from "@/features/payBill/components/PaymentConfirmationScreen/paymentConfirmationLayout"
import { MOTION_PUSH_S } from "@/shared/motion"
import { motionReduced } from "@/shared/motion/motionHelpers"

export type PaymentConfirmationPhase = "celebration" | "revealed"

const ENTRANCE_S = MOTION_PUSH_S
const HOLD_AFTER_ENTRANCE_S = 2
const SHEET_IN_S = 0.75
const HERO_MORPH_S = 0.75
const SETUP_MAX_ATTEMPTS = 8

/** Celebration checkmark layout size (asset is 180px). */
export const PAY_SUCCESS_CHECKMARK_START_PX = 180

/** Final checkmark size once summary sheet is visible (Figma `15823:25350`). */
export const PAY_SUCCESS_CHECKMARK_FINAL_PX = 100

function forceReflow(el: HTMLElement): void {
  void el.offsetHeight
}

function applyCheckmarkSize(imgWrap: HTMLElement, px: number): void {
  gsap.set(imgWrap, {
    width: px,
    height: px,
    scale: 1,
    transformOrigin: "50% 50%",
    force3D: true,
  })
}

function heroExpandedHeightPx(heroBand: HTMLElement, navTopPx: number): number {
  const hostH = measureHeroHostHeightPx(heroBand)
  return Math.max(0, Math.round(hostH - navTopPx))
}

function heroAboveSheetHeightPx(
  heroBand: HTMLElement,
  navTopPx: number,
  sheetInsetPx: number,
): number {
  const hostH = measureHeroHostHeightPx(heroBand)
  return Math.max(0, heroBandHeightForSheetInset(hostH, sheetInsetPx) - navTopPx)
}

/** Pin hero below nav with explicit height so flex centering works before layout settles. */
function applyHeroBandExpanded(heroBand: HTMLElement, navTopPx: number): void {
  gsap.set(heroBand, {
    left: 0,
    right: 0,
    top: navTopPx,
    bottom: "auto",
    height: heroExpandedHeightPx(heroBand, navTopPx),
    width: "100%",
  })
}

/** Pin hero bottom to sheet top with explicit height. */
function applyHeroBandAboveSheet(
  heroBand: HTMLElement,
  navTopPx: number,
  sheetInsetPx: number,
): void {
  gsap.set(heroBand, {
    left: 0,
    right: 0,
    top: navTopPx,
    bottom: "auto",
    height: heroAboveSheetHeightPx(heroBand, navTopPx, sheetInsetPx),
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

function applyRevealedState(
  heroBand: HTMLElement,
  navTopPx: number,
  imgWrap: HTMLElement,
  title: HTMLElement,
  sheet: HTMLElement,
): void {
  applyHeroBandAboveSheet(heroBand, navTopPx, measureSheetInset(sheet))
  gsap.set(sheet, { yPercent: 0 })
  applyCheckmarkSize(imgWrap, PAY_SUCCESS_CHECKMARK_FINAL_PX)
  gsap.set(imgWrap, { opacity: 1, y: 0 })
  gsap.set(title, { autoAlpha: 1 })
}

export interface UsePaymentConfirmationRevealArgs {
  rootRef: RefObject<HTMLElement | null>
  heroBandRef: RefObject<HTMLElement | null>
  imgWrapRef: RefObject<HTMLElement | null>
  titleRef: RefObject<HTMLElement | null>
  sheetRef: RefObject<HTMLElement | null>
  /** Skip celebration timeline — open directly on summary (revisit from paid offer banner). */
  startRevealed?: boolean
}

export interface UsePaymentConfirmationRevealResult {
  phase: PaymentConfirmationPhase
}

/**
 * Large centered check on green → hold → sheet up + hero band compresses →
 * checkmark scales down; title stays visible and moves up with the hero cluster.
 */
export function usePaymentConfirmationReveal({
  rootRef,
  heroBandRef,
  imgWrapRef,
  titleRef,
  sheetRef,
  startRevealed = false,
}: UsePaymentConfirmationRevealArgs): UsePaymentConfirmationRevealResult {
  const [phase, setPhase] = useState<PaymentConfirmationPhase>(
    startRevealed ? "revealed" : "celebration",
  )

  useLayoutEffect(() => {
    let cancelled = false
    let ctx: gsap.Context | null = null
    let resizeObserver: ResizeObserver | null = null
    let headerObserver: ResizeObserver | null = null
    let raf = 0

    const clearNodes = () => {
      const heroBand = heroBandRef.current
      const sheet = sheetRef.current
      const imgWrap = imgWrapRef.current
      const title = titleRef.current
      if (heroBand) {
        gsap.set(heroBand, { clearProps: "left,right,top,bottom,height,width" })
      }
      if (sheet) gsap.set(sheet, { clearProps: "all" })
      if (imgWrap) gsap.set(imgWrap, { clearProps: "all" })
      if (title) gsap.set(title, { clearProps: "all" })
    }

    const applyFallbackRevealed = (): boolean => {
      const root = rootRef.current
      const heroBand = heroBandRef.current
      const imgWrap = imgWrapRef.current
      const title = titleRef.current
      const sheet = sheetRef.current
      if (!root || !heroBand || !imgWrap || !title || !sheet) return false

      const navTopPx = measurePayConfirmNavReservePx(root)
      if (navTopPx <= 0) return false

      applyRevealedState(heroBand, navTopPx, imgWrap, title, sheet)
      queueMicrotask(() => {
        if (!cancelled) setPhase("revealed")
      })
      return true
    }

    const setup = (): boolean => {
      if (cancelled) return true

      const root = rootRef.current
      const heroBand = heroBandRef.current
      const imgWrap = imgWrapRef.current
      const title = titleRef.current
      const sheet = sheetRef.current
      if (!root || !heroBand || !imgWrap || !title || !sheet) {
        return false
      }

      const navTopPx = measurePayConfirmNavReservePx(root)
      if (navTopPx <= 0) return false

      const host = heroBand.parentElement

      const syncHeroToSheet = () => {
        if (!isSheetRevealed(sheet)) return
        applyHeroBandAboveSheet(heroBand, navTopPx, measureSheetInset(sheet))
      }

      if (startRevealed || motionReduced()) {
        applyRevealedState(heroBand, navTopPx, imgWrap, title, sheet)
        queueMicrotask(() => {
          if (!cancelled) setPhase("revealed")
        })
      } else {
        applyHeroBandExpanded(heroBand, navTopPx)
        gsap.set(sheet, { yPercent: 100 })
        gsap.set(title, { autoAlpha: 0 })
        applyCheckmarkSize(imgWrap, PAY_SUCCESS_CHECKMARK_START_PX)
        gsap.set(imgWrap, {
          opacity: 0,
          y: 44,
        })

        ctx = gsap.context(() => {
          const tl = gsap.timeline({
            onComplete: () => {
              applyHeroBandAboveSheet(heroBand, navTopPx, measureSheetInset(sheet))
              gsap.set(sheet, { yPercent: 0 })
              gsap.set(imgWrap, { clearProps: "opacity" })
              gsap.set(title, { autoAlpha: 1 })
              queueMicrotask(() => {
                if (!cancelled) setPhase("revealed")
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
            title,
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
              const targetH = heroAboveSheetHeightPx(
                heroBand,
                navTopPx,
                sheetInsetPx,
              )
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
            imgWrap,
            {
              width: PAY_SUCCESS_CHECKMARK_FINAL_PX,
              height: PAY_SUCCESS_CHECKMARK_FINAL_PX,
              y: 0,
              duration: HERO_MORPH_S,
              ease: "power2.inOut",
              force3D: true,
            },
            "sheetStart",
          )
        }, root)
      }

      resizeObserver =
        host && typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              syncHeroToSheet()
            })
          : null
      if (host) resizeObserver?.observe(host)
      resizeObserver?.observe(sheet)

      return true
    }

    const trySetupWithRetry = () => {
      if (setup()) return

      let attempts = 0
      const retry = () => {
        if (cancelled) return
        if (setup()) return
        attempts += 1
        if (attempts >= SETUP_MAX_ATTEMPTS) {
          applyFallbackRevealed()
          return
        }
        raf = window.requestAnimationFrame(retry)
      }
      raf = window.requestAnimationFrame(retry)
    }

    trySetupWithRetry()

    const root = rootRef.current
    const header = root?.querySelector("header")
    if (header && typeof ResizeObserver !== "undefined") {
      headerObserver = new ResizeObserver(() => {
        if (cancelled || ctx != null) return
        if (setup()) {
          headerObserver?.disconnect()
        }
      })
      headerObserver.observe(header)
    }

    return () => {
      cancelled = true
      window.cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      headerObserver?.disconnect()
      ctx?.revert()
      clearNodes()
    }
  }, [rootRef, heroBandRef, imgWrapRef, titleRef, sheetRef, startRevealed])

  return { phase }
}
