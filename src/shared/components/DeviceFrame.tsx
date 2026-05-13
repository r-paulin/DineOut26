import type { CSSProperties, ReactNode } from "react"
import { useLayoutEffect, useState } from "react"
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

/** Matches `md:w` / `md:h` on the bezel wrapper (Figma “Wrapper of the App”). */
const FRAME_W_REM = 29.0163
const FRAME_H_REM = 57.7038
const MD_MIN_WIDTH_PX = 768
const VIEWPORT_FIT_PADDING_PX = 48

type DesktopFit = {
  isDesktop: boolean
  scale: number
  slotW: number
  slotH: number
}

function readDesktopFit(): DesktopFit {
  if (typeof window === "undefined") {
    return { isDesktop: false, scale: 1, slotW: 0, slotH: 0 }
  }
  const innerW = window.innerWidth
  if (innerW < MD_MIN_WIDTH_PX) {
    return { isDesktop: false, scale: 1, slotW: 0, slotH: 0 }
  }
  const rem =
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const frameW = FRAME_W_REM * rem
  const frameH = FRAME_H_REM * rem
  const vv = window.visualViewport
  const vw = vv?.width ?? innerW
  const vh = vv?.height ?? window.innerHeight
  const pad = VIEWPORT_FIT_PADDING_PX
  const raw = Math.min(1, (vw - pad) / frameW, (vh - pad) / frameH)
  const scale = Number.isFinite(raw) ? Math.max(0.3, raw) : 1
  return {
    isDesktop: true,
    scale,
    slotW: frameW * scale,
    slotH: frameH * scale,
  }
}

function useDesktopDeviceFrameFit(): DesktopFit {
  const [fit, setFit] = useState<DesktopFit>(() => readDesktopFit())

  useLayoutEffect(() => {
    const update = () => {
      setFit(readDesktopFit())
    }
    update()
    window.addEventListener("resize", update)
    window.visualViewport?.addEventListener("resize", update)
    window.visualViewport?.addEventListener("scroll", update)
    return () => {
      window.removeEventListener("resize", update)
      window.visualViewport?.removeEventListener("resize", update)
      window.visualViewport?.removeEventListener("scroll", update)
    }
  }, [])

  return fit
}

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
 *
 * On desktop, the frame scales down with `transform: scale()` when the window is
 * shorter or narrower than the physical bezel so the whole device stays in view.
 */
export function DeviceFrame({
  children,
  passthrough = inIframe,
}: DeviceFrameProps) {
  const fit = useDesktopDeviceFrameFit()

  if (passthrough) {
    return (
      <DeviceShellOutlet className="w-full min-h-dvh bg-layer-floor-1">
        {children}
      </DeviceShellOutlet>
    )
  }

  const slotStyle: CSSProperties | undefined =
    fit.isDesktop && fit.slotW > 0 && fit.slotH > 0
      ? { width: fit.slotW, height: fit.slotH }
      : undefined

  const frameRootStyle: CSSProperties | undefined = fit.isDesktop
    ? {
        transform: `scale(${fit.scale})`,
        transformOrigin: "top left",
      }
    : undefined

  return (
    <div className="w-full min-h-dvh md:flex md:items-center md:justify-center">
      <div
        className="relative w-full min-h-dvh shrink-0 md:min-h-0"
        style={slotStyle}
      >
        <div
          className="relative w-full min-h-dvh md:absolute md:left-0 md:top-0 md:w-[29.0163rem] md:h-[57.7038rem] md:min-h-0"
          style={frameRootStyle}
        >
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
      </div>
    </div>
  )
}
