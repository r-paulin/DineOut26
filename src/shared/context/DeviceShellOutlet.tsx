import {
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import { DeviceShellContext } from "./deviceShellContext"

export type DeviceShellOutletProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

/**
 * Provides `portalRoot` for components that portal (e.g. Kalep modal BottomSheet)
 * so on desktop overlays render inside the phone frame instead of `document.body`.
 */
export function DeviceShellOutlet({
  children,
  className = "",
  ...rest
}: DeviceShellOutletProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  const value = useMemo(() => ({ portalRoot }), [portalRoot])

  return (
    <DeviceShellContext.Provider value={value}>
      <div
        ref={setPortalRoot}
        className={["__kalep", className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </div>
    </DeviceShellContext.Provider>
  )
}
