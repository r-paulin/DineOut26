import gsap from "gsap"
import { useEffect, useRef } from "react"
import type { RefObject } from "react"
import type { BillNumpadState } from "@/features/payBill/utils/billAmount"
import {
  billStateToCents,
  formatBillEditableDisplay,
} from "@/features/payBill/utils/billAmount"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

/** Soft opacity fades — out on delete, in on new digits (not aggressive). */
const FADE_OUT = 0.18
const FADE_IN = 0.28

/**
 * Bill / tip amount label: fade in when typing forward, fade out then in when deleting.
 */
export function useAnimatedBillCents(
  state: BillNumpadState,
  displayRef: RefObject<HTMLElement | null>,
  _scaleRef?: RefObject<HTMLElement | null>,
): void {
  const cents = billStateToCents(state)
  const targetDisplay = formatBillEditableDisplay(state)

  const first = useRef(true)
  const reduce = prefersReducedMotion()
  const prevCentsRef = useRef<number | null>(null)
  const prevDisplayRef = useRef<string | null>(null)
  const targetDisplayRef = useRef(targetDisplay)

  useEffect(() => {
    targetDisplayRef.current = targetDisplay
    const d = displayRef.current
    if (!d) return

    if (first.current) {
      first.current = false
      gsap.killTweensOf(d)
      gsap.set(d, { opacity: 1, clearProps: "scale,transform" })
      d.textContent = targetDisplay
      prevCentsRef.current = cents
      prevDisplayRef.current = targetDisplay
      return
    }

    if (reduce) {
      gsap.killTweensOf(d)
      d.textContent = targetDisplay
      gsap.set(d, { opacity: 1, clearProps: "scale,transform" })
      prevCentsRef.current = cents
      prevDisplayRef.current = targetDisplay
      return
    }

    const prevC = prevCentsRef.current
    const prevT = prevDisplayRef.current
    if (prevC === cents && prevT === targetDisplay) {
      return
    }

    const backward =
      prevC != null &&
      (cents < prevC ||
        (cents === prevC &&
          targetDisplay.length < (prevT?.length ?? targetDisplay.length)))

    prevCentsRef.current = cents
    prevDisplayRef.current = targetDisplay

    gsap.killTweensOf(d)

    if (backward) {
      gsap.to(d, {
        opacity: 0,
        duration: FADE_OUT,
        ease: "power1.in",
        onComplete: () => {
          if (displayRef.current !== d) return
          d.textContent = targetDisplayRef.current
          gsap.to(d, {
            opacity: 1,
            duration: FADE_IN,
            ease: "power1.out",
          })
        },
      })
    } else {
      gsap.set(d, { opacity: 0 })
      d.textContent = targetDisplayRef.current
      gsap.to(d, {
        opacity: 1,
        duration: FADE_IN,
        ease: "power1.out",
      })
    }
  }, [cents, targetDisplay, displayRef, reduce])
}
