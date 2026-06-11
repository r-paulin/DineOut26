export interface SnackbarContent {
  title?: string
  /** Main message (required for parity with legacy Kalep snackbar API). */
  description: string
  /** Secondary line color when a {@link title} is shown. Defaults to primary-inverted. */
  descriptionColor?: "primary-inverted" | "secondary-inverted"
  actions?: Array<{
    label: string
    onClick: () => void
  }>
  /** Show close (X) control. Default true. */
  showCloseButton?: boolean
  /** Allow swipe-to-dismiss (Sonner). Default true unless legacy `dismissible: false`. */
  swipeToDismiss?: boolean
  /**
   * @deprecated Prefer `showCloseButton` / `swipeToDismiss`. When false, disables swipe only.
   */
  dismissible?: boolean
  /** Auto-dismiss delay in ms. Defaults to 5000 when omitted. */
  timeout?: number
}

export interface SnackbarState {
  add: (content: SnackbarContent) => string | number
  remove: (id: string | number) => void
}

export type SnackbarPlacement =
  | "bottom-left"
  | "bottom-right"
  | "bottom-center"
  | "top-left"
  | "top-right"
  | "top-center"

export interface SnackbarProviderProps {
  children: React.ReactNode
  maxVisibleSnackbars?: number
  placement?: SnackbarPlacement
  expand?: boolean
}
