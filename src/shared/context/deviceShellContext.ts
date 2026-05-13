import { createContext } from "react"

export interface DeviceShellContextValue {
  /** Root of the app shell (phone screen on desktop, full viewport on mobile). */
  portalRoot: HTMLElement | null
}

export const DeviceShellContext = createContext<DeviceShellContextValue>({
  portalRoot: null,
})
