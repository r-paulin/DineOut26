import { useEffect, type RefObject } from "react"

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => {
      if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") {
        return false
      }
      if (el.inert) return false
      const style = getComputedStyle(el)
      if (style.visibility === "hidden" || style.display === "none") return false
      if (Number(style.opacity) === 0) return false
      return true
    },
  )
}

export interface UseModalOverlayLockOptions {
  active: boolean
  containerRef: RefObject<HTMLElement | null>
  onEscape?: () => void
  /** When false, trap Tab but do not move focus into the container yet. Default true. */
  autoFocus?: boolean
}

/**
 * Locks body scroll and traps Tab focus within `containerRef` while `active`.
 */
export function useModalOverlayLock({
  active,
  containerRef,
  onEscape,
  autoFocus = true,
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

    if (autoFocus) {
      const focusables = getFocusableElements(root)
      focusables[0]?.focus({ preventScroll: true })
    }

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
  }, [active, autoFocus, containerRef])
}
