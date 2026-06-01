import gsap from "gsap"
import { useLayoutEffect, useRef, type RefObject } from "react"
import type { PaymentMethod } from "@/features/offers/offers.types"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

const ENTER_DURATION_S = 0.32
const EXIT_DURATION_S = 0.28
const ENTER_Y_PX = 8

/**
 * GSAP enter/exit for the claimed-offer footer cashback promo row.
 * Animates the slot wrapper height + inner banner opacity/translate.
 */
export function useClaimedOfferCashbackBanner(
  slotRef: RefObject<HTMLDivElement | null>,
  bannerRef: RefObject<HTMLDivElement | null>,
  visible: boolean,
): void {
  const visibleRef = useRef(visible)
  visibleRef.current = visible

  useLayoutEffect(() => {
    const slot = slotRef.current
    const banner = bannerRef.current
    if (!slot || !banner) return

    gsap.killTweensOf([slot, banner])

    if (prefersReducedMotion()) {
      if (visible) {
        gsap.set(slot, { height: "auto", overflow: "visible" })
        gsap.set(banner, { autoAlpha: 1, y: 0, visibility: "visible" })
      } else {
        gsap.set(slot, { height: 0, overflow: "hidden" })
        gsap.set(banner, { autoAlpha: 0, y: 0, visibility: "hidden" })
      }
      return
    }

    if (visible) {
      gsap.set(banner, { autoAlpha: 0, y: ENTER_Y_PX, visibility: "visible" })
      gsap.set(slot, { height: 0, overflow: "hidden" })

      const targetHeight = banner.offsetHeight

      const ctx = gsap.context(() => {
        gsap
          .timeline()
          .to(slot, {
            height: targetHeight,
            duration: ENTER_DURATION_S,
            ease: "power2.out",
          })
          .to(
            banner,
            {
              autoAlpha: 1,
              y: 0,
              duration: ENTER_DURATION_S,
              ease: "power2.out",
            },
            0,
          )
          .eventCallback("onComplete", () => {
            if (!visibleRef.current) return
            gsap.set(slot, { height: "auto", overflow: "visible" })
          })
      }, slot)

      return () => {
        ctx.revert()
        gsap.killTweensOf([slot, banner])
      }
    }

    const currentHeight = slot.offsetHeight || banner.offsetHeight

    gsap.set(slot, { height: currentHeight, overflow: "hidden" })

    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .to(banner, {
          autoAlpha: 0,
          y: ENTER_Y_PX,
          duration: EXIT_DURATION_S,
          ease: "power2.in",
        })
        .to(
          slot,
          {
            height: 0,
            duration: EXIT_DURATION_S,
            ease: "power2.in",
          },
          0,
        )
        .eventCallback("onComplete", () => {
          if (visibleRef.current) return
          gsap.set(banner, { visibility: "hidden" })
        })
    }, slot)

    return () => {
      ctx.revert()
      gsap.killTweensOf([slot, banner])
    }
  }, [bannerRef, slotRef, visible])
}

/** Convenience: visible when paying with Bolt DineOut in-app. */
export function isCashbackBannerVisible(paymentMethod: PaymentMethod): boolean {
  return paymentMethod === "dineout"
}
