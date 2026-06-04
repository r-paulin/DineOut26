import gsap from "gsap"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export function motionReduced(): boolean {
  return prefersReducedMotion()
}

export function killMotionTargets(targets: gsap.TweenTarget): void {
  gsap.killTweensOf(targets)
}

export function sheetHeightPx(el: HTMLElement | null): number {
  if (!el) return Math.round(window.innerHeight * 0.5)
  return el.offsetHeight || Math.round(window.innerHeight * 0.5)
}
