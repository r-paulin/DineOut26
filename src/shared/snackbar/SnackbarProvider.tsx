import { createContext, useContext, useMemo, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import { Toaster, toast } from "sonner"
import { DeviceShellContext } from "@/shared/context/deviceShellContext"
import { Z_SNACKBAR_TOASTER } from "@/features/restaurant/constants/screenLayers"
import { SnackbarInsetController } from "@/shared/snackbar/SnackbarInsetContext"
import {
  SNACKBAR_SCREEN_MARGIN_BOTTOM_PX,
  SNACKBAR_SCREEN_MARGIN_X_PX,
} from "@/shared/snackbar/snackbarInset"
import { SnackbarToast } from "@/shared/snackbar/SnackbarToast"
import type {
  SnackbarContent,
  SnackbarProviderProps,
  SnackbarState,
} from "@/shared/snackbar/snackbar.types"

const SnackbarContext = createContext<SnackbarState | null>(null)

export function useSnackbar(): SnackbarState {
  const ctx = useContext(SnackbarContext)
  if (!ctx) {
    throw new Error("useSnackbar must be used within SnackbarProvider")
  }
  return ctx
}

/**
 * App snackbars: `--snackbar-bottom-inset` + screen margins (see `index.css`),
 * GSAP entry/exit on the panel ({@link SnackbarToast}), Sonner for stacking only.
 * Toaster is portaled into {@link DeviceShellContext} `portalRoot` so `position: fixed`
 * shares the device shell containing block (same as pay flow / footer anchors).
 */
export function SnackbarProvider({
  children,
  maxVisibleSnackbars = 3,
  placement = "bottom-center",
  expand = false,
}: SnackbarProviderProps) {
  const { portalRoot } = useContext(DeviceShellContext)
  const toasterHost =
    portalRoot ?? (typeof document !== "undefined" ? document.body : null)

  const value = useMemo<SnackbarState>(
    () => ({
      add(content: SnackbarContent) {
        return toast.custom((t) => <SnackbarToast id={t} content={content} />, {
          duration: Number.POSITIVE_INFINITY,
          dismissible: false,
          classNames: {
            toast: "dineout-snackbar-host !w-full !max-w-none",
            content: "!m-0 !w-full !max-w-full !gap-0 !p-0",
            title: "!m-0 !w-full !p-0",
          },
        })
      },
      remove(id) {
        toast.dismiss(id)
      },
    }),
    [],
  )

  const toaster = (
    <Toaster
      className="dineout-snackbar-toaster"
      style={
        {
          zIndex: Z_SNACKBAR_TOASTER,
          ["--z-snackbar-toaster"]: String(Z_SNACKBAR_TOASTER),
        } as CSSProperties
      }
      visibleToasts={maxVisibleSnackbars}
      position={placement}
      expand={expand}
      theme="system"
      offset={{
        left: SNACKBAR_SCREEN_MARGIN_X_PX,
        right: SNACKBAR_SCREEN_MARGIN_X_PX,
        bottom: SNACKBAR_SCREEN_MARGIN_BOTTOM_PX,
      }}
      mobileOffset={{
        left: SNACKBAR_SCREEN_MARGIN_X_PX,
        right: SNACKBAR_SCREEN_MARGIN_X_PX,
        bottom: SNACKBAR_SCREEN_MARGIN_BOTTOM_PX,
      }}
      toastOptions={{
        unstyled: true,
      }}
    />
  )

  return (
    <SnackbarContext.Provider value={value}>
      <SnackbarInsetController>
        {toasterHost ? createPortal(toaster, toasterHost) : null}
        {children}
      </SnackbarInsetController>
    </SnackbarContext.Provider>
  )
}
