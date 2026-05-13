import { DeviceFrame } from "@/shared/components"
import { SnackbarProvider } from "@/shared/snackbar"
import { HomePage } from "@/pages"

export const App = () => (
  <div className="min-h-dvh flex justify-center items-stretch bg-special-brand-alt">
    <DeviceFrame>
      <SnackbarProvider placement="bottom-center">
        <HomePage />
      </SnackbarProvider>
    </DeviceFrame>
  </div>
)
