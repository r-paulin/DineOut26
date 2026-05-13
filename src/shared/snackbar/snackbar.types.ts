export interface SnackbarContent {
  title?: string
  /** Main message (required for parity with legacy Kalep snackbar API). */
  description: string
  actions?: Array<{
    label: string
    onClick: () => void
  }>
  dismissible?: boolean
  /** Auto-dismiss delay in ms. Omit or `Infinity` to keep open until user dismisses. */
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
