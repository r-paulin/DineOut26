import { useEffect, type RefObject } from "react"

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
  )
}

export interface UseModalOverlayLockOptions {
  active: boolean
  containerRef: RefObject<HTMLElement | null>
  onEscape?: () => void
}

/**
 * Locks body scroll and traps Tab focus within `containerRef` while `active`.
 */
export function useModalOverlayLock({
  active,
  containerRef,
  onEscape,
}: UseModalOverlayLockOptions): void {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])

  useEffect(() => {
    if (!active || !onEscape) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, onEscape])

  useEffect(() => {
    if (!active) return
    const root = containerRef.current
    if (!root) return

    const focusables = getFocusableElements(root)
    focusables[0]?.focus({ preventScroll: true })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const nodes = getFocusableElements(root)
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    root.addEventListener("keydown", onKeyDown)
    return () => root.removeEventListener("keydown", onKeyDown)
  }, [active, containerRef])
}
