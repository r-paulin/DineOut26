import gsap from "gsap"
import { useLayoutEffect, useRef, type RefObject } from "react"
import { flushSync } from "react-dom"
import {
  EASE_EMPHASIZED_ENTER,
  EASE_EMPHASIZED_EXIT,
  MOTION_CHECK_IN_TO_PAY_DELAY_S,
  MOTION_IN_PAGE_S,
  MOTION_MICRO_S,
  motionReduced,
} from "@/shared/motion"

const STEP_PAD_Y_PX = 12

/**
 * Check-in transition (Figma `19867:37819` → `19867:38029`).
 *
 * Phase 1 — one height owner for the PIN slot; step 1 crossfades via opacity
 *           while the step stack morphs with a single height tween.
 * Phase 2 — 400ms beat, then unlock pay via React class; CSS transition-colors
 *           morphs the fill (no GSAP backgroundColor / class fight).
 */
export function useClaimedOfferCheckInTransition(
  checkedIn: boolean,
  checkInCardSlot: RefObject<HTMLElement | null>,
  checkInCard: RefObject<HTMLElement | null>,
  step1Stack: RefObject<HTMLElement | null>,
  step1Pending: RefObject<HTMLElement | null>,
  step1Done: RefObject<HTMLElement | null>,
  payCard: RefObject<HTMLElement | null>,
  onSettled: (checkedIn: boolean) => void,
): void {
  const prevCheckedInRef = useRef<boolean | null>(null)

  useLayoutEffect(() => {
    const slot = checkInCardSlot.current
    const card = checkInCard.current
    const stack = step1Stack.current
    const pending = step1Pending.current
    const done = step1Done.current
    const pay = payCard.current
    if (!pending || !done || !stack) return

    const reduced = motionReduced()
    const prev = prevCheckedInRef.current
    prevCheckedInRef.current = checkedIn

    const setSettled = (isCheckedIn: boolean) => {
      // Hide the inactive row before clearing absolute positioning so both
      // never contribute to document flow in the same frame.
      gsap.set(pending, {
        display: isCheckedIn ? "none" : "flex",
        autoAlpha: isCheckedIn ? 0 : 1,
        visibility: isCheckedIn ? "hidden" : "visible",
        position: "relative",
        left: "auto",
        right: "auto",
        top: "auto",
        width: "auto",
        height: "auto",
        clearProps: "margin,paddingTop,paddingBottom,overflow",
      })
      gsap.set(done, {
        display: isCheckedIn ? "flex" : "none",
        autoAlpha: isCheckedIn ? 1 : 0,
        visibility: isCheckedIn ? "visible" : "hidden",
        position: "relative",
        left: "auto",
        right: "auto",
        top: "auto",
        width: "auto",
        height: "auto",
        clearProps: "margin,paddingTop,paddingBottom,overflow",
      })
      gsap.set(stack, { height: "auto", clearProps: "overflow" })

      if (slot) {
        gsap.set(slot, {
          height: "auto",
          paddingBottom: "",
          overflow: "hidden",
          display: isCheckedIn ? "none" : "block",
          clearProps: isCheckedIn ? "height,paddingBottom" : "height",
        })
      }
      if (card) {
        gsap.set(card, {
          autoAlpha: isCheckedIn ? 0 : 1,
          visibility: isCheckedIn ? "hidden" : "visible",
          clearProps: "transform",
        })
      }

      // Unlock React pay class before clearing any leftover GSAP props.
      flushSync(() => {
        onSettled(isCheckedIn)
      })
      if (pay) {
        gsap.set(pay, {
          clearProps: "opacity,transform",
          autoAlpha: 1,
        })
      }
    }

    if (prev === null || reduced || prev === checkedIn) {
      setSettled(checkedIn)
      return
    }

    if (!(checkedIn && prev === false) || !slot || !pay) {
      setSettled(checkedIn)
      return
    }

    // Keep Pay disabled until phase 2 unlocks via CSS transition-colors.
    onSettled(false)

    const collapseS = MOTION_IN_PAGE_S
    const fadeS = MOTION_MICRO_S
    const crossfadeS = MOTION_IN_PAGE_S
    const payColorS = MOTION_IN_PAGE_S

    const targets = [slot, card, stack, pending, done, pay].filter(Boolean)
    let settledOnComplete = false

    const ctx = gsap.context(() => {
      // All prep sets live inside the context so cleanup reverts them.
      gsap.set(slot, { display: "block", overflow: "hidden", height: "auto" })
      const slotHeight = slot.offsetHeight
      const slotPaddingBottom =
        Number.parseFloat(getComputedStyle(slot).paddingBottom) || STEP_PAD_Y_PX

      const pendingHeight = pending.offsetHeight

      // Measure done off-flow (absolute) so layout below Step 1 does not jump.
      gsap.set(done, {
        display: "flex",
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        width: "100%",
        autoAlpha: 0,
        visibility: "hidden",
        height: "auto",
      })
      const doneHeight = done.offsetHeight

      gsap.set(stack, { height: pendingHeight, overflow: "hidden" })
      gsap.set(pending, {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        width: "100%",
        display: "flex",
        autoAlpha: 1,
        visibility: "visible",
      })
      gsap.set(done, {
        visibility: "visible",
        autoAlpha: 0,
      })

      gsap.set(slot, {
        height: slotHeight,
        paddingBottom: slotPaddingBottom,
        overflow: "hidden",
        display: "block",
      })
      if (card) gsap.set(card, { autoAlpha: 1, clearProps: "transform" })

      const tl = gsap.timeline({
        onComplete: () => {
          settledOnComplete = true
          setSettled(true)
        },
      })

      // —— Phase 1a: fade PIN content (opacity only — no y vs clip fight) ——
      tl.to(
        card ?? slot,
        {
          autoAlpha: 0,
          duration: fadeS,
          ease: EASE_EMPHASIZED_EXIT,
        },
        0,
      )

      // —— Phase 1b: collapse PIN slot (sole height owner for that block) ——
      const collapseAt = fadeS * 0.45
      tl.to(
        slot,
        {
          height: 0,
          paddingBottom: 0,
          duration: collapseS,
          ease: EASE_EMPHASIZED_EXIT,
        },
        collapseAt,
      )

      // —— Phase 1c: crossfade step 1 + single stack height morph ——
      tl.to(
        pending,
        {
          autoAlpha: 0,
          duration: crossfadeS,
          ease: EASE_EMPHASIZED_EXIT,
        },
        collapseAt,
      )
      tl.to(
        done,
        {
          autoAlpha: 1,
          duration: crossfadeS,
          ease: EASE_EMPHASIZED_ENTER,
        },
        collapseAt,
      )
      tl.to(
        stack,
        {
          height: doneHeight,
          duration: crossfadeS,
          ease: EASE_EMPHASIZED_ENTER,
        },
        collapseAt,
      )

      // —— Phase 2: beat, then unlock pay class — CSS transition-colors morphs fill
      // (no GSAP backgroundColor; avoids class vs inline blink).
      tl.addLabel("payColor", `>+${MOTION_CHECK_IN_TO_PAY_DELAY_S}`)
      tl.call(
        () => {
          flushSync(() => {
            onSettled(true)
          })
        },
        undefined,
        "payColor",
      )
      // Hold so the CSS color transition can finish before settled cleanup.
      tl.to({}, { duration: payColorS }, "payColor")
    }, slot)

    return () => {
      ctx.revert()
      gsap.killTweensOf(targets)
      // Interrupt before onComplete — restore settled layout for current checkedIn.
      if (!settledOnComplete) {
        setSettled(checkedIn)
      }
    }
  }, [
    checkedIn,
    checkInCard,
    checkInCardSlot,
    onSettled,
    payCard,
    step1Done,
    step1Pending,
    step1Stack,
  ])
}
