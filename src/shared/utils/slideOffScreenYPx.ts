/** Pixels to translate a panel fully off-screen below the viewport (GSAP `y`). */
export function slideOffScreenYPx(
  panel: HTMLElement,
  root: HTMLElement | null,
): number {
  const ph = panel.getBoundingClientRect().height
  if (ph > 1) return ph
  const rh = root?.getBoundingClientRect().height ?? 0
  if (rh > 1) return rh
  return typeof window !== "undefined" ? window.innerHeight : 800
}
