/** Pixels to translate a panel fully off-screen to the right (GSAP `x`). */
export function slideOffScreenXPx(
  panel: HTMLElement,
  root: HTMLElement | null,
): number {
  const pw = panel.getBoundingClientRect().width
  if (pw > 1) return pw
  const rw = root?.getBoundingClientRect().width ?? 0
  if (rw > 1) return rw
  return typeof window !== "undefined" ? window.innerWidth : 400
}
