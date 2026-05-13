import type { NumpadKey } from "@/features/payBill/utils/billAmount"
import Delete from "@bolteu/kalep-react-icons/dist/Delete"
import gsap from "gsap"
import { useCallback, useRef } from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

const KEYS: NumpadKey[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "backspace"],
]

export interface NumpadProps {
  onKey: (key: NumpadKey) => void
}

/**
 * 3×4 digit grid + decimal + backspace. Scale press feedback (PRD).
 */
export function Numpad({ onKey }: NumpadProps) {
  return (
    <div className="grid h-[286px] w-full grid-cols-3 grid-rows-4 gap-0 px-6 pb-safe">
      {KEYS.flat().map((k) => (
        <NumpadCell key={k} k={k} onKey={onKey} />
      ))}
    </div>
  )
}

function NumpadCell({
  k,
  onKey,
}: {
  k: NumpadKey
  onKey: (key: NumpadKey) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const press = useCallback(() => {
    const el = ref.current
    if (!el) {
      onKey(k)
      return
    }
    if (prefersReducedMotion()) {
      onKey(k)
      return
    }
    gsap.killTweensOf(el)
    gsap
      .timeline()
      .to(el, { scale: 0.95, duration: 0.05, ease: "power2.out" })
      .to(el, {
        scale: 1,
        duration: 0.1,
        ease: "power2.out",
        onComplete: () => onKey(k),
      })
  }, [k, onKey])

  const isBack = k === "backspace"
  return (
    <button
      ref={ref}
      type="button"
      className="flex h-full w-full items-center justify-center rounded-xl border-none bg-transparent text-primary outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
      style={{ touchAction: "manipulation" }}
      onClick={press}
      aria-label={isBack ? "Backspace" : k === "." ? "Decimal" : `Digit ${k}`}
    >
      {isBack ?
        <Delete size="lg" className="text-primary" aria-hidden />
      : (
        <span
          className="[font-variation-settings:'wght'_var(--font-weight-semibold)] text-[28px] leading-8"
          style={{ fontFamily: "var(--font-family)" }}
        >
          {k === "." ? "," : k}
        </span>
      )}
    </button>
  )
}
