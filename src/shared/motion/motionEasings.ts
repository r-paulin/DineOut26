import "./registerMotion"
import { CustomEase } from "gsap/CustomEase"

/** Apple-style emphasized deceleration (enter / snap open). */
export const EASE_EMPHASIZED_ENTER = CustomEase.create(
  "motionEmphasizedEnter",
  "M0,0,C0.32,0.72,0,1,1,1",
)

/** Emphasized acceleration (exit / dismiss). */
export const EASE_EMPHASIZED_EXIT = CustomEase.create(
  "motionEmphasizedExit",
  "M0,0,C0.58,0,0.92,0.36,1,1",
)

/** Sheet dismiss variant (matches legacy promo out). */
export const EASE_SHEET_DISMISS = CustomEase.create(
  "motionSheetDismiss",
  "M0,0,C0.4,0,1,1,1,1",
)

export const EASE_STANDARD_OUT = "power2.out" as const
export const EASE_STANDARD_IN = "power2.in" as const
