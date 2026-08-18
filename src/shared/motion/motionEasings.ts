import "./registerMotion"
import { CustomEase } from "gsap/CustomEase"

/** iOS sheet / UIView spring-out (Vaul + UISheetPresentationController). */
export const EASE_IOS_SHEET_CSS = "cubic-bezier(0.32, 0.72, 0, 1)" as const

/** Gentler ease-in than the old emphasized-exit punch. */
export const EASE_IOS_SHEET_DISMISS_CSS = "cubic-bezier(0.32, 0, 0.67, 0)" as const

/** Apple-style emphasized deceleration (enter / snap open). */
export const EASE_EMPHASIZED_ENTER = CustomEase.create(
  "motionEmphasizedEnter",
  "M0,0,C0.32,0.72,0,1,1,1",
)

/** Page/modal exit — ease-in without a hard snap. */
export const EASE_EMPHASIZED_EXIT = CustomEase.create(
  "motionEmphasizedExit",
  "M0,0,C0.32,0,0.67,0,1,1",
)

/** Sheet dismiss — same iOS sheet curve as present (Vaul default). */
export const EASE_SHEET_DISMISS = CustomEase.create(
  "motionSheetDismiss",
  "M0,0,C0.32,0.72,0,1,1,1",
)

export const EASE_STANDARD_OUT = "power2.out" as const
export const EASE_STANDARD_IN = "power2.in" as const
