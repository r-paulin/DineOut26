import { useEffect, useState } from "react"

/**
 * Pixels between the bottom of the layout viewport and the bottom of the
 * visual viewport (typically the software keyboard on mobile). Use to lift
 * `position: fixed` footers with `bottom: inset` so controls stay visible.
 */
function readKeyboardBottomOverlapPx(): number {
  if (typeof window === "undefined") return 0
  const vv = window.visualViewport
  if (!vv) return 0
  return Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
}

export function useVisualViewportKeyboardBottomInset(): number {
  const [insetPx, setInsetPx] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    const update = () => {
      setInsetPx(readKeyboardBottomOverlapPx())
    }
    update()
    vv?.addEventListener("resize", update)
    vv?.addEventListener("scroll", update)
    window.addEventListener("resize", update)
    return () => {
      vv?.removeEventListener("resize", update)
      vv?.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return insetPx
}
