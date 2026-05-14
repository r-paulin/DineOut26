import { Typography } from "@bolteu/kalep-react"
import gsap from "gsap"
import { useLayoutEffect, useRef } from "react"
import savedTicketUrl from "@/features/payBill/assets/pay-bill-saved-ticket.svg"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import { payBillSavedTicketAmountStyle } from "@/features/payBill/utils/payBillNumericDisplay"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export interface PayBillSavedBadgeProps {
  /** Total savings vs subtotal (receipt + tip), in major EUR. */
  savedAmountEur: number
}

const TICKET_ROTATION_END = -4

/**
 * Figma Bill / ImageRow — ticket graphic with “Saved” + savings amount (−4° tilt).
 * Entry: GSAP pop-in so savings reads clearly (respects reduced motion).
 */
export function PayBillSavedBadge({ savedAmountEur }: PayBillSavedBadgeProps) {
  const ticketRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ticketRef.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el, {
        rotation: TICKET_ROTATION_END,
        scale: 1,
        opacity: 1,
        transformOrigin: "50% 50%",
      })
      return () => {
        gsap.killTweensOf(el)
      }
    }

    gsap.killTweensOf(el)
    gsap.set(el, {
      rotation: -16,
      scale: 0.86,
      opacity: 0,
      transformOrigin: "50% 50%",
    })
    const tween = gsap.to(el, {
      rotation: TICKET_ROTATION_END,
      scale: 1,
      opacity: 1,
      duration: 0.62,
      ease: "back.out(1.35)",
    })
    return () => {
      tween.kill()
      gsap.killTweensOf(el)
    }
  }, [savedAmountEur])

  return (
    <div className="relative mx-auto flex h-[78px] w-[120px] shrink-0 items-center justify-center">
      <div
        ref={ticketRef}
        className="relative h-[78px] w-[120px] will-change-transform"
      >
        <img
          src={savedTicketUrl}
          alt=""
          className="pointer-events-none absolute inset-0 size-full max-h-none max-w-none object-contain"
          draggable={false}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0 px-3 py-0 text-center leading-none">
          <Typography
            variant="body-m-regular"
            color="secondary"
            as="span"
            align="center"
            inlineStyle={{
              lineHeight: 1,
              fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
            }}
          >
            Saved
          </Typography>
          <span
            className="m-0 block text-center leading-none text-primary"
            style={{
              ...payBillSavedTicketAmountStyle,
              lineHeight: 1,
            }}
          >
            {formatEurMajor(savedAmountEur)}
          </span>
        </div>
      </div>
    </div>
  )
}
