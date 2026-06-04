import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"

let registered = false

/** Register GSAP plugins once before any motion tweens run. */
export function registerMotion(): void {
  if (registered) return
  gsap.registerPlugin(CustomEase)
  registered = true
}

registerMotion()
