import { Typography } from "@bolteu/kalep-react"
import gsap from "gsap"
import { useEffect, useLayoutEffect, useRef } from "react"
import paySuccessCheckmarkUrl from "@/features/payBill/assets/pay-success-checkmark-180.png"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export interface PaySuccessScreenProps {
  onAdvance: () => void
}

const ADVANCE_MS = 1200

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

/**
 * Figma PAY BILL / Success: #0C2C1C canvas, 3D checkmark PNG with GSAP entrance; auto-advances after 1.2s.
 */
export function PaySuccessScreen({ onAdvance }: PaySuccessScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const t = window.setTimeout(() => {
      onAdvance()
    }, ADVANCE_MS)
    return () => window.clearTimeout(t)
  }, [onAdvance])

  useLayoutEffect(() => {
    const root = rootRef.current
    const img = imgRef.current
    if (!root || !img) return

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(img, { scale: 1, opacity: 1 })
        return
      }
      gsap.set(img, { scale: 0.72, opacity: 0, transformOrigin: "50% 50%" })
      gsap.to(img, {
        scale: 1,
        opacity: 1,
        duration: 0.55,
        ease: "back.out(1.25)",
        delay: 0.05,
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={rootRef}
      className="flex h-[var(--app-h)] max-h-[var(--app-h)] w-full flex-col bg-[#0C2C1C]"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
        <div className="relative size-[180px] shrink-0">
          <img
            ref={imgRef}
            src={paySuccessCheckmarkUrl}
            alt=""
            width={180}
            height={180}
            draggable={false}
            className="pointer-events-none size-full max-h-[180px] max-w-[180px] object-contain"
          />
        </div>
        <Typography
          variant="heading-l-accent"
          color="primary-inverted"
          align="center"
          as="p"
          inlineStyle={{
            fontFeatureSettings: FONT_FEAT,
            fontVariationSettings: "'wght' var(--font-weight-semibold)",
          }}
        >
          Bill paid
        </Typography>
      </div>
    </div>
  )
}
