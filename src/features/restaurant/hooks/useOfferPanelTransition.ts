import gsap from "gsap"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefCallback,
} from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

const OUT_DURATION = 0.22
const IN_DURATION = 0.4
const IN_DELAY = 0.08
const IN_STAGGER = 0.07
const OUT_STAGGER = 0.04

export interface UseOfferPanelTransitionResult {
  /**
   * Ref callback for an individual offer card inside a tab panel. Provide a
   * stable `tabId` + per-tab `idx` so the hook can target each card.
   */
  registerCardRef: (tabId: string, idx: number) => RefCallback<HTMLElement>
}

/**
 * Drives the per-offer-card entrance / exit animation when the active offer
 * date tab changes. The full left↔right travel is owned by the panel-level
 * CSS slide (cards inherit that horizontal motion). This hook layers a
 * staggered **opacity** fade on the outgoing and incoming cards. The stagger
 * direction matches the swipe direction so the cascade reads as motion from
 * left ➜ right (forward) or right ➜ left (backward).
 *
 * Honours `prefers-reduced-motion`: tweens are skipped, cards left at rest.
 */
export function useOfferPanelTransition(
  activeTabId: string,
  tabIds: readonly string[],
): UseOfferPanelTransitionResult {
  const cardRefs = useRef<Map<string, HTMLElement[]>>(new Map())
  const prevActiveIdRef = useRef<string>(activeTabId)
  const isFirstRunRef = useRef(true)

  const tabIdsRef = useRef(tabIds)
  useEffect(() => {
    tabIdsRef.current = tabIds
  })

  const registerCardRef = useCallback(
    (tabId: string, idx: number): RefCallback<HTMLElement> =>
      (el) => {
        const arr = cardRefs.current.get(tabId) ?? []
        if (el) {
          arr[idx] = el
        } else {
          delete arr[idx]
        }
        cardRefs.current.set(tabId, arr)
      },
    [],
  )

  useLayoutEffect(() => {
    const prevId = prevActiveIdRef.current
    prevActiveIdRef.current = activeTabId

    if (isFirstRunRef.current) {
      isFirstRunRef.current = false
      return
    }
    if (prevId === activeTabId) return

    const outCards = (cardRefs.current.get(prevId) ?? []).filter(
      Boolean,
    ) as HTMLElement[]
    const inCards = (cardRefs.current.get(activeTabId) ?? []).filter(
      Boolean,
    ) as HTMLElement[]

    gsap.killTweensOf([...outCards, ...inCards])

    if (prefersReducedMotion()) {
      if (outCards.length) gsap.set(outCards, { opacity: 1 })
      if (inCards.length) gsap.set(inCards, { opacity: 1 })
      return
    }

    const tabIdsNow = tabIdsRef.current
    const prevIdx = tabIdsNow.indexOf(prevId)
    const newIdx = tabIdsNow.indexOf(activeTabId)
    // dir === 1 → swiping forward (panel slides right ➜ left, new tab from right).
    // dir === -1 → swiping backward (panel slides left ➜ right, new tab from left).
    const dir = newIdx >= prevIdx ? 1 : -1

    if (outCards.length) {
      gsap.to(outCards, {
        opacity: 0,
        duration: OUT_DURATION,
        ease: "power2.in",
        stagger: { each: OUT_STAGGER, from: dir === 1 ? "end" : "start" },
        overwrite: "auto",
      })
    }

    if (inCards.length) {
      gsap.fromTo(
        inCards,
        { opacity: 0 },
        {
          opacity: 1,
          duration: IN_DURATION,
          ease: "power3.out",
          stagger: { each: IN_STAGGER, from: dir === 1 ? "start" : "end" },
          delay: IN_DELAY,
          overwrite: "auto",
        },
      )
    }
  }, [activeTabId])

  useEffect(() => {
    const map = cardRefs.current
    return () => {
      const all: HTMLElement[] = []
      map.forEach((arr) => {
        arr.forEach((el) => {
          if (el) all.push(el)
        })
      })
      if (all.length) gsap.killTweensOf(all)
    }
  }, [])

  return { registerCardRef }
}
