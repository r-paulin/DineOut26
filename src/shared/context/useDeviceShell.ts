import { useContext } from "react"
import { DeviceShellContext, type DeviceShellContextValue } from "./deviceShellContext"

export function useDeviceShell(): DeviceShellContextValue {
  return useContext(DeviceShellContext)
}
