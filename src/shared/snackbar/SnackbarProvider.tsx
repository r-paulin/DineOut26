import { createContext, useContext, useMemo } from "react"
import { Toaster, toast } from "sonner"
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
 * App snackbars: 12px horizontal inset (see `index.css` + Toaster offsets),
 * GSAP entry/exit on the panel ({@link SnackbarToast}), Sonner for stacking only.
 */
export function SnackbarProvider({
  children,
  maxVisibleSnackbars = 3,
  placement = "bottom-center",
  expand = false,
}: SnackbarProviderProps) {
  const value = useMemo<SnackbarState>(
    () => ({
      add(content: SnackbarContent) {
        const swipeOk = content.dismissible !== false
        return toast.custom((t) => <SnackbarToast id={t} content={content} />, {
          duration: Number.POSITIVE_INFINITY,
          dismissible: swipeOk,
          classNames: {
            toast: "dineout-snackbar-host",
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

  return (
    <SnackbarContext.Provider value={value}>
      <Toaster
        className="dineout-snackbar-toaster"
        visibleToasts={maxVisibleSnackbars}
        position={placement}
        expand={expand}
        theme="system"
        offset={{ left: 12, right: 12, bottom: 24 }}
        mobileOffset={{ left: 12, right: 12, bottom: 24 }}
        toastOptions={{
          unstyled: true,
        }}
      />
      {children}
    </SnackbarContext.Provider>
  )
}
