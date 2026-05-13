import type { CSSProperties, ReactNode } from "react"
import { DeviceShellOutlet } from "@/shared/context/DeviceShellOutlet"

export interface DeviceFrameProps {
  children: ReactNode
  /**
   * When true, hide the iPhone bezel + side buttons regardless of viewport.
   * Defaults to true when the app runs inside an iframe (e.g. Bolt's Showcase
   * already provides its own device chrome).
   */
  passthrough?: boolean
}

const inIframe = typeof window !== "undefined" && window.self !== window.top

/* Pixel-precise bezel + button positions from Figma node 15852:12914
 * ("Wrapper of the App", 464.26 x 923.26). Inline because the values
 * carry no semantic meaning — they're just Figma coordinates.
 */
const outerBezelStyle: CSSProperties = {
  left: "0.9825rem",
  top: "0.9825rem",
  width: "27.0513rem",
  height: "55.7388rem",
  borderRadius: "3.6745rem",
  background: "var(--device-bezel-outer)",
  boxShadow: "inset 0 0 0.262rem rgba(0, 0, 0, 0.51)",
}

const innerBezelStyle: CSSProperties = {
  left: "1.4413rem",
  top: "1.4413rem",
  width: "26.1344rem",
  height: "54.8219rem",
  borderRadius: "3.3994rem",
  background: "var(--device-bezel-inner)",
}

const sideButtonBase: CSSProperties = {
  left: "0.655rem",
  width: "0.8515rem",
  borderRadius: "0.1572rem",
  background: "var(--device-bezel-outer)",
  boxShadow: "inset 0 0 0.262rem rgba(0, 0, 0, 0.51)",
}

const btnVolUpStyle: CSSProperties = {
  ...sideButtonBase,
  top: "13.0344rem",
  height: "2.751rem",
}

const btnVolDownStyle: CSSProperties = {
  ...sideButtonBase,
  top: "17.8163rem",
  height: "4.454rem",
}

const btnPowerStyle: CSSProperties = {
  ...sideButtonBase,
  top: "23.4488rem",
  height: "4.454rem",
}

/**
 * Renders the app inside an iPhone-style bezel on viewports >= 768px and as a
 * full-bleed pass-through below that breakpoint. The screen element uses
 * `transform: translateZ(0)` so it becomes the containing block for any
 * `position: fixed` descendant (BottomNav, BottomSheet, SearchPanel, etc.) —
 * do not remove that transform without re-checking those overlays.
 *
 * `DeviceShellOutlet` exposes `portalRoot` so modal layers (e.g. Kalep BottomSheet)
 * portal inside this node on desktop; below `md` the outlet is full viewport width.
 */
export function DeviceFrame({
  children,
  passthrough = inIframe,
}: DeviceFrameProps) {
  if (passthrough) {
    return (
      <DeviceShellOutlet className="w-full min-h-dvh bg-layer-floor-1">
        {children}
      </DeviceShellOutlet>
    )
  }
  return (
    <div className="w-full min-h-dvh md:relative md:flex-none md:self-center md:w-[29.0163rem] md:h-[57.7038rem] md:min-h-0">
      <div
        className="hidden md:block absolute pointer-events-none"
        style={outerBezelStyle}
        aria-hidden
      />
      <div
        className="hidden md:block absolute pointer-events-none"
        style={innerBezelStyle}
        aria-hidden
      />
      <div
        className="hidden md:block absolute pointer-events-none"
        style={btnVolUpStyle}
        aria-hidden
      />
      <div
        className="hidden md:block absolute pointer-events-none"
        style={btnVolDownStyle}
        aria-hidden
      />
      <div
        className="hidden md:block absolute pointer-events-none"
        style={btnPowerStyle}
        aria-hidden
      />
      <DeviceShellOutlet className="w-full min-h-dvh bg-layer-floor-1 md:absolute md:left-1/2 md:top-1/2 md:w-[var(--device-screen-w)] md:h-[var(--device-screen-h)] md:min-h-0 md:rounded-[var(--device-screen-radius)] md:overflow-hidden md:[transform:translate(-50%,-50%)_translateZ(0)]">
        {children}
      </DeviceShellOutlet>
    </div>
  )
}
